"use client";

import { useState } from "react";

interface AreaPhotoUploadProps {
  areaId: string;
}

export function AreaPhotoUpload({ areaId }: AreaPhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("1️⃣ File upload started");
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("photo", file);

      console.log("🔄 Uploading photo...");

      const response = await fetch(`/api/areas/${areaId}/photos`, {
        method: "POST",
        body: formData,
      });

      console.log("📡 Response status:", response.status);

      const result = await response.json();
      console.log("📡 Response data:", result);

      if (result.success) {
        console.log("✅ Upload successful in frontend");
        window.location.reload();
        e.target.value = "";
      } else {
        console.log("❌ Upload failed:", result.error);
        setError(result.error || "Upload failed");
      }
    } catch (error) {
      console.log("💥 Network error:", error);
      setError("Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Upload Area Photos
      </label>
      <div className="flex items-center space-x-4">
        <label className="flex-1">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300"
          />
        </label>
        {uploading && <div className="text-sm text-gray-500">Uploading...</div>}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        Upload floor plans or room overview photos
      </p>
    </div>
  );
}
