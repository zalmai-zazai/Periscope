"use client";

import { useState } from "react";
import { useToast } from "@/hooks/useToast";
import { SketchReviewModal } from "@/components/SketchReviewModal"; // We'll create this

interface SketchAnalyzerProps {
  photoUrl: string;
  projectId: string;
}

export function SketchAnalyzer({ photoUrl, projectId }: SketchAnalyzerProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const toast = useToast();

  const handleAnalyzeClick = async () => {
    setAnalyzing(true);

    try {
      // Quick check if image is accessible
      console.log("Opening review modal for:", photoUrl);

      // Open the modal (it will handle the AI analysis)
      setShowModal(true);
    } catch (error) {
      console.error("Error preparing analysis:", error);
      toast.error("Failed to analyze", "Please try again");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAreasCreated = () => {
    toast.success("Areas created successfully!");
    // Optional: trigger page refresh or update
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mt-4">
        <div className="flex flex-col space-y-4">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              AI Sketch Analysis
            </h4>
            <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
              Beta
            </span>
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyzeClick}
            disabled={analyzing}
            className={`
              w-full py-3 px-4 rounded-md transition-all
              ${
                analyzing
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }
              text-white font-medium text-sm
              flex items-center justify-center
            `}
          >
            {analyzing ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                Preparing...
              </>
            ) : (
              <>
                <span className="mr-2">🤖</span>
                Analyze Sketch with AI
              </>
            )}
          </button>

          {/* Info Note */}
          <div className="text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-3">
            <p>
              AI will detect room names and dimensions from handwritten text.
            </p>
            <p className="mt-1">
              You can review and edit equipment before creating areas.
            </p>
          </div>
        </div>
      </div>

      {/* Modal */}
      <SketchReviewModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        photoUrl={photoUrl}
        projectId={projectId}
        onAreasCreated={handleAreasCreated}
      />
    </>
  );
}
