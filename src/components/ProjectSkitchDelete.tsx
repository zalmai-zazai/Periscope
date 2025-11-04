"use client";

import { useState } from "react";

interface ProjectSkitchDeleteProps {
  photoUrl: string;
  publicId: string;
  projectId: string;
  onSkitchPhotoDeleted: () => void;
  onImageClick?: (imageUrl: string) => void;
}

export function ProjectSkitchDelete({
  photoUrl,
  publicId,
  projectId,
  onSkitchPhotoDeleted,
  onImageClick,
}: ProjectSkitchDeleteProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this skitch photo?")) {
      return;
    }

    setDeleting(true);

    try {
      console.log("🔄 Deleting skitch photo with publicId:", publicId);
      console.log("🔄 Project ID:", projectId);

      // URL encode the publicId to handle slashes
      const encodedPublicId = encodeURIComponent(publicId);
      console.log("🔄 Encoded publicId:", encodedPublicId);

      const response = await fetch(
        `/api/projects/${projectId}/skitch-photos/${encodedPublicId}`,
        {
          method: "DELETE",
        }
      );

      console.log("📡 Delete response status:", response.status);

      const result = await response.json();
      console.log("📡 Delete response data:", result);

      if (result.success) {
        onSkitchPhotoDeleted();
      } else {
        alert(result.error || "Failed to delete skitch photo");
      }
    } catch (error) {
      console.error("💥 Delete error:", error);
      alert("Failed to delete skitch photo");
    } finally {
      setDeleting(false);
    }
  };

  const handleImageClick = () => {
    if (onImageClick) {
      onImageClick(photoUrl);
    }
  };

  return (
    <div className="relative group">
      <img
        src={photoUrl}
        alt="Skitch photo"
        className="w-full h-32 object-cover rounded-md cursor-pointer hover:opacity-90 transition-opacity border-2 border-purple-200 dark:border-purple-800"
        onClick={handleImageClick}
      />
      {/* Remove opacity-0 group-hover:opacity-100 to always show the button */}
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full transition-opacity disabled:opacity-50 text-xs w-6 h-6 flex items-center justify-center"
      >
        {deleting ? "..." : "×"}
      </button>
      <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
        Skitch
      </div>
    </div>
  );
}
