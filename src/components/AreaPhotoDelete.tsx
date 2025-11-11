"use client";

import { useState } from "react";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { useToast } from "@/hooks/useToast";

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const toast = useToast();

  const handleDelete = async () => {
    setDeleting(true);

    const loadingToast = toast.loading("Deleting photo...");

    try {
      const response = await fetch(`/api/areas/${areaId}/photos/${publicId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        toast.dismiss(loadingToast);
        toast.success("Photo deleted successfully");
        onPhotoDeleted();
      } else {
        toast.dismiss(loadingToast);
        toast.error(
          "Failed to delete photo",
          result.error || "Please try again"
        );
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to delete photo", "Please try again later");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleImageClick = () => {
    if (onImageClick) {
      onImageClick(photoUrl);
    }
  };

  const openDeleteConfirm = () => {
    setShowDeleteConfirm(true);
  };

  return (
    <>
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Photo?"
        message="This action cannot be undone. The photo will be permanently removed from this area."
        confirmText={deleting ? "Deleting..." : "Delete Photo"}
        variant="danger"
        isLoading={deleting}
      />

      <div className="relative group">
        <img
          src={photoUrl}
          alt="Area photo"
          className="w-full h-32 object-cover rounded-md cursor-pointer hover:opacity-90 transition-opacity"
          onClick={handleImageClick}
        />
        {/* Delete Button - Always visible */}
        <button
          onClick={openDeleteConfirm}
          disabled={deleting}
          className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full transition-opacity disabled:opacity-50 text-xs w-6 h-6 flex items-center justify-center hover:bg-red-700"
          title="Delete photo"
        >
          {deleting ? "..." : "×"}
        </button>
      </div>
    </>
  );
}
