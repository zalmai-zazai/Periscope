"use client";

import { useState } from "react";

interface JoinCodeManagerProps {
  joinCode: string;
}

export function JoinCodeManager({ joinCode }: JoinCodeManagerProps) {
  const [currentJoinCode, setCurrentJoinCode] = useState(joinCode);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentJoinCode || "");
    alert("Join code copied to clipboard!");
  };

  const handleGenerateNewCode = async () => {
    if (!confirm("Generate a new join code? The old one will stop working.")) {
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/company/join-code", {
        method: "POST",
      });
      const result = await response.json();

      if (result.success) {
        setCurrentJoinCode(result.joinCode);
        alert("New join code generated: " + result.joinCode);
      } else {
        alert("Error: " + result.error);
      }
    } catch (error) {
      alert("Error generating new code");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
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
          onClick={handleGenerateNewCode}
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
  );
}
