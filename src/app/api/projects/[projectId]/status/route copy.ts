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

    // Validate status value
    const validStatuses = ["draft", "submitted", "in-estimate", "completed"];
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

    // Check permissions based on role and current status
    const canChangeStatus = checkStatusPermissions(
      session.user.role,
      project.status,
      status,
      project.inspectorId.toString() === session.user.id
    );

    if (!canChangeStatus) {
      return NextResponse.json(
        { error: "You don't have permission to change to this status" },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData: any = { status };

    // Set timestamps based on status change
    if (status === "submitted" && project.status !== "submitted") {
      updateData.submittedAt = new Date();
    } else if (status === "in-estimate" && project.status !== "in-estimate") {
      updateData.estimatedAt = new Date();
      updateData.estimatorId = session.user.id;
    } else if (status === "completed" && project.status !== "completed") {
      updateData.completedAt = new Date();
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

// Helper function to check status change permissions
function checkStatusPermissions(
  userRole: string,
  currentStatus: string,
  newStatus: string,
  isProjectOwner: boolean
): boolean {
  // Admin can do anything
  if (userRole === "admin") return true;

  // Role-based permissions
  switch (userRole) {
    case "inspector":
      // Inspectors can only submit their own draft projects
      return (
        isProjectOwner && currentStatus === "draft" && newStatus === "submitted"
      );

    case "estimator":
      // Estimators can move submitted → in-estimate and in-estimate → completed
      return (
        (currentStatus === "submitted" && newStatus === "in-estimate") ||
        (currentStatus === "in-estimate" && newStatus === "completed")
      );

    case "project-manager":
      // Project managers have same permissions as admin for status changes
      return true;

    default:
      return false;
  }
}
