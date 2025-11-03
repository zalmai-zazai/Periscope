import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import Area from "@/models/Area";
import LineItem from "@/models/LineItem"; // ADD THIS
import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";
import { AddAreaForm } from "./AddAreaForm";
import { ProjectActions } from "@/components/ProjectActions";
import Company from "@/models/Company";

export default async function ProjectDetailPage({
  params,
}: {
  params: { projectId: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  await dbConnect();

  // Get project with areas AND estimator info
  const project = await Project.findOne({
    _id: params.projectId,
    companyId: session.user.companyId,
  })
    .populate("inspectorId", "name email")
    .populate("estimatorId", "name email") // ADD THIS
    .lean();

  // Get company settings
  const company = await Company.findOne({ _id: session.user.companyId });

  if (!project) {
    redirect("/dashboard/projects");
  }

  // Calculate total project cost
  const areas = await Area.find({ projectId: params.projectId }).lean();
  let totalProjectCost = 0;
  let areaCosts = [];

  for (const area of areas) {
    const lineItems = await LineItem.find({ areaId: area._id }).lean();
    const areaTotal = lineItems.reduce(
      (sum, item) => sum + (item.totalCost || 0),
      0
    );
    totalProjectCost += areaTotal;
    areaCosts.push({
      areaName: area.name,
      cost: areaTotal,
    });
  }

  // CHECK: If user is inspector and project is submitted, redirect
  if (
    (session.user.role === "inspector" && project.status !== "draft") ||
    (session.user.role === "estimator" &&
      project.status !== "draft" &&
      !company?.allowEstimatorsEditSubmitted)
  ) {
    redirect("/dashboard/projects");
  }

  // CHECK 1: Cannot add areas/line items if project is in-estimate
  const canAddAreas = project.status !== "in-estimate";

  // CHECK 2: Estimators can only add areas/items if:
  // - Project is submitted AND
  // - Company setting allows it
  const canEstimatorAddItems =
    session.user.role === "estimator" &&
    project.status === "submitted" &&
    company?.allowEstimatorsEditSubmitted;

  // CHECK 3: Show AddAreaForm only if:
  // - Project is not in-estimate AND
  // - User is not estimator OR estimator has permission to add items
  const canShowAddAreaForm =
    canAddAreas && (session.user.role !== "estimator" || canEstimatorAddItems);

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
              Project Details
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
        <div className="mb-6">
          <Link
            href="/dashboard/projects"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to Projects
          </Link>
        </div>

        {/* Project Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {project.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {project.address}
              </p>
              <div className="flex items-center space-x-4 mt-2">
                <span
                  className={`px-3 py-1 text-sm rounded-full capitalize ${getStatusColor(
                    project.status
                  )}`}
                >
                  {project.status}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Inspector: {(project.inspectorId as any)?.name}
                </span>
                {/* SHOW ESTIMATOR IF ASSIGNED */}
                {project.estimatorId && (
                  <span className="text-sm text-purple-500 dark:text-purple-400">
                    Estimator: {(project.estimatorId as any)?.name}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Created: {new Date(project.createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Client: {project.clientName}
              </p>

              {/* SHOW PROJECT COST IF AVAILABLE */}
              {totalProjectCost > 0 && (
                <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
                  <p className="text-lg font-bold text-green-700 dark:text-green-300">
                    Total Project Cost: ${totalProjectCost.toFixed(2)}
                  </p>
                </div>
              )}

              <ProjectActions
                projectId={project._id.toString()}
                userRole={session.user?.role}
                projectStatus={project.status}
                isProjectOwner={
                  project.inspectorId.toString() === session.user?.id
                }
              />
            </div>
          </div>

          {/* COST BREAKDOWN SECTION */}
          {totalProjectCost > 0 && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Cost Breakdown
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {areaCosts.map((areaCost, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-600 p-3 rounded-md shadow-sm"
                  >
                    <p className="font-medium text-gray-900 dark:text-white">
                      {areaCost.areaName}
                    </p>
                    <p className="text-green-600 dark:text-green-400 font-semibold">
                      ${areaCost.cost.toFixed(2)}
                    </p>
                  </div>
                ))}
                <div className="bg-white dark:bg-gray-600 p-3 rounded-md shadow-sm border-2 border-green-200 dark:border-green-800">
                  <p className="font-bold text-gray-900 dark:text-white">
                    Total Project
                  </p>
                  <p className="text-green-700 dark:text-green-300 font-bold text-lg">
                    ${totalProjectCost.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Areas Section */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Areas ({areas.length})
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Rooms and locations with damage
                </p>

                {/* STATUS MESSAGE */}
                {project.status === "in-estimate" && (
                  <div className="mt-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-md">
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      📊 <strong>Estimation in Progress</strong> - Adding new
                      areas/items is disabled during estimation.
                    </p>
                  </div>
                )}
                {project.status === "submitted" &&
                  session.user.role === "estimator" &&
                  !company?.allowEstimatorsEditSubmitted && (
                    <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        🔒 <strong>View Only</strong> - You can add costs but
                        cannot modify areas/items.
                      </p>
                    </div>
                  )}
              </div>

              {areas.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-gray-400 text-2xl">🏠</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No areas yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {project.status === "in-estimate"
                      ? "Estimation in progress - no modifications allowed"
                      : "Add the first area to start documenting damage"}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {areas.map((area) => (
                    <div
                      key={area._id.toString()}
                      className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {area.name}
                          </h3>
                          {area.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {area.description}
                            </p>
                          )}
                        </div>
                        <Link
                          href={`/dashboard/projects/${project._id}/areas/${area._id}`}
                          className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                        >
                          {project.status === "in-estimate"
                            ? "View & Add Costs"
                            : "View Details"}
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Add Area Section (Conditional) */}
          {canShowAddAreaForm && (
            <div>
              <AddAreaForm projectId={project._id.toString()} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
