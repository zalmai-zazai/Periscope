import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import Company from "@/models/Company";
import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";
import { ProjectFilters } from "@/components/ProjectFilters";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  await dbConnect();

  // AWAIT the searchParams first
  const params = await searchParams;
  const statusFilter = params?.status;
  const searchFilter = params?.search;

  // Check if user can create projects
  const company = await Company.findOne({ _id: session.user.companyId });
  const canCreateProjects =
    session.user?.role === "admin" ||
    session.user?.role === "project-manager" ||
    (session.user?.role === "inspector" &&
      company?.allowInspectorsCreateProjects) ||
    (session.user?.role === "estimator" &&
      company?.allowEstimatorsCreateProjects);

  // UPDATED: Build query with filters
  let query: any = { companyId: session.user.companyId };

  // Role-based project filtering
  if (session.user?.role === "inspector") {
    query.inspectorId = session.user.id;
  } else if (session.user?.role === "mitigation-tech") {
    query.$or = [
      { mitTechId: session.user.id },
      {
        status: "needs_field_review",
        $or: [{ mitTechId: { $exists: false } }, { mitTechId: null }],
      },
    ];
  } else if (session.user?.role === "estimator") {
    query.$or = [
      { estimatorId: session.user.id },
      { status: { $in: ["ready_for_estimate", "estimating", "sent"] } },
    ];
  }

  // NEW: Apply status filter
  if (statusFilter && statusFilter !== "all") {
    query.status = statusFilter;
  }

  // NEW: Apply search filter
  if (searchFilter) {
    const searchConditions = [
      { name: { $regex: searchFilter, $options: "i" } },
      { clientName: { $regex: searchFilter, $options: "i" } },
      { address: { $regex: searchFilter, $options: "i" } },
    ];

    if (query.$or) {
      // Combine existing $or with search conditions
      query.$and = [{ $or: query.$or }, { $or: searchConditions }];
      delete query.$or; // Remove the original $or since it's now in $and
    } else {
      query.$or = searchConditions;
    }
  }

  let projects;
  try {
    projects = await Project.find(query)
      .populate("inspectorId", "name")
      .populate("mitTechId", "name")
      .populate("estimatorId", "name")
      .sort({ createdAt: -1 })
      .lean();
  } catch (error) {
    // If population fails, fall back to basic query
    projects = await Project.find(query)
      .populate("inspectorId", "name")
      .sort({ createdAt: -1 })
      .lean();
  }

  // UPDATED: Status colors for new workflow states
  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "needs_field_review":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "field_in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "ready_for_estimate":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "estimating":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200";
      case "sent":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  // NEW: Get readable status label
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: "Draft",
      needs_field_review: "Needs Field Review",
      field_in_progress: "Field In Progress",
      ready_for_estimate: "Ready for Estimate",
      estimating: "Estimating",
      sent: "Sent",
    };
    return labels[status] || status;
  };

  // NEW: Get role-specific page title and description
  const getPageTitle = () => {
    switch (session.user?.role) {
      case "inspector":
        return "Your Projects";
      case "mitigation-tech":
        return "Field Work Projects";
      case "estimator":
        return "Estimation Projects";
      default:
        return "All Projects";
    }
  };

  const getPageDescription = () => {
    switch (session.user?.role) {
      case "inspector":
        return "Your inspection projects and their current status";
      case "mitigation-tech":
        return "Projects assigned for field work and awaiting review";
      case "estimator":
        return "Projects ready for estimation and in progress";
      default:
        return "All company projects across all workflow stages";
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
          <div className="text-center">
            <h2 className="text-2xl font-bold text-blue-600 dark:text-white">
              {getPageTitle()}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              {getPageDescription()}
            </p>
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

        {/* ADD THE FILTER COMPONENT */}
        <ProjectFilters
          currentStatus={statusFilter}
          currentSearch={searchFilter}
        />

        {projects.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-400 text-2xl">📋</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchFilter || statusFilter
                ? "No projects match your filters"
                : "No projects yet"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {canCreateProjects && !searchFilter && !statusFilter
                ? "Create your first project to get started"
                : "Try adjusting your filters or search terms"}
            </p>
            {(searchFilter || statusFilter) && (
              <Link
                href="/dashboard/projects"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block"
              >
                Clear Filters
              </Link>
            )}
            {!searchFilter && !statusFilter && canCreateProjects && (
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
                    {/* NEW: Show Mitigation Tech for relevant roles */}
                    {(session.user?.role === "admin" ||
                      session.user?.role === "mitigation-tech" ||
                      session.user?.role === "project-manager") && (
                      <th className="text-left p-4 font-medium text-gray-900 dark:text-white">
                        Mitigation Tech
                      </th>
                    )}
                    {/* NEW: Show Estimator for relevant roles */}
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
                      key={(project._id as string).toString()}
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
                      {/* NEW: Mitigation Tech Column */}
                      {(session.user?.role === "admin" ||
                        session.user?.role === "mitigation-tech" ||
                        session.user?.role === "project-manager") && (
                        <td className="p-4 text-gray-600 dark:text-gray-300">
                          {(project.mitTechId as any)?.name || "Not Assigned"}
                        </td>
                      )}
                      {/* NEW: Estimator Column */}
                      {(session.user?.role === "admin" ||
                        session.user?.role === "estimator" ||
                        session.user?.role === "project-manager") && (
                        <td className="p-4 text-gray-600 dark:text-gray-300">
                          {(project.estimatorId as any)?.name || "Not Assigned"}
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
          </div>
        )}
      </main>
    </div>
  );
}
