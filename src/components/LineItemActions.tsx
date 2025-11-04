"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

  const handleDeleteLineItem = async () => {
    if (!confirm("Are you sure you want to delete this line item?")) {
      return;
    }

    setDeleting(true);
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
        router.refresh(); // Refresh the page
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert("Failed to delete line item");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      {photosCount > 0 && (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
          📷 {photosCount}
        </span>
      )}
      <button
        onClick={handleDeleteLineItem}
        disabled={deleting}
        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
      >
        {deleting ? "..." : "Delete"}
      </button>
    </div>
  );
}
