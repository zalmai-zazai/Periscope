"use client";

import { useState } from "react";
import Link from "next/link";

interface Project {
  _id: string;
  name: string;
  address: string;
  clientName: string;
  inspectorId: any;
  mitTechId?: any;
  estimatorId?: any;
  status: string;
  createdAt: string;
}

interface ProjectViewToggleProps {
  projects: Project[];
  session: any;
  getStatusColor: (status: string) => string;
  getStatusLabel: (status: string) => string;
}

export default function ProjectViewToggle({
  projects,
  session,
  getStatusColor,
  getStatusLabel,
}: ProjectViewToggleProps) {
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* View Toggle Buttons */}
      <div className="flex justify-end p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setViewMode("table")}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              viewMode === "table"
                ? "bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Table View
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              viewMode === "grid"
                ? "bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-white"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            Grid View
          </button>
        </div>
      </div>

      {/* Table View */}
      {viewMode === "table" && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left p-4 font-medium text-gray-900 dark:text-white">
                  Project Name
                </th>
                <th className="text-left p-4 font-medium text-gray-900 dark:text-white">
                  Address
                </th>
                <th className="text-left p-4 font-medium text-gray-900 dark:text-white">
                  Client
                </th>
                <th className="text-left p-4 font-medium text-gray-900 dark:text-white">
                  Inspector
                </th>
                {/* Show Mitigation Tech for relevant roles */}
                {(session.user?.role === "admin" ||
                  session.user?.role === "mitigation-tech" ||
                  session.user?.role === "project-manager") && (
                  <th className="text-left p-4 font-medium text-gray-900 dark:text-white">
                    Mitigation Tech
                  </th>
                )}
                {/* Show Estimator for relevant roles */}
                {(session.user?.role === "admin" ||
                  session.user?.role === "estimator" ||
                  session.user?.role === "project-manager") && (
                  <th className="text-left p-4 font-medium text-gray-900 dark:text-white">
                    Estimator
                  </th>
                )}
                <th className="text-left p-4 font-medium text-gray-900 dark:text-white">
                  Status
                </th>
                <th className="text-left p-4 font-medium text-gray-900 dark:text-white">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr
                  key={project._id}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="p-4 text-gray-900 dark:text-white">
                    <Link
                      href={`/dashboard/projects/${project._id}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {project.name}
                    </Link>
                  </td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">
                    {project.address}
                  </td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">
                    {project.clientName}
                  </td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">
                    {project.inspectorId?.name || "N/A"}
                  </td>
                  {/* Mitigation Tech Column */}
                  {(session.user?.role === "admin" ||
                    session.user?.role === "mitigation-tech" ||
                    session.user?.role === "project-manager") && (
                    <td className="p-4 text-gray-600 dark:text-gray-300">
                      {project.mitTechId?.name || "Not Assigned"}
                    </td>
                  )}
                  {/* Estimator Column */}
                  {(session.user?.role === "admin" ||
                    session.user?.role === "estimator" ||
                    session.user?.role === "project-manager") && (
                    <td className="p-4 text-gray-600 dark:text-gray-300">
                      {project.estimatorId?.name || "Not Assigned"}
                    </td>
                  )}
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusColor(
                        project.status
                      )}`}
                    >
                      {getStatusLabel(project.status)}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600 dark:text-gray-300">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Grid/Box View */}
      {viewMode === "grid" && (
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div
                key={project._id}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 hover:shadow-md transition-shadow"
              >
                {/* Project Header */}
                <div className="flex justify-between items-start mb-3">
                  <Link
                    href={`/dashboard/projects/${project._id}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-sm flex-1 mr-2"
                  >
                    {project.name}
                  </Link>
                  <span
                    className={`px-2 py-1 text-xs rounded-full capitalize flex-shrink-0 ${getStatusColor(
                      project.status
                    )}`}
                  >
                    {getStatusLabel(project.status)}
                  </span>
                </div>

                {/* Project Details */}
                <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Address:{" "}
                    </span>
                    <span className="block truncate">{project.address}</span>
                  </div>

                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Client:{" "}
                    </span>
                    <span>{project.clientName}</span>
                  </div>

                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Inspector:{" "}
                    </span>
                    <span>{project.inspectorId?.name || "N/A"}</span>
                  </div>

                  {/* Mitigation Tech - Grid */}
                  {(session.user?.role === "admin" ||
                    session.user?.role === "mitigation-tech" ||
                    session.user?.role === "project-manager") && (
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Mitigation Tech:{" "}
                      </span>
                      <span>{project.mitTechId?.name || "Not Assigned"}</span>
                    </div>
                  )}

                  {/* Estimator - Grid */}
                  {(session.user?.role === "admin" ||
                    session.user?.role === "estimator" ||
                    session.user?.role === "project-manager") && (
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Estimator:{" "}
                      </span>
                      <span>{project.estimatorId?.name || "Not Assigned"}</span>
                    </div>
                  )}

                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Created:{" "}
                    </span>
                    <span>
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
