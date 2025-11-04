import CreateProjectForm from "@/components/CreateProjectForm";
import Link from "next/link";

export default function CreateProjectPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/dashboard/projects"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to Projects
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            Create New Project
          </h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <CreateProjectForm />
        </div>
      </div>
    </div>
  );
}
