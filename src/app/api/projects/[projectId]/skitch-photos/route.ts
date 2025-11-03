import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import { uploadImage } from "@/lib/cloudinary";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await params;

    await dbConnect();

    // Verify project exists and user has access
    const project = await Project.findOne({ _id: projectId });

    if (!project || project.companyId.toString() !== session.user.companyId) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("photo") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    console.log("🔄 Uploading skitch photo to Cloudinary...");

    // Upload to Cloudinary
    const uploadResult = await uploadImage(file);

    if (!uploadResult.success) {
      console.log("❌ Cloudinary upload failed:", uploadResult.error);
      return NextResponse.json({ error: uploadResult.error }, { status: 500 });
    }

    console.log("✅ Cloudinary upload successful:", uploadResult.publicId);

    // Add skitch photo to project
    const newSkitchPhoto = {
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      uploadedBy: session.user.id,
      createdAt: new Date(),
    };

    await Project.findByIdAndUpdate(projectId, {
      $push: { skitchPhotos: newSkitchPhoto },
    });

    console.log("✅ Skitch photo saved to database");

    return NextResponse.json({
      success: true,
      message: "Skitch photo uploaded successfully",
      data: {
        url: uploadResult.url,
        publicId: uploadResult.publicId,
      },
    });
  } catch (error) {
    console.error("Upload skitch photo error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
