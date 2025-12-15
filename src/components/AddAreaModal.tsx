"use client";

import { AddAreaForm } from "@/app/dashboard/projects/[projectId]/AddAreaForm";
import { useState } from "react";

interface AddAreaModalProps {
  projectId: string;
}

export function AddAreaModal({ projectId }: AddAreaModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Button */}
      <button
        onClick={() => setOpen(true)}
        className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
      >
        + Add New Area
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />

          {/* Modal content */}
          <div className="relative bg-white dark:bg-gray-800 w-full sm:max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Add New Area
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <AddAreaForm
              projectId={projectId}
              onSuccess={() => setOpen(false)}
            />

            {/* Cancel Button */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
