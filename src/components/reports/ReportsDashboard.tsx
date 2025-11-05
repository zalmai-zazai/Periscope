"use client";

import { useState } from "react";
import Link from "next/link";
import { ProjectSelection } from "./ProjectSelection";
import { ReportOptions } from "./ReportOptions";
import { ReportPreview } from "./ReportPreview";
import { ProjectSearch } from "./ProjectSearch";

interface Project {
  _id: string;
  name: string;
  projectNumber: string;
  status: string;
  clientName: string;
  createdAt: string;
}

interface ReportsDashboardProps {
  projects: Project[];
  userRole: string;
}

type ReportType = "insurance_claim"; // Only insurance claim for now

export function ReportsDashboard({
  projects,
  userRole,
}: ReportsDashboardProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [reportType, setReportType] = useState<ReportType>("insurance_claim");
  const [searchQuery, setSearchQuery] = useState("");
  const [options, setOptions] = useState({
    includePhotos: false,
    includeAmounts: true,
    includeEquipment: true,
    includeNotes: true,
    companyLogo: true,
    detailedBreakdown: false,
    includeSketches: false,
  });

  // Filter projects based on search query
  const filteredProjects = projects.filter((project) => {
    const name = project.name || "";
    const projectNumber = project.projectNumber || "";
    const clientName = project.clientName || "";

    const searchLower = searchQuery.toLowerCase();

    return (
      name.toLowerCase().includes(searchLower) ||
      projectNumber.toLowerCase().includes(searchLower) ||
      clientName.toLowerCase().includes(searchLower)
    );
  });

  const canGenerateInsuranceReport = [
    "estimator",
    "admin",
    "super-admin",
  ].includes(userRole);

  const getPageTitle = () => {
    switch (userRole) {
      case "inspector":
        return "Your Project Reports";
      case "mitigation-tech":
        return "Field Work Reports";
      case "estimator":
        return "Estimation Reports";
      default:
        return "Company Reports";
    }
  };

  const getPageDescription = () => {
    switch (userRole) {
      case "inspector":
        return "Generate reports for your inspection projects";
      case "mitigation-tech":
        return "Create field reports and documentation";
      case "estimator":
        return "Generate insurance claims and client estimates";
      default:
        return "Professional PDF reports for all projects";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section - Matching your Projects page exactly */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        {/* Back to Dashboard Link - Left on desktop, top-left on mobile */}
        <Link
          href="/dashboard"
          className="text-blue-600 dark:text-blue-400 hover:underline text-sm sm:text-base order-1 sm:order-1 self-start sm:self-auto"
        >
          ← Back to Dashboard
        </Link>

        {/* Title and Description - Center on both mobile and desktop */}
        <div className="text-center order-2 sm:order-2">
          <h2 className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-white">
            {getPageTitle()}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm sm:text-base">
            {getPageDescription()}
          </p>
        </div>

        {/* Spacer - Hidden on mobile, visible on desktop */}
        <div className="hidden sm:block w-24 order-3 sm:order-3"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Project Selection & Options */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Search */}
          <ProjectSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            resultCount={filteredProjects.length}
            totalCount={projects.length}
          />

          {/* Project Selection */}
          <ProjectSelection
            projects={filteredProjects}
            selectedProject={selectedProject}
            onProjectSelect={setSelectedProject}
            searchQuery={searchQuery}
          />

          {/* Report Type Selection - Only Insurance Claim for now */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Report Type
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => setReportType("insurance_claim")}
                disabled={!canGenerateInsuranceReport}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  reportType === "insurance_claim"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                } ${
                  !canGenerateInsuranceReport
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <div className="font-medium text-gray-900 dark:text-white mb-1">
                  Insurance Claim
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Detailed report for insurance companies
                </div>
                {!canGenerateInsuranceReport && (
                  <div className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                    Estimator role required
                  </div>
                )}
              </button>

              {/* Client Estimate - Commented out for now
              <button
                onClick={() => setReportType('client_estimate')}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  reportType === 'client_estimate'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <div className="font-medium text-gray-900 dark:text-white mb-1">
                  Client Estimate
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Simplified estimate for clients
                </div>
              </button>
              */}

              {/* Field Report - Commented out for now
              <button
                onClick={() => setReportType('field_report')}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  reportType === 'field_report'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <div className="font-medium text-gray-900 dark:text-white mb-1">
                  Field Report
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Technical report for field teams
                </div>
              </button>
              */}
            </div>
          </div>

          {/* Report Options */}
          <ReportOptions
            options={options}
            onOptionsChange={setOptions}
            reportType={reportType}
          />
        </div>

        {/* Right Column - Preview & Generation */}
        <div className="space-y-6">
          <ReportPreview
            selectedProject={selectedProject}
            reportType={reportType}
            options={options}
            userRole={userRole}
            canGenerateInsuranceReport={canGenerateInsuranceReport}
          />
        </div>
      </div>
    </div>
  );
}
