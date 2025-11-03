"use client";

import { useState, useEffect } from "react";

interface PendingInvite {
  _id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  invitedBy: {
    name: string;
    email: string;
  };
}

export function PendingInvites() {
  const [invites, setInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvites = async () => {
    try {
      const response = await fetch("/api/company/invites");
      const result = await response.json();

      if (result.success) {
        setInvites(result.data);
      }
    } catch (error) {
      console.error("Error fetching invites:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  const handleCancelInvite = async (inviteId: string) => {
    if (!confirm("Are you sure you want to cancel this invitation?")) {
      return;
    }

    try {
      const response = await fetch(`/api/company/invites/${inviteId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to cancel invitation");
      }

      // Remove from local state
      setInvites(invites.filter((invite) => invite._id !== inviteId));
      alert("Invitation cancelled successfully");
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Failed to cancel invitation"
      );
    }
  };

  const formatExpiry = (expiresAt: string) => {
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return "Expired";
    }
    return `Expires in ${diffDays} day${diffDays !== 1 ? "s" : ""}`;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Pending Invitations
        </h3>
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (invites.length === 0) {
    return null; // Don't show if no pending invites
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Pending Invitations
        </h3>
        <button
          onClick={fetchInvites}
          className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-3">
        {invites.map((invite) => (
          <div
            key={invite._id}
            className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
          >
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white text-sm font-medium">
                    {invite.email.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {invite.email}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Role: {invite.role} • Invited by: {invite.invitedBy.name}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-sm text-yellow-700 dark:text-yellow-300">
                {formatExpiry(invite.expiresAt)}
              </span>
              <button
                onClick={() => handleCancelInvite(invite._id)}
                className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
