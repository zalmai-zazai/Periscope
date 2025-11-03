import cloudinary from "cloudinary";
// In your cloudinary.ts, add console logs:
export async function uploadImage(imageFile: File) {
  console.log("🔄 Starting Cloudinary upload...");

  // Convert file to base64
  const bytes = await imageFile.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64Image = `data:${imageFile.type};base64,${buffer.toString(
    "base64"
  )}`;

  console.log("📁 File converted to base64, length:", base64Image.length);

  try {
    console.log("☁️ Uploading to Cloudinary...");
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: "damagescope",
      resource_type: "image",
    });

    console.log("✅ Cloudinary upload successful:", result.secure_url);

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error("❌ Cloudinary upload error:", error);
    return {
      success: false,
      error: "Failed to upload image to Cloudinary",
    };
  }
}
export async function deleteImage(publicId: string) {
  try {
    console.log("🗑️ Deleting image from Cloudinary:", publicId);
    await cloudinary.uploader.destroy(publicId);
    console.log("✅ Image deleted from Cloudinary");
    return { success: true };
  } catch (error) {
    console.error("❌ Cloudinary delete error:", error);
    return { success: false, error: "Failed to delete image" };
  }
}
