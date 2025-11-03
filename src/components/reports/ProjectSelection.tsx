"use client";

interface Project {
  _id: string;
  name: string;
  projectNumber: string;
  status: string;
  clientName: string;
  createdAt: string;
}

interface ProjectSelectionProps {
  projects: Project[];
  selectedProject: Project | null;
  onProjectSelect: (project: Project) => void;
  searchQuery: string;
}

export function ProjectSelection({
  projects,
  selectedProject,
  onProjectSelect,
  searchQuery,
}: ProjectSelectionProps) {
  const getStatusColor = (status: string) => {
    const colors = {
      draft:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      needs_field_review:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      field_in_progress:
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      ready_for_estimate:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      estimating:
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
      sent: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    };
    return (
      colors[status as keyof typeof colors] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    );
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: "Draft",
      needs_field_review: "Field Review",
      field_in_progress: "In Progress",
      ready_for_estimate: "Ready",
      estimating: "Estimating",
      sent: "Published",
    };
    return labels[status] || status;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Select Project
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {projects.length} projects
        </span>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-8">
          {searchQuery ? (
            <>
              <div className="text-gray-400 dark:text-gray-500 text-4xl mb-2">
                🔍
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                No projects found
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Try adjusting your search terms
              </p>
            </>
          ) : (
            <>
              <div className="text-gray-400 dark:text-gray-500 text-4xl mb-2">
                📋
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                No projects available
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Create a project first to generate reports
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {projects.map((project) => (
            <button
              key={project._id}
              onClick={() => onProjectSelect(project)}
              className={`w-full p-4 text-left border rounded-lg transition-colors ${
                selectedProject?._id === project._id
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400"
                  : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium text-gray-900 dark:text-white">
                  {project.name}
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                    project.status
                  )}`}
                >
                  {getStatusLabel(project.status)}
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <div>Project #: {project.projectNumber}</div>
                <div>Client: {project.clientName}</div>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  Created: {new Date(project.createdAt).toLocaleDateString()}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
