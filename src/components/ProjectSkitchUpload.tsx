"use client";

import { useState } from "react";
import { useToast } from "@/hooks/useToast";

interface ProjectSkitchUploadProps {
  projectId: string;
}

export function ProjectSkitchUpload({ projectId }: ProjectSkitchUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const toast = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("1️⃣ Skitch photo upload started");
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    // Show loading toast
    const loadingToast = toast.loading("Uploading skitch photo...");

    try {
      const formData = new FormData();
      formData.append("photo", file);

      console.log("🔄 Uploading skitch photo...");

      const response = await fetch(`/api/projects/${projectId}/skitch-photos`, {
        method: "POST",
        body: formData,
      });

      console.log("📡 Response status:", response.status);

      const result = await response.json();
      console.log("📡 Response data:", result);

      if (result.success) {
        console.log("✅ Skitch photo upload successful in frontend");
        toast.dismiss(loadingToast);
        toast.success("Skitch photo uploaded successfully");
        window.location.reload();
        e.target.value = "";
      } else {
        console.log("❌ Skitch photo upload failed:", result.error);
        setError(result.error || "Upload failed");
        toast.dismiss(loadingToast);
        toast.error(
          "Failed to upload skitch photo",
          result.error || "Please try again"
        );
      }
    } catch (err) {
      console.log("💥 Network error:", err);
      setError("Failed to upload skitch photo");
      toast.dismiss(loadingToast);
      toast.error("Failed to upload skitch photo", "Please try again later");
    } finally {
      setUploading(false);
    }
  };
  // this is for test

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Upload Sketch Photos
      </label>
      <div className="flex items-center space-x-4">
        <label className="flex-1">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-900 dark:file:text-purple-300"
          />
        </label>
        {uploading && <div className="text-sm text-gray-500">Uploading...</div>}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        Upload annotated photos, diagrams, or marked-up images
      </p>
    </div>
  );
}
