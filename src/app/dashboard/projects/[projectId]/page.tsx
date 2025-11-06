import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Project, { IProject } from "@/models/Project";
import Area from "@/models/Area";
import LineItem from "@/models/LineItem";
import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";
import { AddAreaForm } from "./AddAreaForm";
import { ProjectActions } from "@/components/ProjectActions";
import Company from "@/models/Company";
// import { ReportGenerator } from "@/components/reports/ReportGenerator";
import { ProjectSkitchUpload } from "@/components/ProjectSkitchUpload";
import { ProjectSkitchDisplay } from "@/components/ProjectSkitchDisplay";
import mongoose from "mongoose";
import Navbar from "@/components/Navbar";
type Lean<T> = Omit<T, keyof mongoose.Document> & { _id: string };
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
  const isAdmin = session.user?.role === "admin";
  // Get project with areas AND all assignee info
  let project: Lean<
    IProject & {
      inspectorId?: { _id: string; name: string; email?: string };
      mitTechId?: { _id: string; name: string; email?: string };
      estimatorId?: { _id: string; name: string; email?: string };
    }
  > | null;
  try {
    const { projectId } = await params;
    project = await Project.findOne({
      _id: projectId,
      companyId: session.user.companyId,
    })
      .populate("inspectorId", "name email")
      .populate("mitTechId", "name email")
      .populate("estimatorId", "name email")
      .lean<
        Lean<
          IProject & {
            inspectorId?: { _id: string; name: string; email?: string };
            mitTechId?: { _id: string; name: string; email?: string };
            estimatorId?: { _id: string; name: string; email?: string };
          }
        >
      >();
  } catch (error) {
    // If population fails, try without mitTechId
    const { projectId } = await params;
    project = await Project.findOne({
      _id: projectId,
      companyId: session.user.companyId,
    })
      .populate("inspectorId", "name email")
      .populate("mitTechId", "name email")
      .populate("estimatorId", "name email")
      .lean<
        Lean<
          IProject & {
            inspectorId?: { _id: string; name: string; email?: string };
            mitTechId?: { _id: string; name: string; email?: string };
            estimatorId?: { _id: string; name: string; email?: string };
          }
        >
      >();
  }

  // Get company settings
  const company = await Company.findOne({ _id: session.user.companyId });

  if (!project) {
    redirect("/dashboard/projects");
  }

  // UPDATED: Role-based access control for project view
  const canViewProject = () => {
    const userRole = session.user.role;

    // Get the actual _id from populated objects
    const projectInspectorId = project.inspectorId?._id?.toString();
    const projectMitTechId = project.mitTechId?._id?.toString();
    const projectEstimatorId = project.estimatorId?._id?.toString();
    const userId = session.user.id;

    console.log("DEBUG ACCESS CHECK:", {
      userId: userId,
      userRole: userRole,
      projectInspectorId: projectInspectorId,
      projectMitTechId: projectMitTechId,
      projectEstimatorId: projectEstimatorId,
      projectStatus: project.status,
      isInspectorOwner: projectInspectorId === userId,
    });

    // Admin and project managers can always view
    if (
      userRole === "admin" ||
      userRole === "super-admin" ||
      userRole === "project-manager"
    ) {
      return true;
    }

    // Inspectors can always view their own projects
    if (userRole === "inspector" && projectInspectorId === userId) {
      return true;
    }

    // Mitigation techs can view assigned projects or unassigned field reviews
    if (userRole === "mitigation-tech") {
      const isAssigned = projectMitTechId === userId;
      const isFieldStage =
        project.status === "needs_field_review" ||
        project.status === "field_in_progress";
      const isUnassigned =
        project.status === "needs_field_review" && !projectMitTechId;

      return (isAssigned && isFieldStage) || isUnassigned;
    }

    // Estimators can view ready projects or projects they're assigned to
    if (userRole === "estimator") {
      const isAssigned = projectEstimatorId === userId;
      const isEstimatingStage =
        project.status === "ready_for_estimate" ||
        project.status === "estimating" ||
        project.status === "sent";

      return isAssigned || isEstimatingStage;
    }

    return false;
  };

  if (!canViewProject()) {
    redirect("/dashboard/projects");
  }

  // Calculate total project cost
  const areas = await Area.find({ projectId: (await params).projectId }).lean();
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
  const safeSkitchPhotos = project.skitchPhotos
    ? project.skitchPhotos.map((photo) => ({
        url: photo.url,
        publicId: photo.publicId,
        uploadedBy: photo.uploadedBy?.toString(), // Convert ObjectId to string
        createdAt: photo.createdAt.toISOString(),
        // Don't include _id or any other MongoDB-specific objects
      }))
    : [];
  // UPDATED: Who can add areas based on role and status
  const canAddAreas = () => {
    const userRole = session.user.role;
    const projectStatus = project.status;

    // Get the actual _id from populated objects
    const projectInspectorId = project.inspectorId?._id?.toString();
    const projectMitTechId = project.mitTechId?._id?.toString();
    const userId = session.user.id;

    switch (userRole) {
      case "inspector":
        // Inspectors can only add areas to their own draft projects
        return projectInspectorId === userId && projectStatus === "draft";

      case "mitigation-tech":
        // Mitigation techs can add areas during field work
        return (
          projectMitTechId === userId && projectStatus === "field_in_progress"
        );

      case "estimator":
        // Estimators can add areas if company allows and project is in estimating
        return (
          company?.allowEstimatorsEditSubmitted &&
          projectStatus === "estimating"
        );

      case "admin":
      case "super-admin":
        // Admins can always add areas
        return true;

      default:
        return false;
    }
  };
  const canShowAddAreaForm = canAddAreas();

  // UPDATED: Status colors for new workflow states
  const getStatusColor = (status: string) => {
    console.log("DEBUG getStatusColor called with:", status); // Add this line

    // Convert to lowercase and trim to handle any case/whitespace issues
    const normalizedStatus = status?.toLowerCase().trim();
    switch (normalizedStatus) {
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

  // Helper to get readable status label
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar isAdmin={isAdmin} session={session} />

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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6">
          {/* Main container - side by side on ALL screens */}
          <div className="flex flex-row justify-between gap-4">
            {/* Left Side - Project Info */}
            <div className="flex-1 min-w-0">
              {" "}
              {/* min-w-0 prevents overflow */}
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white break-words">
                {project.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm sm:text-base break-words">
                {project.address}
              </p>
              {/* Status and Assigned Users - With proper gaps */}
              <div className="mt-3 space-y-2">
                <span
                  className={`px-3 py-1 text-sm sm:text-base rounded-full ${getStatusColor(
                    project.status
                  )}`}
                >
                  {getStatusLabel(project.status)}
                </span>

                <div className="space-y-1  mt-2 text-sm sm:text-base">
                  <div className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Inspector:</span>{" "}
                    {(project.inspectorId as any)?.name}
                  </div>

                  {project.mitTechId && (
                    <div className="text-orange-600 dark:text-orange-400">
                      <span className="font-medium">Mit Tech:</span>{" "}
                      {(project.mitTechId as any)?.name}
                    </div>
                  )}

                  {project.estimatorId && (
                    <div className="text-purple-600 dark:text-purple-400">
                      <span className="font-medium">Estimator:</span>{" "}
                      {(project.estimatorId as any)?.name}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side - Meta Info and Actions - With proper gaps */}
            <div className="flex flex-col items-end gap-3 min-w-[140px] sm:min-w-[160px]">
              {/* Created and Client Info - With labels */}
              <div className="text-right space-y-1">
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Created: </span>

                  {new Date(project.createdAt).toLocaleDateString()}
                </p>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Client: </span>

                  {project.clientName}
                </p>
              </div>

              {/* Project Cost */}
              {totalProjectCost > 0 && (
                <div className="px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-md">
                  <p className="text-sm sm:text-lg font-bold text-green-700 dark:text-green-300">
                    ${totalProjectCost.toFixed(2)}
                  </p>
                </div>
              )}

              {/* Project Actions */}
              <ProjectActions
                projectId={project._id.toString()}
                userRole={session.user?.role}
                projectStatus={project.status}
                isProjectOwner={
                  project.inspectorId?._id?.toString() === session.user?.id
                }
                isMitTechAssigned={
                  project.mitTechId?._id?.toString() === session.user?.id
                }
              />
            </div>
          </div>

          {/* COST BREAKDOWN SECTION */}
          {totalProjectCost > 0 && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Cost Breakdown
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {areaCosts.map((areaCost, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-600 p-4 rounded-md shadow-sm"
                  >
                    <p className="font-medium text-gray-900 dark:text-white text-base sm:text-lg">
                      {areaCost.areaName}
                    </p>
                    <p className="text-green-600 dark:text-green-400 font-semibold text-base sm:text-lg mt-1">
                      ${areaCost.cost.toFixed(2)}
                    </p>
                  </div>
                ))}
                <div className="bg-white dark:bg-gray-600 p-4 rounded-md shadow-sm border-2 border-green-200 dark:border-green-800 col-span-full sm:col-span-1">
                  <p className="font-bold text-gray-900 dark:text-white text-base sm:text-lg">
                    Total Project
                  </p>
                  <p className="text-green-700 dark:text-green-300 font-bold text-xl sm:text-2xl mt-1">
                    ${totalProjectCost.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Skitch Photos
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Annotated photos, diagrams, and marked-up images for the entire
              project
            </p>
          </div>

          {/* Permission check for uploading skitch photos */}
          {session.user?.role !== "estimator" || project.status === "draft" ? (
            <ProjectSkitchUpload projectId={project._id.toString()} />
          ) : null}

          <ProjectSkitchDisplay
            projectId={project._id.toString()}
            initialSkitchPhotos={safeSkitchPhotos}
          />
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

                {/* STATUS MESSAGES FOR NEW WORKFLOW */}
                {project.status === "estimating" && (
                  <div className="mt-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-md">
                    <p className="text-sm text-indigo-700 dark:text-indigo-300">
                      📊 <strong>Estimation in Progress</strong> - Adding new
                      areas/items may be restricted.
                    </p>
                  </div>
                )}
                {project.status === "needs_field_review" && (
                  <div className="mt-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-md">
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      🔍 <strong>Awaiting Field Review</strong> - Project is
                      ready for mitigation tech assignment.
                    </p>
                  </div>
                )}
                {project.status === "field_in_progress" && (
                  <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      🛠️ <strong>Field Work in Progress</strong> - Mitigation
                      tech is currently working on site.
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
                    {!canShowAddAreaForm
                      ? "You don't have permission to add areas in the current workflow stage"
                      : "Add the first area to start documenting damage"}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {areas.map((area) => (
                    <div
                      key={String(area._id)}
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
                          {project.status === "estimating"
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
