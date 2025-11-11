"use client";

import { useState } from "react";
import { RoleChangeModal } from "./RoleChangeModal";
import { InviteUserForm } from "@/components/InviteUserForm";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { useToast } from "@/hooks/useToast";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

interface TeamManagerProps {
  initialUsers: User[];
}

export function TeamManager({ initialUsers }: TeamManagerProps) {
  const [users, setUsers] = useState<User[]>(
    initialUsers.map((user) => ({
      ...user,
      isActive: user.isActive !== undefined ? user.isActive : true,
    }))
  );
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showUnsuspendModal, setShowUnsuspendModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [pendingActionUser, setPendingActionUser] = useState<User | null>(null);
  const toast = useToast();

  const refreshTeamData = async () => {
    setLoading(true);
    const loadingToast = toast.loading("Refreshing team data...");

    try {
      const response = await fetch("/api/company/data");
      const result = await response.json();
      if (result.success) {
        toast.dismiss(loadingToast);
        toast.success("Team data refreshed");
        setUsers(result.data.users);
      } else {
        toast.dismiss(loadingToast);
        toast.error(
          "Failed to refresh team data",
          result.error || "Please try again"
        );
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to refresh team data", "Please try again later");
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendUser = async () => {
    if (!pendingActionUser) return;

    setActionLoading(true);
    const loadingToast = toast.loading(
      `Suspending ${pendingActionUser.name}...`
    );

    try {
      const response = await fetch(
        `/api/company/users/${pendingActionUser._id}/suspend`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason: "No reason provided" }), // Default reason
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to suspend user");
      }

      // Update the local state
      setUsers(
        users.map((u) =>
          u._id === pendingActionUser._id ? { ...u, isActive: false } : u
        )
      );

      toast.dismiss(loadingToast);
      toast.success(
        "User suspended successfully",
        `${pendingActionUser.name} has been suspended`
      );
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(
        "Failed to suspend user",
        error instanceof Error ? error.message : "Please try again"
      );
    } finally {
      setActionLoading(false);
      setShowSuspendModal(false);
      setPendingActionUser(null);
    }
  };

  const handleUnsuspendUser = async () => {
    if (!pendingActionUser) return;

    setActionLoading(true);
    const loadingToast = toast.loading(
      `Unsuspending ${pendingActionUser.name}...`
    );

    try {
      const response = await fetch(
        `/api/company/users/${pendingActionUser._id}/unsuspend`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to unsuspend user");
      }

      // Update the local state
      setUsers(
        users.map((u) =>
          u._id === pendingActionUser._id ? { ...u, isActive: true } : u
        )
      );

      toast.dismiss(loadingToast);
      toast.success(
        "User unsuspended successfully",
        `${pendingActionUser.name} has been reinstated`
      );
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(
        "Failed to unsuspend user",
        error instanceof Error ? error.message : "Please try again"
      );
    } finally {
      setActionLoading(false);
      setShowUnsuspendModal(false);
      setPendingActionUser(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    const user = users.find((u) => u._id === userId);
    const loadingToast = toast.loading("Updating user role...");

    try {
      const response = await fetch(`/api/company/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update role");
      }

      // Update the local state to reflect the change
      setUsers(
        users.map((user) =>
          user._id === userId ? { ...user, role: newRole } : user
        )
      );

      toast.dismiss(loadingToast);
      toast.success(
        "Role updated successfully",
        `${user?.name} is now ${getRoleDisplayName(newRole)}`
      );
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(
        "Failed to update role",
        error instanceof Error ? error.message : "Please try again"
      );
      throw error;
    }
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
      case "project-manager":
        return "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200";
      case "estimator":
        return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200";
      case "inspector":
        return "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200";
      case "mitigation-tech":
        return "bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200";
      default:
        return "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200";
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "admin":
        return "Admin";
      case "project-manager":
        return "Project Manager";
      case "estimator":
        return "Estimator";
      case "inspector":
        return "Inspector";
      case "mitigation-tech":
        return "Mitigation Tech";
      default:
        return role;
    }
  };

  const handleRemoveUser = async () => {
    if (!pendingActionUser) return;

    setActionLoading(true);
    const loadingToast = toast.loading(`Removing ${pendingActionUser.name}...`);

    try {
      const response = await fetch(
        `/api/company/users/${pendingActionUser._id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to remove user");
      }

      // Remove the user from local state
      setUsers(users.filter((u) => u._id !== pendingActionUser._id));

      toast.dismiss(loadingToast);
      toast.success(
        "User removed successfully",
        `${pendingActionUser.name} has been removed from the company`
      );
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(
        "Failed to remove user",
        error instanceof Error ? error.message : "Please try again"
      );
    } finally {
      setActionLoading(false);
      setShowRemoveModal(false);
      setPendingActionUser(null);
    }
  };

  const openSuspendModal = (user: User) => {
    setPendingActionUser(user);
    setShowSuspendModal(true);
  };

  const openUnsuspendModal = (user: User) => {
    setPendingActionUser(user);
    setShowUnsuspendModal(true);
  };

  const openRemoveModal = (user: User) => {
    setPendingActionUser(user);
    setShowRemoveModal(true);
  };

  return (
    <>
      {/* Suspend Confirmation Modal */}
      <ConfirmationModal
        isOpen={showSuspendModal}
        onClose={() => {
          setShowSuspendModal(false);
          setPendingActionUser(null);
        }}
        onConfirm={handleSuspendUser}
        title={`Suspend ${pendingActionUser?.name}?`}
        message="This will temporarily disable this user's account. They will not be able to access the system until unsuspended."
        confirmText={actionLoading ? "Suspending..." : "Suspend User"}
        variant="warning"
        isLoading={actionLoading}
      />

      {/* Unsuspend Confirmation Modal */}
      <ConfirmationModal
        isOpen={showUnsuspendModal}
        onClose={() => {
          setShowUnsuspendModal(false);
          setPendingActionUser(null);
        }}
        onConfirm={handleUnsuspendUser}
        title={`Unsuspend ${pendingActionUser?.name}?`}
        message="This will restore this user's access to the system."
        confirmText={actionLoading ? "Unsuspending..." : "Unsuspend User"}
        variant="info"
        isLoading={actionLoading}
      />

      {/* Remove Confirmation Modal */}
      <ConfirmationModal
        isOpen={showRemoveModal}
        onClose={() => {
          setShowRemoveModal(false);
          setPendingActionUser(null);
        }}
        onConfirm={handleRemoveUser}
        title={`Remove ${pendingActionUser?.name}?`}
        message="This action cannot be undone. The user will be permanently removed from the company and will lose all access."
        confirmText={actionLoading ? "Removing..." : "Remove User"}
        variant="danger"
        isLoading={actionLoading}
      />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Team Members
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage your team members and send invitations
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={refreshTeamData}
              disabled={loading}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 font-medium"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Team Members List */}
        {users.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No team members found. Invite your first team member to get started.
          </div>
        ) : (
          <div className="space-y-3">
            <RoleChangeModal
              user={selectedUser}
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              onRoleChange={handleRoleChange}
            />
            {users.map((user) => (
              <div
                key={user._id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg ${
                  user.isActive
                    ? "bg-gray-50 dark:bg-gray-700"
                    : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                }`}
              >
                {/* User Info Section */}
                <div className="flex-1 mb-3 sm:mb-0">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-medium text-sm sm:text-base ${
                          user.isActive ? "bg-blue-500" : "bg-gray-400"
                        }`}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {user.name}
                        </p>
                        {!user.isActive && (
                          <span className="text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded flex-shrink-0">
                            Suspended
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                      {!user.isActive && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          Account suspended
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Role and Actions Section */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:space-x-3">
                  {/* Role Badge */}
                  <div className="self-start sm:self-auto">
                    <span
                      className={`px-2 py-1 text-xs rounded-full capitalize ${getRoleBadgeColor(
                        user.role
                      )}`}
                    >
                      {getRoleDisplayName(user.role)}
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-1 sm:flex-nowrap sm:space-x-1">
                    <button
                      className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex-1 sm:flex-none"
                      onClick={() => handleEditClick(user)}
                      disabled={!user.isActive}
                    >
                      Edit Role
                    </button>

                    {user.isActive ? (
                      <button
                        className="px-2 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors flex-1 sm:flex-none"
                        onClick={() => openSuspendModal(user)}
                      >
                        Suspend
                      </button>
                    ) : (
                      <button
                        className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex-1 sm:flex-none"
                        onClick={() => openUnsuspendModal(user)}
                      >
                        Unsuspend
                      </button>
                    )}

                    {user.isActive && (
                      <button
                        className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex-1 sm:flex-none"
                        onClick={() => openRemoveModal(user)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Role Descriptions Section */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Role Descriptions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded">
              <span className="font-medium text-green-700 dark:text-green-300">
                Admin
              </span>
              <p className="text-green-600 dark:text-green-400 mt-1">
                Full access to company settings, team management, and all
                features
              </p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded">
              <span className="font-medium text-purple-700 dark:text-purple-300">
                Project Manager
              </span>
              <p className="text-purple-600 dark:text-purple-400 mt-1">
                Can manage projects, assign inspectors, and review estimates
              </p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
              <span className="font-medium text-blue-700 dark:text-blue-300">
                Estimator
              </span>
              <p className="text-blue-600 dark:text-blue-400 mt-1">
                Can review projects, add costs, and generate reports
              </p>
            </div>
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded">
              <span className="font-medium text-orange-700 dark:text-orange-300">
                Inspector
              </span>
              <p className="text-orange-600 dark:text-orange-400 mt-1">
                Can create projects and document property damage assessments
              </p>
            </div>
            <div className="p-3 bg-teal-50 dark:bg-teal-900/20 rounded">
              <span className="font-medium text-teal-700 dark:text-teal-300">
                Mitigation Tech
              </span>
              <p className="text-teal-600 dark:text-teal-400 mt-1">
                Performs field work, assesses damage, and completes mitigation
                tasks
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
