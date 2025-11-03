import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/cloudinary";

export async function GET() {
  try {
    // Test Cloudinary configuration
    return NextResponse.json({
      success: true,
      message: "Cloudinary configured",
      config: {
        hasCloudinaryUrl: !!process.env.CLOUDINARY_URL,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Cloudinary configuration failed",
      },
      { status: 500 }
    );
  }
}
