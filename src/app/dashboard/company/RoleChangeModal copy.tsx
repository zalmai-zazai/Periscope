"use client";

import { useState, useEffect } from "react";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface RoleChangeModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onRoleChange: (userId: string, newRole: string) => Promise<void>;
}

export function RoleChangeModal({
  user,
  isOpen,
  onClose,
  onRoleChange,
}: RoleChangeModalProps) {
  const [selectedRole, setSelectedRole] = useState(user?.role || "inspector");
  const [isUpdating, setIsUpdating] = useState(false);

  // Reset selected role when user changes
  useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
    }
  }, [user]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole === user.role) {
      onClose();
      return;
    }

    setIsUpdating(true);
    try {
      await onRoleChange(user._id, selectedRole);
      onClose();
    } catch (error) {
      console.error("Error changing role:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "admin":
        return "Full access to company settings, team management, and all features";
      case "project-manager":
        return "Can manage projects, assign inspectors, and review estimates";
      case "estimator":
        return "Can review projects, add costs, and generate reports";
      case "inspector":
        return "Can create projects and document property damage assessments";
      default:
        return "";
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full transform transition-all duration-300 scale-95 hover:scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Change User Role
          </h2>

          <div className="mb-4">
            <p className="text-gray-600 dark:text-gray-300">
              Changing role for <strong>{user.name}</strong> ({user.email})
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Current role: <span className="capitalize">{user.role}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select New Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="admin">Admin</option>
                  <option value="project-manager">Project Manager</option>
                  <option value="estimator">Estimator</option>
                  <option value="inspector">Inspector</option>
                </select>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Description:</strong>{" "}
                  {getRoleDescription(selectedRole)}
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                disabled={isUpdating}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating || selectedRole === user.role}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? "Updating..." : "Update Role"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
