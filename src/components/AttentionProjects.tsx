import Link from "next/link";

interface Project {
  _id: string;
  name: string;
  status: string;
  updatedAt: string;
  inspectorId?: { name: string };
  daysStuck: number;
}

interface AttentionProjectsProps {
  projects: Project[];
}

export function AttentionProjects({ projects }: AttentionProjectsProps) {
  if (projects.length === 0) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mr-3">
            <span className="text-green-600 dark:text-green-300">✅</span>
          </div>
          <div>
            <h3 className="font-medium text-green-800 dark:text-green-300">
              All caught up!
            </h3>
            <p className="text-sm text-green-600 dark:text-green-400">
              No projects need immediate attention
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
      <div className="flex items-center mb-3">
        <div className="w-8 h-8 bg-orange-100 dark:bg-orange-800 rounded-full flex items-center justify-center mr-3">
          <span className="text-orange-600 dark:text-orange-300">⚠️</span>
        </div>
        <div>
          <h3 className="font-medium text-orange-800 dark:text-orange-300">
            Needs Attention ({projects.length})
          </h3>
          <p className="text-sm text-orange-600 dark:text-orange-400">
            Projects stuck for 5+ days
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {projects.map((project) => (
          <Link
            key={project._id}
            href={`/dashboard/projects/${project._id}`}
            className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-orange-100 dark:border-orange-800 hover:shadow-sm transition-shadow"
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {project.name}
              </p>
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="capitalize">
                  {project.status.replace(/_/g, " ")}
                </span>
                <span>•</span>
                <span>Stuck for {project.daysStuck} days</span>
                {project.inspectorId?.name && (
                  <>
                    <span>•</span>
                    <span>Inspector: {project.inspectorId.name}</span>
                  </>
                )}
              </div>
            </div>
            <div className="text-orange-600 dark:text-orange-400 text-xs font-medium">
              Review →
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
