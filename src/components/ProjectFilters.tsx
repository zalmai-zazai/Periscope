"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface ProjectFiltersProps {
  currentStatus?: string;
  currentSearch?: string;
}

export function ProjectFilters({
  currentStatus = "all",
  currentSearch = "",
}: ProjectFiltersProps) {
  const router = useRouter();
  const [filters, setFilters] = useState({
    status: currentStatus,
    search: currentSearch,
  });

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);

    // Build URL with filter parameters
    const params = new URLSearchParams();
    if (newFilters.status && newFilters.status !== "all") {
      params.set("status", newFilters.status);
    }
    if (newFilters.search) {
      params.set("search", newFilters.search);
    }

    // Update URL without full page reload (shallow routing)
    const queryString = params.toString();
    const newUrl = queryString
      ? `/dashboard/projects?${queryString}`
      : "/dashboard/projects";
    router.push(newUrl);
  };

  const handleStatusChange = (status: string) => {
    handleFilterChange({ ...filters, status });
  };

  const handleSearchChange = (search: string) => {
    handleFilterChange({ ...filters, search });
  };

  const clearFilters = () => {
    setFilters({ status: "all", search: "" });
    router.push("/dashboard/projects");
  };

  const hasActiveFilters = filters.status !== "all" || filters.search !== "";

  return (
    <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex flex-wrap gap-4 items-end">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Filter by Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="needs_field_review">Needs Field Review</option>
            <option value="field_in_progress">Field In Progress</option>
            <option value="ready_for_estimate">Ready for Estimate</option>
            <option value="estimating">Estimating</option>
            <option value="sent">Sent</option>
          </select>
        </div>

        {/* Search Filter */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Search Projects
          </label>
          <input
            type="text"
            placeholder="Search by project name or client..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div>
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Active Filters Badge */}
      {hasActiveFilters && (
        <div className="mt-3 flex flex-wrap gap-2">
          {filters.status !== "all" && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              Status: {filters.status.replace(/_/g, " ")}
              <button
                onClick={() => handleStatusChange("all")}
                className="ml-1 hover:text-blue-600"
              >
                ×
              </button>
            </span>
          )}
          {filters.search && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Search: {filters.search}
              <button
                onClick={() => handleSearchChange("")}
                className="ml-1 hover:text-green-600"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
