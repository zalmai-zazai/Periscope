import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import Area from "@/models/Area";
import LineItem from "@/models/LineItem";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> } // ⚠️ params is a Promise in App Router
) {
  try {
    const { projectId } = await params; // ✅ await params first

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Verify project exists and user has access
    const project = await Project.findOne({
      _id: projectId,
      companyId: session.user.companyId,
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Check deletion permissions
    const canDelete =
      session.user?.role === "admin" ||
      session.user?.role === "project-manager" ||
      (session.user?.role === "inspector" &&
        project.inspectorId.toString() === session.user.id &&
        project.status === "draft");

    if (!canDelete) {
      return NextResponse.json(
        { error: "You do not have permission to delete this project" },
        { status: 403 }
      );
    }

    // Delete all related data (areas and line items)
    const areas = await Area.find({ projectId });

    for (const area of areas) {
      await LineItem.deleteMany({ areaId: area._id });
    }

    await Area.deleteMany({ projectId });
    await Project.deleteOne({ _id: projectId });

    return NextResponse.json({
      success: true,
      message: "Project and all related data deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
