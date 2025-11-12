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

    const { areaId, publicId: publicIdParam } = await params;

    // decode in case publicId contains encoded slashes or other chars
    const decodedPublicIdParam = decodeURIComponent(publicIdParam);

    await dbConnect();

    const area = await Area.findOne({ _id: areaId }).populate("projectId");
    if (
      !area ||
      (area.projectId as any).companyId.toString() !== session.user.companyId
    ) {
      return NextResponse.json({ error: "Area not found" }, { status: 404 });
    }

    // Find photo URL in stored photos that matches the param (match last segment too)
    const photoUrl = area.photos.find(
      (url: string) =>
        url.includes(decodedPublicIdParam) || url.includes(publicIdParam)
    );

    if (!photoUrl) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    // Robust Cloudinary public_id extraction:
    // - take substring after '/upload/'
    // - remove transformations and version prefix (e.g. c_fill/.../v123456/)
    // - strip the file extension
    let extractedPublicId = photoUrl;
    const uploadIdx = photoUrl.indexOf("/upload/");
    if (uploadIdx !== -1) {
      extractedPublicId = photoUrl.slice(uploadIdx + "/upload/".length);

      // remove everything up to and including v{digits}/ if present (this removes transformations and the version prefix)
      extractedPublicId = extractedPublicId.replace(/^.*?v\d+\//, "");

      // remove file extension (last dot to end)
      extractedPublicId = extractedPublicId.replace(/\.[^/.]+$/, "");
    } else {
      // fallback: use last path segment without extension
      const parts = photoUrl.split("/");
      const last = parts[parts.length - 1];
      extractedPublicId = last.replace(/\.[^/.]+$/, "");
    }

    console.log(
      "Extracted publicId:",
      extractedPublicId,
      "from URL:",
      photoUrl
    );

    // call deleteImage with the extracted public id (no extension)
    const deleteResult = await deleteImage(extractedPublicId);

    if (!deleteResult.success) {
      // console.error("Cloudinary delete returned error:", deleteResult.error);
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
    // console.error("Delete area photo error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
