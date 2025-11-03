import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import Company from "@/models/Company";
import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  await dbConnect();

  // Check if user can create projects
  const company = await Company.findOne({ _id: session.user.companyId });
  const canCreateProjects =
    session.user?.role === "admin" ||
    session.user?.role === "project-manager" ||
    (session.user?.role === "inspector" &&
      company?.allowInspectorsCreateProjects) ||
    (session.user?.role === "estimator" &&
      company?.allowEstimatorsCreateProjects);

  // Get projects based on role
  let query: any = { companyId: session.user.companyId };
  if (session.user?.role === "inspector") {
    query.inspectorId = session.user.id;
  }

  const projects = await Project.find(query)
    .populate("inspectorId", "name")
    .sort({ createdAt: -1 })
    .lean();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "submitted":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "in-estimate":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Projects
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600 dark:text-gray-300">
                {session.user?.name}
              </span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/dashboard"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to Dashboard
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-blue-600 dark:text-white">
              All Projects
            </h2>
            {/* 
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              {session.user?.role === "inspector"
                ? "Your inspection projects"
                : "All company projects"}
            </p> */}
          </div>

          {canCreateProjects && (
            <Link
              href="/dashboard/projects/create"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Project
            </Link>
          )}
        </div>

        {projects.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-400 text-2xl">📋</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No projects yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {canCreateProjects
                ? "Create your first project to get started"
                : "No projects have been assigned to you yet"}
            </p>
            {canCreateProjects && (
              <Link
                href="/dashboard/projects/create"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block"
              >
                Create First Project
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
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
                      key={project._id.toString()}
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
                        {(project.inspectorId as any)?.name || "N/A"}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full capitalize ${getStatusColor(
                            project.status
                          )}`}
                        >
                          {project.status}
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
          </div>
        )}
      </main>
    </div>
  );
}
