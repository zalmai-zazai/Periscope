"use client";

import { useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { InsuranceClaimPDF } from "./pdf-templates/InsuranceClaimPDF";
import { ClientEstimatePDF } from "./pdf-templates/ClientEstimatePDF";
import { FieldReportPDF } from "./pdf-templates/FieldReportPDF";

interface Project {
  _id: string;
  name: string;
  projectNumber: string;
  status: string;
  clientName: string;
  createdAt: string;
}

interface ReportOptions {
  includePhotos: boolean;
  includeAmounts: boolean;
  includeEquipment: boolean;
  includeNotes: boolean;
  companyLogo: boolean;
  detailedBreakdown: boolean;
  includeSketches: boolean;
}

interface ReportPreviewProps {
  selectedProject: Project | null;
  reportType: string;
  options: ReportOptions;
  userRole: string;
  canGenerateInsuranceReport: boolean;
}

export function ReportPreview({
  selectedProject,
  reportType,
  options,
  userRole,
  canGenerateInsuranceReport,
}: ReportPreviewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [error, setError] = useState<string>("");

  const handleGenerateReport = async () => {
    if (!selectedProject) return;

    // Check permissions for insurance claims
    if (reportType === "insurance_claim" && !canGenerateInsuranceReport) {
      alert(
        "You need estimator privileges to generate insurance claim reports."
      );
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const response = await fetch(
        `/api/projects/${selectedProject._id}/reports/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reportType,
            options,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to generate report");
      }

      setReportData(result.reportData);
    } catch (err: any) {
      console.error("Report generation error:", err);
      setError(err.message || "Failed to generate report. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const getReportTypeDetails = () => {
    switch (reportType) {
      case "insurance_claim":
        return {
          title: "Insurance Claim Report",
          description:
            "Professional report for insurance companies with detailed damage assessment and cost breakdown.",
          icon: "🏢",
        };
      case "client_estimate":
        return {
          title: "Client Estimate",
          description:
            "Client-friendly estimate with clear pricing and scope of work.",
          icon: "👤",
        };
      case "field_report":
        return {
          title: "Field Report",
          description:
            "Technical report for field teams with equipment requirements and notes.",
          icon: "🔧",
        };
      default:
        return {
          title: "Report",
          description: "Select a report type to generate.",
          icon: "📄",
        };
    }
  };

  const reportDetails = getReportTypeDetails();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Generate Report
      </h3>

      {!selectedProject ? (
        <div className="text-center py-8">
          <div className="text-gray-400 dark:text-gray-500 text-4xl mb-2">
            📋
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            Select a project to generate report
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Project Info */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              {selectedProject.name}
            </h4>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <div>Project #: {selectedProject.projectNumber}</div>
              <div>Client: {selectedProject.clientName}</div>
            </div>
          </div>

          {/* Report Type Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-2xl">{reportDetails.icon}</span>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {reportDetails.title}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {reportDetails.description}
                </div>
              </div>
            </div>
          </div>

          {/* Options Summary */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h5 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">
              Included in Report:
            </h5>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              {options.includeAmounts && <li>• Cost amounts</li>}
              {options.includeEquipment && <li>• Equipment list</li>}
              {options.includeNotes && <li>• Inspector notes</li>}
              {options.companyLogo && <li>• Company branding</li>}
              {options.includePhotos && <li>• Project photos</li>}
              {options.includeSketches && <li>• Sketches & diagrams</li>}
              {options.detailedBreakdown && <li>• Detailed breakdown</li>}
            </ul>
          </div>

          {/* Generate Button */}
          {!reportData ? (
            <button
              onClick={handleGenerateReport}
              disabled={
                isGenerating ||
                (reportType === "insurance_claim" &&
                  !canGenerateInsuranceReport)
              }
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Generating...</span>
                </>
              ) : (
                <span>Generate PDF Report</span>
              )}
            </button>
          ) : (
            <PDFDownloadLink
              document={
                reportType === "insurance_claim" ? (
                  <InsuranceClaimPDF reportData={reportData} />
                ) : reportType === "client_estimate" ? (
                  <ClientEstimatePDF reportData={reportData} />
                ) : (
                  <FieldReportPDF reportData={reportData} />
                )
              }
              fileName={`${reportType}-${selectedProject.projectNumber}.pdf`}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              {({ loading }) =>
                loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Preparing PDF...</span>
                  </>
                ) : (
                  <span>Download PDF</span>
                )
              }
            </PDFDownloadLink>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Permission Notice */}
          {reportType === "insurance_claim" && !canGenerateInsuranceReport && (
            <div className="text-sm text-orange-600 dark:text-orange-400 text-center">
              Estimator role required for insurance claim reports
            </div>
          )}

          {/* Help Text */}
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {!reportData
              ? "Report will be generated as a professional PDF document"
              : "Click download to save your PDF report"}
          </div>
        </div>
      )}
    </div>
  );
}
