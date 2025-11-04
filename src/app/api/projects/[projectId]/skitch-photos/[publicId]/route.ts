import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import { deleteImage } from "@/lib/cloudinary";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ projectId: string; publicId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, publicId } = await params;

    await dbConnect();

    // Verify project exists and user has access
    const project = await Project.findOne({ _id: projectId });

    if (!project || project.companyId.toString() !== session.user.companyId) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Find the skitch photo to delete
    const skitchPhoto = project.skitchPhotos.find(
      (photo: any) => photo.publicId === publicId
    );

    if (!skitchPhoto) {
      return NextResponse.json(
        { error: "Skitch photo not found" },
        { status: 404 }
      );
    }

    console.log("🔄 Deleting skitch photo from Cloudinary:", publicId);

    // Delete from Cloudinary
    const deleteResult = await deleteImage(publicId);

    if (!deleteResult.success) {
      console.log("❌ Cloudinary delete failed:", deleteResult.error);
      return NextResponse.json({ error: deleteResult.error }, { status: 500 });
    }

    // Remove the skitch photo from the array
    await Project.findByIdAndUpdate(projectId, {
      $pull: { skitchPhotos: { publicId: publicId } },
    });

    console.log("✅ Skitch photo deleted successfully");

    return NextResponse.json({
      success: true,
      message: "Skitch photo deleted successfully",
    });
  } catch (error) {
    console.error("Delete skitch photo error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
