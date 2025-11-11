"use client";

import { useState } from "react";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { useToast } from "@/hooks/useToast";

interface JoinCodeManagerProps {
  joinCode: string;
}

export function JoinCodeManager({ joinCode }: JoinCodeManagerProps) {
  const [currentJoinCode, setCurrentJoinCode] = useState(joinCode);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const toast = useToast();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentJoinCode || "");
    toast.success("Join code copied to clipboard!");
  };

  const handleGenerateNewCode = async () => {
    setIsGenerating(true);

    const loadingToast = toast.loading("Generating new join code...");

    try {
      const response = await fetch("/api/company/join-code", {
        method: "POST",
      });
      const result = await response.json();

      if (result.success) {
        toast.dismiss(loadingToast);
        toast.success(
          "New join code generated",
          `The old code will no longer work. New code: ${result.joinCode}`
        );
        setCurrentJoinCode(result.joinCode);
      } else {
        toast.dismiss(loadingToast);
        toast.error(
          "Failed to generate new code",
          result.error || "Please try again"
        );
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to generate new code", "Please try again later");
    } finally {
      setIsGenerating(false);
      setShowConfirmModal(false);
    }
  };

  const openConfirmModal = () => {
    setShowConfirmModal(true);
  };

  return (
    <>
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleGenerateNewCode}
        title="Generate New Join Code?"
        message="The current join code will stop working immediately. Team members using the old code will not be able to join until they receive the new code."
        confirmText={isGenerating ? "Generating..." : "Generate New Code"}
        variant="warning"
        isLoading={isGenerating}
      />

      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
          Current Join Code
        </label>
        <div className="flex items-center space-x-2">
          <code className="flex-1 bg-white dark:bg-gray-800 px-3 py-2 rounded border border-blue-200 dark:border-blue-800 text-lg font-mono text-blue-700 dark:text-blue-300">
            {currentJoinCode || "Generating..."}
          </code>
          <button
            onClick={handleCopyCode}
            disabled={!currentJoinCode}
            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            Copy
          </button>
          <button
            onClick={openConfirmModal}
            disabled={isGenerating}
            className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {isGenerating ? "Generating..." : "Generate New"}
          </button>
        </div>
        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
          Share this code with team members. It will refresh after each use.
        </p>
      </div>
    </>
  );
}
