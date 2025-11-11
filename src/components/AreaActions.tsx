"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { useToast } from "@/hooks/useToast";

interface AreaActionsProps {
  areaId: string;
  projectId: string;
  lineItemsCount: number;
}

export function AreaActions({
  areaId,
  projectId,
  lineItemsCount,
}: AreaActionsProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const toast = useToast();

  const handleDeleteArea = async () => {
    setDeleting(true);

    const loadingToast = toast.loading("Deleting area...");

    try {
      const response = await fetch(`/api/projects/${projectId}/areas`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ areaId }),
      });

      const result = await response.json();

      if (result.success) {
        toast.dismiss(loadingToast);
        toast.success("Area deleted successfully");
        router.push(`/dashboard/projects/${projectId}`);
      } else {
        toast.dismiss(loadingToast);
        toast.error(
          "Failed to delete area",
          result.error || "Please try again"
        );
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to delete area", "Please try again later");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const getDeleteMessage = () => {
    if (lineItemsCount > 0) {
      return `This area contains ${lineItemsCount} line item${
        lineItemsCount > 1 ? "s" : ""
      }. Deleting this area will also permanently remove all associated line items and photos.`;
    }
    return "This action cannot be undone. All associated photos will be permanently removed.";
  };

  return (
    <>
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteArea}
        title="Delete Area?"
        message={getDeleteMessage()}
        confirmText={deleting ? "Deleting..." : "Delete Area"}
        variant="danger"
        isLoading={deleting}
      />

      <button
        onClick={() => setShowDeleteConfirm(true)}
        disabled={deleting}
        className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 text-sm"
      >
        {deleting ? "Deleting..." : "Delete Area"}
      </button>
    </>
  );
}
