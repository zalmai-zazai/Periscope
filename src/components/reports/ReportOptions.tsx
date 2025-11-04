"use client";

interface ReportOptions {
  includePhotos: boolean;
  includeAmounts: boolean;
  includeEquipment: boolean;
  includeNotes: boolean;
  companyLogo: boolean;
  detailedBreakdown: boolean;
  includeSketches: boolean; // NEW: Add sketches option
}

interface ReportOptionsProps {
  options: ReportOptions;
  onOptionsChange: (options: ReportOptions) => void;
  reportType: string;
}

export function ReportOptions({
  options,
  onOptionsChange,
  reportType,
}: ReportOptionsProps) {
  const updateOption = (key: keyof ReportOptions, value: boolean) => {
    onOptionsChange({
      ...options,
      [key]: value,
    });
  };

  const isInsuranceClaim = reportType === "insurance_claim";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Report Options
      </h3>

      <div className="space-y-4">
        {/* Basic Options */}
        <div className="space-y-3">
          {/* <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={options.includeAmounts}
              onChange={(e) => updateOption("includeAmounts", e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
            />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Include Cost Amounts
            </span>
          </label> */}

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={options.includeEquipment}
              onChange={(e) =>
                updateOption("includeEquipment", e.target.checked)
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
            />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Include Equipment List
            </span>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={options.includeNotes}
              onChange={(e) => updateOption("includeNotes", e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
            />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Include Inspector Notes
            </span>
          </label>
        </div>

        {/* Visual Content Options */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-600 space-y-3">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={options.includePhotos}
              onChange={(e) => updateOption("includePhotos", e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
            />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Include Project Photos
              <span className="text-xs text-gray-500 dark:text-gray-400 block">
                (Add project photos to the report)
              </span>
            </span>
          </label>

          {/* NEW: Include Sketches Option */}
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={options.includeSketches}
              onChange={(e) =>
                updateOption("includeSketches", e.target.checked)
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
            />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Include Sketches & Diagrams
              <span className="text-xs text-gray-500 dark:text-gray-400 block">
                (Add sketch photos and diagrams to the report)
              </span>
            </span>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={options.companyLogo}
              onChange={(e) => updateOption("companyLogo", e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
            />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Include Company Logo
            </span>
          </label>
        </div>

        {/* Advanced Options */}
        {/* {isInsuranceClaim && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-600 space-y-3">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={options.detailedBreakdown}
                onChange={(e) =>
                  updateOption("detailedBreakdown", e.target.checked)
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Detailed Cost Breakdown
                <span className="text-xs text-gray-500 dark:text-gray-400 block">
                  (Include line-by-line cost details)
                </span>
              </span>
            </label>
          </div>
        )} */}
      </div>
    </div>
  );
}
