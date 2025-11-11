"use client";

import { useState } from "react";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { useToast } from "@/hooks/useToast";

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const toast = useToast();

  const handleDelete = async () => {
    setDeleting(true);

    const loadingToast = toast.loading("Deleting skitch photo...");

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
        toast.dismiss(loadingToast);
        toast.success("Skitch photo deleted successfully");
        onSkitchPhotoDeleted();
      } else {
        toast.dismiss(loadingToast);
        toast.error(
          "Failed to delete skitch photo",
          result.error || "Please try again"
        );
      }
    } catch (error) {
      console.error("💥 Delete error:", error);
      toast.dismiss(loadingToast);
      toast.error("Failed to delete skitch photo", "Please try again later");
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
        title="Delete Skitch Photo?"
        message="This action cannot be undone. The annotated photo will be permanently removed."
        confirmText={deleting ? "Deleting..." : "Delete"}
        variant="danger"
        isLoading={deleting}
      />

      <div className="relative group">
        <img
          src={photoUrl}
          alt="Skitch photo"
          className="w-full h-32 object-cover rounded-md cursor-pointer hover:opacity-90 transition-opacity border-2 border-purple-200 dark:border-purple-800"
          onClick={handleImageClick}
        />
        {/* Delete Button - Always visible */}
        <button
          onClick={openDeleteConfirm}
          disabled={deleting}
          className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full transition-opacity disabled:opacity-50 text-xs w-6 h-6 flex items-center justify-center hover:bg-red-700"
          title="Delete skitch photo"
        >
          {deleting ? "..." : "×"}
        </button>
        <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
          Skitch
        </div>
      </div>
    </>
  );
}
