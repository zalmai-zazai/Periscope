import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import dbConnect from "@/lib/mongodb";
import Area from "@/models/Area";
import { uploadImage } from "@/lib/cloudinary";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ areaId: string }> } // Add Promise wrapper
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // AWAIT THE PARAMS
    const { areaId } = await params;

    await dbConnect();

    // Verify area exists and user has access - use areaId instead of params.areaId
    const area = await Area.findOne({ _id: areaId }).populate("projectId");

    if (
      !area ||
      (area.projectId as any).companyId.toString() !== session.user.companyId
    ) {
      return NextResponse.json({ error: "Area not found" }, { status: 404 });
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

    // Upload to Cloudinary
    const uploadResult = await uploadImage(file);

    if (!uploadResult.success) {
      return NextResponse.json({ error: uploadResult.error }, { status: 500 });
    }

    // Add photo URL to area - use areaId instead of params.areaId
    await Area.findByIdAndUpdate(areaId, {
      $push: { photos: uploadResult.url },
    });

    return NextResponse.json({
      success: true,
      message: "Photo uploaded successfully",
      data: {
        url: uploadResult.url,
        publicId: uploadResult.publicId,
      },
    });
  } catch (error) {
    console.error("Upload area photo error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
