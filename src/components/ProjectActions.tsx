"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { useToast } from "@/hooks/useToast";

interface ProjectActionsProps {
  projectId: string;
  userRole: string;
  projectStatus: string;
  isProjectOwner: boolean;
  isMitTechAssigned?: boolean;
}

export function ProjectActions({
  projectId,
  userRole,
  projectStatus,
  isProjectOwner,
  isMitTechAssigned = false,
}: ProjectActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  const toast = useToast();

  const canDeleteProject = () => {
    if (userRole === "admin" || userRole === "super-admin") return true;
    if (userRole === "project-manager") return true;
    if (
      userRole === "inspector" &&
      isProjectOwner &&
      projectStatus === "draft"
    ) {
      return true;
    }
    return false;
  };

  const deleteProject = async () => {
    setLoading(true);

    const loadingToast = toast.loading("Deleting project...");

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (result.success) {
        toast.dismiss(loadingToast);
        toast.success("Project deleted successfully");
        router.push("/dashboard/projects");
      } else {
        toast.dismiss(loadingToast);
        toast.error(
          "Failed to delete project",
          result.error || "Please try again"
        );
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Something went wrong", "Please try again later");
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const getAvailableActions = () => {
    const statusActions = [];
    let deleteAction = null;

    if (canDeleteProject()) {
      deleteAction = {
        label: "Delete",
        status: "delete",
        buttonStyle: "bg-red-600 hover:bg-red-700 text-white",
        isDelete: true,
      };
    }

    switch (userRole) {
      case "inspector":
        if (isProjectOwner && projectStatus === "draft") {
          statusActions.push({
            label: "Submit for Review",
            status: "needs_field_review",
            buttonStyle: "bg-blue-600 hover:bg-blue-700 text-white",
          });
        }
        break;

      case "mitigation-tech":
        if (projectStatus === "needs_field_review") {
          statusActions.push({
            label: "Start Field Work",
            status: "field_in_progress",
            buttonStyle: "bg-orange-600 hover:bg-orange-700 text-white",
          });
        } else if (projectStatus === "field_in_progress" && isMitTechAssigned) {
          statusActions.push({
            label: "Complete Work",
            status: "ready_for_estimate",
            buttonStyle: "bg-purple-600 hover:bg-purple-700 text-white",
          });
        }
        break;

      case "estimator":
        if (projectStatus === "ready_for_estimate") {
          statusActions.push({
            label: "Start Estimate",
            status: "estimating",
            buttonStyle: "bg-indigo-600 hover:bg-indigo-700 text-white",
          });
        } else if (projectStatus === "estimating") {
          statusActions.push({
            label: "Send to Client",
            status: "sent",
            buttonStyle: "bg-green-600 hover:bg-green-700 text-white",
          });
        }
        break;

      case "admin":
      case "super-admin":
        const adminActions = [
          { status: "draft", label: "Draft", description: "Reset project" },
          {
            status: "needs_field_review",
            label: "Field Review",
            description: "Assign to tech",
          },
          {
            status: "field_in_progress",
            label: "Field Work",
            description: "Work in progress",
          },
          {
            status: "ready_for_estimate",
            label: "Ready",
            description: "Ready for estimator",
          },
          {
            status: "estimating",
            label: "Estimating",
            description: "Estimation in progress",
          },
          { status: "sent", label: "Sent", description: "Sent to client" },
        ].filter((action) => action.status !== projectStatus);

        statusActions.push(...adminActions);
        break;
    }

    return { statusActions, deleteAction };
  };

  const { statusActions, deleteAction } = getAvailableActions();

  const updateStatus = async (newStatus: string) => {
    if (newStatus === "delete") {
      setShowDeleteConfirm(true);
      return;
    }

    setLoading(true);
    setShowAdminDropdown(false);

    const loadingToast = toast.loading("Updating project status...");

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
        toast.dismiss(loadingToast);
        toast.success("Status updated successfully");
        router.refresh();
      } else {
        toast.dismiss(loadingToast);
        toast.error(
          "Failed to update status",
          result.error || "Please try again"
        );
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Something went wrong", "Please try again later");
    } finally {
      setLoading(false);
    }
  };

  const hasStatusActions = statusActions.length > 0;
  const hasDeleteAction = !!deleteAction;

  if (!hasStatusActions && !hasDeleteAction) {
    return null;
  }

  // For non-admin users (estimator, inspector, mitigation-tech)
  if (userRole !== "admin" && userRole !== "super-admin") {
    return (
      <div className="mt-4">
        {/* Confirmation Modal for Delete */}
        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={deleteProject}
          title="Delete Project?"
          message="This action cannot be undone. All areas, line items, and photos will be permanently removed."
          confirmText={loading ? "Deleting..." : "Delete"}
          variant="danger"
          isLoading={loading}
        />

        {/* Compact Action Buttons for non-admin users */}
        <div className="flex flex-wrap gap-2 justify-end">
          {/* Status Action Button */}
          {hasStatusActions && (
            <button
              onClick={() => updateStatus(statusActions[0].status)}
              disabled={loading}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50 whitespace-nowrap min-w-[120px] ${statusActions[0].buttonStyle}`}
            >
              {loading ? "..." : statusActions[0].label}
            </button>
          )}

          {/* Delete Button */}
          {hasDeleteAction && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={loading}
              className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 font-medium text-sm whitespace-nowrap min-w-[80px]"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    );
  }

  // ADMIN VIEW
  const adminActions = [
    ...statusActions,
    ...(deleteAction ? [deleteAction] : []),
  ];

  return (
    <div className="mt-4">
      {/* Confirmation Modal for Delete */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={deleteProject}
        title="Delete Project?"
        message="This action cannot be undone. All areas, line items, and photos will be permanently removed."
        confirmText={loading ? "Deleting..." : "Delete"}
        variant="danger"
        isLoading={loading}
      />

      {/* Admin Dropdown */}
      <div className="flex justify-end">
        <div className="relative">
          <button
            onClick={() => setShowAdminDropdown(!showAdminDropdown)}
            disabled={loading}
            className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors disabled:opacity-50 font-medium flex items-center space-x-2 text-sm whitespace-nowrap"
          >
            <span>Actions</span>
            <svg
              className={`w-3 h-3 transition-transform ${
                showAdminDropdown ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {showAdminDropdown && (
            <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
              <div className="py-1 max-h-48 overflow-y-auto">
                {adminActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => updateStatus(action.status)}
                    disabled={loading}
                    className="w-full text-left px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  >
                    <div className="font-medium">{action.label}</div>
                    {action.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {action.description}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
