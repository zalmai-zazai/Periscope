"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);

  // Check if user can delete this project
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
    setError("");
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (result.success) {
        router.push("/dashboard/projects");
      } else {
        setError(result.error || "Failed to delete project");
      }
    } catch (error) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  // Get available actions for current role - SEPARATE delete from status actions
  const getAvailableActions = () => {
    const statusActions = [];
    let deleteAction = null;

    // Delete action if user has permission (store separately)
    if (canDeleteProject()) {
      deleteAction = {
        label: "Delete Project",
        status: "delete",
        buttonStyle: "bg-red-600 hover:bg-red-700 text-white",
        isDelete: true,
      };
    }

    // Role-based status actions
    switch (userRole) {
      case "inspector":
        if (isProjectOwner && projectStatus === "draft") {
          statusActions.push({
            label: "Submit for Field Review",
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
            label: "Complete Field Work",
            status: "ready_for_estimate",
            buttonStyle: "bg-purple-600 hover:bg-purple-700 text-white",
          });
        }
        break;

      case "estimator":
        if (projectStatus === "ready_for_estimate") {
          statusActions.push({
            label: "Start Estimating",
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
        // Admin gets all status options in dropdown
        const adminActions = [
          {
            status: "draft",
            label: "Move to Draft",
            description: "Reset project",
          },
          {
            status: "needs_field_review",
            label: "Send to Field Review",
            description: "Assign to mitigation tech",
          },
          {
            status: "field_in_progress",
            label: "Start Field Work",
            description: "Field work in progress",
          },
          {
            status: "ready_for_estimate",
            label: "Ready for Estimate",
            description: "Ready for estimator",
          },
          {
            status: "estimating",
            label: "Start Estimating",
            description: "Estimation in progress",
          },
          {
            status: "sent",
            label: "Mark as Sent",
            description: "Send to client",
          },
        ].filter((action) => action.status !== projectStatus);

        statusActions.push(...adminActions);
        break;
    }

    return {
      statusActions,
      deleteAction,
    };
  };

  const { statusActions, deleteAction } = getAvailableActions();

  // DEBUG: Keep this to verify

  const updateStatus = async (newStatus: string) => {
    if (newStatus === "delete") {
      setShowDeleteConfirm(true);
      return;
    }

    setLoading(true);
    setError("");
    setShowAdminDropdown(false); // Close dropdown after selection

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
        setError(result.error || "Failed to update status");
      }
    } catch (error) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Don't show actions if no available actions
  const hasStatusActions = statusActions.length > 0;
  const hasDeleteAction = !!deleteAction;

  if (!hasStatusActions && !hasDeleteAction) {
    console.log("DEBUG: No available actions - returning null");
    return null;
  }

  // For non-admin users, show status action + delete separately
  if (userRole !== "admin" && userRole !== "super-admin") {
    return (
      <div className="mt-4">
        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md text-sm mb-3">
            {error}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Confirm Delete
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Are you sure you want to delete this project? This action cannot
                be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteProject}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading ? "Deleting..." : "Delete Project"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons for non-admin users */}
        <div className="flex justify-end space-x-3">
          {/* Status Action Button */}
          {hasStatusActions && (
            <button
              onClick={() => updateStatus(statusActions[0].status)}
              disabled={loading}
              className={`px-6 py-2 rounded-md font-medium transition-colors disabled:opacity-50 ${statusActions[0].buttonStyle}`}
            >
              {loading ? "Processing..." : statusActions[0].label}
            </button>
          )}

          {/* Delete Button */}
          {hasDeleteAction && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={loading}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 font-medium"
            >
              Delete Project
            </button>
          )}
        </div>
      </div>
    );
  }

  // ADMIN VIEW: Dropdown with all options
  // For admin, combine status actions and delete action for the dropdown
  const adminActions = [
    ...statusActions,
    ...(deleteAction ? [deleteAction] : []),
  ];

  return (
    <div className="mt-4">
      {error && (
        <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md text-sm mb-3">
          {error}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Confirm Delete
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Are you sure you want to delete this project? This action cannot
              be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deleteProject}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Delete Project"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Dropdown */}
      <div className="flex justify-end">
        <div className="relative">
          <button
            onClick={() => setShowAdminDropdown(!showAdminDropdown)}
            disabled={loading}
            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50 font-medium flex items-center space-x-2"
          >
            <span>Project Actions</span>
            <svg
              className={`w-4 h-4 transition-transform ${
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
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
              <div className="py-1">
                {adminActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => updateStatus(action.status)}
                    disabled={loading}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    <div className="font-medium">{action.label}</div>
                    {action.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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
