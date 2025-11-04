import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import dbConnect from "@/lib/mongodb";
import Area from "@/models/Area";
import { deleteImage } from "@/lib/cloudinary";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ areaId: string; publicId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { areaId, publicId } = await params;

    await dbConnect();

    // Verify area exists and user has access
    const area = await Area.findOne({ _id: areaId }).populate("projectId");

    if (
      !area ||
      (area.projectId as any).companyId.toString() !== session.user.companyId
    ) {
      return NextResponse.json({ error: "Area not found" }, { status: 404 });
    }

    // Delete from Cloudinary

    const photoUrl = area.photos.find((url: string) => url.includes(publicId));

    if (!photoUrl) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    // Extract publicId from URL more reliably
    const urlParts = photoUrl.split("/");
    const fileName = urlParts[urlParts.length - 1];
    const extractedPublicId = fileName.split(".")[0]; // Remove file extension

    console.log("Extracted publicId:", extractedPublicId);

    // Delete from Cloudinary using extracted publicId
    const deleteResult = await deleteImage(extractedPublicId);

    if (!deleteResult.success) {
      return NextResponse.json({ error: deleteResult.error }, { status: 500 });
    }

    // Remove the specific photo URL from the array
    await Area.findByIdAndUpdate(areaId, {
      $pull: { photos: photoUrl },
    });
    return NextResponse.json({
      success: true,
      message: "Photo deleted successfully",
    });
  } catch (error) {
    console.error("Delete area photo error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
