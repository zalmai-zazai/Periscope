"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

  const handleDeleteArea = async () => {
    if (
      !confirm(
        `Are you sure you want to delete this area? ${
          lineItemsCount > 0
            ? "This will also delete all line items in this area."
            : ""
        }`
      )
    ) {
      return;
    }

    setDeleting(true);
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
        router.push(`/dashboard/projects/${projectId}`);
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert("Failed to delete area");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDeleteArea}
      disabled={deleting}
      className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 text-sm"
    >
      {deleting ? "Deleting..." : "Delete Area"}
    </button>
  );
}
