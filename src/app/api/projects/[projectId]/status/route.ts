import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";

export async function PUT(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { status } = await request.json();

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    // UPDATED: Validate status value with new workflow states
    const validStatuses = [
      "draft",
      "needs_field_review",
      "field_in_progress",
      "ready_for_estimate",
      "estimating",
      "sent",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Get the project
    const project = await Project.findOne({
      _id: params.projectId,
      companyId: session.user.companyId,
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // UPDATED: Check permissions with new workflow logic
    const canChangeStatus = checkStatusPermissions(
      session.user.role,
      project.status,
      status,
      project.inspectorId.toString() === session.user.id,
      project.mitTechId?.toString() === session.user.id
    );

    if (!canChangeStatus) {
      return NextResponse.json(
        { error: "You don't have permission to change to this status" },
        { status: 403 }
      );
    }

    // UPDATED: Prepare update data with assignee clearing logic
    const updateData: any = { status };

    // NEW: Clear assignees when moving backward in workflow
    if (shouldClearAssignees(project.status, status)) {
      console.log(
        `🔄 Moving backward from ${project.status} to ${status} - clearing assignees`
      );

      if (status === "draft") {
        // Back to draft - clear all assignees
        updateData.mitTechId = null;
        updateData.estimatorId = null;
        console.log("🧹 Cleared mitTechId and estimatorId");
      } else if (status === "needs_field_review") {
        // Back to field review - clear estimator only
        updateData.estimatorId = null;
        console.log("🧹 Cleared estimatorId");
      } else if (status === "ready_for_estimate") {
        // Back to ready for estimate - clear estimator only (keep mit tech)
        updateData.estimatorId = null;
        console.log("🧹 Cleared estimatorId (kept mitTechId)");
      }
      // For other backward moves, we don't clear assignees
    }

    // Set timestamps based on status change
    const now = new Date();

    if (
      status === "needs_field_review" &&
      project.status !== "needs_field_review"
    ) {
      updateData.needsFieldReviewAt = now;
    } else if (
      status === "field_in_progress" &&
      project.status !== "field_in_progress"
    ) {
      updateData.fieldInProgressAt = now;
      // Auto-assign mitigation tech if starting field work
      if (!project.mitTechId && session.user.role === "mitigation-tech") {
        updateData.mitTechId = session.user.id;
        console.log("👷 Auto-assigned mitigation tech");
      }
    } else if (
      status === "ready_for_estimate" &&
      project.status !== "ready_for_estimate"
    ) {
      updateData.readyForEstimateAt = now;
    } else if (status === "estimating" && project.status !== "estimating") {
      updateData.estimatingAt = now;
      // Auto-assign estimator if starting estimation
      if (!project.estimatorId && session.user.role === "estimator") {
        updateData.estimatorId = session.user.id;
        console.log("📊 Auto-assigned estimator");
      }
    } else if (status === "sent" && project.status !== "sent") {
      updateData.sentAt = now;
    }

    // Update the project
    const updatedProject = await Project.findByIdAndUpdate(
      params.projectId,
      updateData,
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: `Project status updated to ${status}`,
      data: updatedProject,
    });
  } catch (error) {
    console.error("Update project status error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// NEW: Helper function to determine when to clear assignees
function shouldClearAssignees(
  currentStatus: string,
  newStatus: string
): boolean {
  const workflowOrder = [
    "draft",
    "needs_field_review",
    "field_in_progress",
    "ready_for_estimate",
    "estimating",
    "sent",
  ];

  const currentIndex = workflowOrder.indexOf(currentStatus);
  const newIndex = workflowOrder.indexOf(newStatus);

  // Return true if moving backward in workflow
  return newIndex < currentIndex;
}

// UPDATED: Helper function to check status change permissions for new workflow
function checkStatusPermissions(
  userRole: string,
  currentStatus: string,
  newStatus: string,
  isProjectOwner: boolean,
  isMitTechAssigned: boolean
): boolean {
  // Admin can do anything
  if (userRole === "admin" || userRole === "super-admin") return true;

  // Role-based permissions for new workflow
  switch (userRole) {
    case "inspector":
      // Inspectors can only submit their own draft projects for field review
      return (
        isProjectOwner &&
        currentStatus === "draft" &&
        newStatus === "needs_field_review"
      );

    case "mitigation-tech":
      // Mitigation techs can:
      // - Start field work on projects needing review
      // - Complete field work on projects they're assigned to
      return (
        (currentStatus === "needs_field_review" &&
          newStatus === "field_in_progress") ||
        (currentStatus === "field_in_progress" &&
          newStatus === "ready_for_estimate" &&
          isMitTechAssigned)
      );

    case "estimator":
      // Estimators can move projects from ready to estimating, and estimating to sent
      return (
        (currentStatus === "ready_for_estimate" &&
          newStatus === "estimating") ||
        (currentStatus === "estimating" && newStatus === "sent")
      );

    case "project-manager":
      // Project managers have same permissions as admin for status changes
      return true;

    default:
      return false;
  }
}
