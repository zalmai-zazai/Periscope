import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import Area from "@/models/Area";
import LineItem from "@/models/LineItem";
import { deleteImage } from "@/lib/cloudinary";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;

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

    // console.log(`🗑️ Starting cleanup for project: ${projectId}`);

    // GET ALL AREAS FIRST
    const areas = await Area.find({ projectId });

    // DEBUG: Compare skitch vs area photo formats
    // console.log("🔍 COMPARISON DEBUG:");
    if (project.skitchPhotos && project.skitchPhotos.length > 0) {
      // console.log("Skitch photo publicId:", project.skitchPhotos[0].publicId);
    }
    if (areas[0]?.photos?.[0]) {
      const areaPhotoUrl = areas[0].photos[0];
      const urlParts = areaPhotoUrl.split("/");
      const fileName = urlParts[urlParts.length - 1];
      const extractedPublicId = fileName.split(".")[0];
      // console.log("Area photo URL:", areaPhotoUrl);
      // console.log("Extracted publicId:", extractedPublicId);
    }

    // 1. DELETE ALL AREA PHOTOS FROM CLOUDINARY
    // console.log(`📸 Cleaning up ${areas.length} areas...`);
    for (const area of areas) {
      // Delete area photos from Cloudinary
      if (area.photos && area.photos.length > 0) {
        // console.log(
        //   `🗑️ Deleting ${area.photos.length} photos from area: ${area.name}`
        // );

        for (const photoUrl of area.photos) {
          try {
            // Extract publicId from URL
            const urlParts = photoUrl.split("/");
            const fileName = urlParts[urlParts.length - 1];
            const publicId = fileName.split(".")[0];

            // console.log(`🔍 Processing area photo: ${photoUrl}`);
            // console.log(`🔍 Extracted publicId: ${publicId}`);

            // Try both with and without folder
            const publicIdWithFolder = `damagescope/${publicId}`;

            // console.log(`🔍 Trying: "${publicId}" and "${publicIdWithFolder}"`);

            // Try with folder first
            try {
              const result = await deleteImage(publicIdWithFolder);
              if (result.success) {
                // console.log(`✅ Deleted with folder: ${publicIdWithFolder}`);
              } else {
                throw new Error("Failed with folder");
              }
            } catch (error) {
              // console.log(`❌ Failed with folder, trying without...`);
              const result = await deleteImage(publicId);
              if (result.success) {
                // console.log(`✅ Deleted without folder: ${publicId}`);
              } else {
                console.log(`❌ Both methods failed for: ${publicId}`);
              }
            }
          } catch (error) {
            console.error(`❌ Error deleting area photo: ${photoUrl}`, error);
          }
        }
      }

      // Delete line items for this area
      await LineItem.deleteMany({ areaId: area._id });
      // console.log(`✅ Deleted line items for area: ${area.name}`);
    }

    // 2. DELETE ALL SKITCH PHOTOS FROM CLOUDINARY
    if (project.skitchPhotos && project.skitchPhotos.length > 0) {
      // console.log(
      //   `🗑️ Deleting ${project.skitchPhotos.length} skitch photos...`
      // );
      for (const skitchPhoto of project.skitchPhotos) {
        try {
          await deleteImage(skitchPhoto.publicId);
          // console.log(`✅ Deleted skitch photo: ${skitchPhoto.publicId}`);
        } catch (error) {
          console.error(
            `❌ Failed to delete skitch photo: ${skitchPhoto.publicId}`,
            error
          );
          // Continue with other photos even if one fails
        }
      }
    }

    // 3. DELETE ALL DATABASE RECORDS
    await Area.deleteMany({ projectId });
    await Project.deleteOne({ _id: projectId });

    // console.log(
    //   `✅ Project ${projectId} and all related data deleted successfully`
    // );

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
