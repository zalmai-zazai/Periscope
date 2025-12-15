"use client";

import { useState } from "react";
import { useToast } from "@/hooks/useToast";

interface Company {
  _id: string;
  name: string;
  allowInspectorsCreateProjects: boolean;
  allowEstimatorsCreateProjects: boolean;
  allowEstimatorsEditSubmitted: boolean;
  allowEstimatorsAddCosts: boolean;
}

interface CompanySettingsProps {
  initialCompany: Company;
}

// Define the toggleable settings separately
type ToggleableSetting =
  | "allowInspectorsCreateProjects"
  | "allowEstimatorsCreateProjects"
  | "allowEstimatorsEditSubmitted"
  | "allowEstimatorsAddCosts";

const settingDisplayNames: Record<ToggleableSetting, string> = {
  allowInspectorsCreateProjects: "Inspectors Create Projects",
  allowEstimatorsCreateProjects: "Estimators Create Projects",
  allowEstimatorsEditSubmitted: "Estimators Edit Submitted Projects",
  allowEstimatorsAddCosts: "Estimators Add Costs",
};

export function CompanySettings({ initialCompany }: CompanySettingsProps) {
  const [company, setCompany] = useState(initialCompany);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const toast = useToast();

  const toggleSetting = async (settingName: ToggleableSetting) => {
    if (loading) return;

    setLoading(true);
    setError("");

    const newValue = !company[settingName];

    const loadingToast = toast.loading(
      `Updating ${settingDisplayNames[settingName]}...`
    );

    try {
      const response = await fetch("/api/company/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [settingName]: newValue,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update setting");
      }

      // Update local state with new value
      setCompany((prev) => ({
        ...prev,
        [settingName]: result.data[settingName],
      }));

      toast.dismiss(loadingToast);
      toast.success(
        `${settingDisplayNames[settingName]} ${
          newValue ? "enabled" : "disabled"
        }`,
        `Setting has been ${newValue ? "enabled" : "disabled"} successfully`
      );
    } catch (error) {
      toast.dismiss(loadingToast);
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong";
      setError(errorMessage);
      toast.error("Failed to update setting", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Company Settings
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Existing Inspector Setting */}
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Allow Inspectors to Create Projects
            </label>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              When enabled, inspectors can create new projects
            </p>
          </div>

          <button
            onClick={() => toggleSetting("allowInspectorsCreateProjects")}
            disabled={loading}
            className="cursor-pointer bg-gray-200 dark:bg-gray-700 w-12 h-6 rounded-full relative focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div
              className={`absolute top-1 w-4 h-4 rounded-full transition-all ${
                company.allowInspectorsCreateProjects
                  ? "bg-green-500 left-7"
                  : "bg-gray-500 left-1"
              } ${loading ? "animate-pulse" : ""}`}
            ></div>
          </button>
        </div>

        {/* New Estimator Settings */}
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Allow Estimators to Create Projects
            </label>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              When enabled, estimators can create new projects
            </p>
          </div>

          <button
            onClick={() => toggleSetting("allowEstimatorsCreateProjects")}
            disabled={loading}
            className="cursor-pointer bg-gray-200 dark:bg-gray-700 w-12 h-6 rounded-full relative focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div
              className={`absolute top-1 w-4 h-4 rounded-full transition-all ${
                company.allowEstimatorsCreateProjects
                  ? "bg-green-500 left-7"
                  : "bg-gray-500 left-1"
              } ${loading ? "animate-pulse" : ""}`}
            ></div>
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Allow Estimators to Edit and Add Areas and Line Items
            </label>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              estimators can add/update areas and line items in projects
            </p>
          </div>

          <button
            onClick={() => toggleSetting("allowEstimatorsEditSubmitted")}
            disabled={loading}
            className="cursor-pointer bg-gray-200 dark:bg-gray-700 w-12 h-6 rounded-full relative focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div
              className={`absolute top-1 w-4 h-4 rounded-full transition-all ${
                company.allowEstimatorsEditSubmitted
                  ? "bg-green-500 left-7"
                  : "bg-gray-500 left-1"
              } ${loading ? "animate-pulse" : ""}`}
            ></div>
          </button>
        </div>

        {/* NEW: Allow Estimators to Add Costs Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Allow Estimators to Add Costs
            </label>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              When enabled, estimators can add costs to line items
            </p>
          </div>

          <button
            onClick={() => toggleSetting("allowEstimatorsAddCosts")}
            disabled={loading}
            className="cursor-pointer bg-gray-200 dark:bg-gray-700 w-12 h-6 rounded-full relative focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div
              className={`absolute top-1 w-4 h-4 rounded-full transition-all ${
                company.allowEstimatorsAddCosts
                  ? "bg-green-500 left-7"
                  : "bg-gray-500 left-1"
              } ${loading ? "animate-pulse" : ""}`}
            ></div>
          </button>
        </div>

        {loading && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Updating setting...
          </div>
        )}
      </div>
    </div>
  );
}
