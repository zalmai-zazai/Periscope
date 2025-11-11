"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { useToast } from "@/hooks/useToast";

interface LineItemActionsProps {
  lineItemId: string;
  areaId: string;
  photosCount: number;
}

export function LineItemActions({
  lineItemId,
  areaId,
  photosCount,
}: LineItemActionsProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const toast = useToast();

  const handleDeleteLineItem = async () => {
    setDeleting(true);

    const loadingToast = toast.loading("Deleting line item...");

    try {
      const response = await fetch(`/api/areas/${areaId}/line-items`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lineItemId }),
      });

      const result = await response.json();

      if (result.success) {
        toast.dismiss(loadingToast);
        toast.success("Line item deleted successfully");
        router.refresh(); // Refresh the page
      } else {
        toast.dismiss(loadingToast);
        toast.error(
          "Failed to delete line item",
          result.error || "Please try again"
        );
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to delete line item", "Please try again later");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const getDeleteMessage = () => {
    if (photosCount > 0) {
      return `This line item has ${photosCount} photo${
        photosCount > 1 ? "s" : ""
      }. Deleting it will also permanently remove all associated photos.`;
    }
    return "This action cannot be undone. The line item will be permanently removed.";
  };

  return (
    <>
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteLineItem}
        title="Delete Line Item?"
        message={getDeleteMessage()}
        confirmText={deleting ? "Deleting..." : "Delete"}
        variant="danger"
        isLoading={deleting}
      />

      <div className="flex items-center space-x-2">
        {photosCount > 0 && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            📷 {photosCount}
          </span>
        )}
        <button
          onClick={() => setShowDeleteConfirm(true)}
          disabled={deleting}
          className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {deleting ? "..." : "Delete"}
        </button>
      </div>
    </>
  );
}
