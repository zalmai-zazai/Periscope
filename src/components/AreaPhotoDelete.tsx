// components/AreaPhotoDelete.tsx
"use client";

import { useState } from "react";

interface AreaPhotoDeleteProps {
  photoUrl: string;
  publicId: string;
  areaId: string;
  onPhotoDeleted: () => void;
  onImageClick?: (imageUrl: string) => void;
}

export function AreaPhotoDelete({
  photoUrl,
  publicId,
  areaId,
  onPhotoDeleted,
  onImageClick,
}: AreaPhotoDeleteProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this photo?")) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`/api/areas/${areaId}/photos/${publicId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        onPhotoDeleted();
      } else {
        alert(result.error || "Failed to delete photo");
      }
    } catch (error) {
      alert("Failed to delete photo");
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
        alt="Area photo"
        className="w-full h-32 object-cover rounded-md cursor-pointer hover:opacity-90 transition-opacity"
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
    </div>
  );
}
