"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ProjectActionsProps {
  projectId: string;
  userRole: string;
  projectStatus: string;
  isProjectOwner: boolean;
}

export function ProjectActions({
  projectId,
  userRole,
  projectStatus,
  isProjectOwner,
}: ProjectActionsProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // SIMPLIFIED PERMISSIONS - Don't rely on isProjectOwner for now
  const canChangeStatus = {
    // Inspector can submit any draft project (relaxed rule for testing)
    submit: userRole === "inspector" && projectStatus === "draft",

    // Admin/estimator can move submitted → in-estimate
    startEstimate:
      (userRole === "admin" || userRole === "estimator") &&
      projectStatus === "submitted",

    // Admin/estimator can complete projects
    complete:
      (userRole === "admin" || userRole === "estimator") &&
      projectStatus === "in-estimate",
  };

  // SIMPLIFIED DELETE - Inspector can delete any draft
  const canDelete =
    userRole === "admin" ||
    userRole === "project-manager" ||
    (userRole === "inspector" && projectStatus === "draft");

  console.log("Simplified Permissions:", {
    canDelete,
    canChangeStatus,
  });

  const handleDeleteProject = async () => {
    let message = "Are you sure you want to delete this project?";

    if (userRole === "inspector") {
      message = "Are you sure you want to delete this draft project?";
    }

    if (!confirm(message)) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        router.push("/dashboard/projects");
        router.refresh();
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert("Failed to delete project");
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (result.success) {
        router.refresh();
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert("Failed to update project status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // If no actions available, return null
  if (
    !canDelete &&
    !canChangeStatus.submit &&
    !canChangeStatus.startEstimate &&
    !canChangeStatus.complete
  ) {
    return null;
  }

  return (
    <div className="space-y-2">
      {/* Status Change Buttons */}
      {canChangeStatus.submit && (
        <button
          onClick={() => handleStatusChange("submitted")}
          disabled={updatingStatus}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
        >
          {updatingStatus ? "Submitting..." : "Submit for Estimation"}
        </button>
      )}

      {canChangeStatus.startEstimate && (
        <button
          onClick={() => handleStatusChange("in-estimate")}
          disabled={updatingStatus}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors disabled:opacity-50 text-sm"
        >
          {updatingStatus ? "Starting..." : "Start Estimation"}
        </button>
      )}

      {canChangeStatus.complete && (
        <button
          onClick={() => handleStatusChange("completed")}
          disabled={updatingStatus}
          className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
        >
          {updatingStatus ? "Completing..." : "Mark Complete"}
        </button>
      )}

      {/* Delete Button */}
      {canDelete && (
        <button
          onClick={handleDeleteProject}
          disabled={deleting}
          className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 text-sm"
        >
          {deleting ? "Deleting..." : "Delete Project"}
        </button>
      )}
    </div>
  );
}
