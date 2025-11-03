import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Area from "@/models/Area";
import Project from "@/models/Project";
import LineItem from "@/models/LineItem";
import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";
import { AddLineItemForm } from "./AddLineItemForm";
import { AreaActions } from "@/components/AreaActions";
import { LineItemActions } from "@/components/LineItemActions";
import { AreaPhotoUpload } from "@/components/AreaPhotoUpload";
import { AreaPhotosDisplay } from "@/components/AreaPhotosDisplay";
import Company from "@/models/Company";
import { AddCostForm } from "@/components/AddCostForm";

export default async function AreaDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; areaId: string }>;
}) {
  // AWAIT THE PARAMS FIRST
  const { projectId, areaId } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  await dbConnect();

  // Get area with project and line items
  const area = await Area.findOne({
    _id: areaId,
    projectId: projectId,
  })
    .populate("projectId")
    .lean();

  if (!area) {
    redirect("/dashboard/projects");
  }

  // Get company settings
  const company = await Company.findOne({ _id: session.user.companyId });

  // CHECK: If user is inspector and project is submitted, redirect
  if (
    (session.user.role === "inspector" &&
      (area.projectId as any).status !== "draft") ||
    (session.user.role === "estimator" &&
      (area.projectId as any).status !== "draft" &&
      !company?.allowEstimatorsEditSubmitted)
  ) {
    redirect("/dashboard/projects");
  }

  const lineItems = await LineItem.find({ areaId: areaId })
    .sort({ createdAt: 1 })
    .lean();

  // Check if estimator can add new items (based on company setting)
  const canEstimatorAddItems =
    session.user.role === "estimator" && company?.allowEstimatorsEditSubmitted;
  const canShowAddItemForm =
    session.user.role !== "estimator" || canEstimatorAddItems;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Area Details
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
            href={`/dashboard/projects/${projectId}`}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to Project
          </Link>
        </div>

        {/* Area Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {area.name}
              </h1>
              {area.description && (
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  {area.description}
                </p>
              )}

              {/* MEASUREMENTS DISPLAY */}
              {(area.length || area.width) && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300 text-sm mb-2">
                    Room Measurements
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {area.length && area.width && (
                      <div>
                        <span className="text-blue-600 dark:text-blue-400">
                          Dimensions:{" "}
                        </span>
                        <span className="text-blue-800 dark:text-blue-200">
                          {area.length} × {area.width} {area.unit}
                        </span>
                      </div>
                    )}
                    {area.totalArea && (
                      <div>
                        <span className="text-blue-600 dark:text-blue-400">
                          Total Area:{" "}
                        </span>
                        <span className="text-blue-800 dark:text-blue-200">
                          {area.totalArea} {area.unit}²
                        </span>
                      </div>
                    )}
                    {area.height && (
                      <div>
                        <span className="text-blue-600 dark:text-blue-400">
                          Height:{" "}
                        </span>
                        <span className="text-blue-800 dark:text-blue-200">
                          {area.height} {area.unit}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* EQUIPMENT RECOMMENDATION DISPLAY */}
              {area.recommendedEquipment && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-green-800 dark:text-green-300 text-sm">
                      🌀 Equipment Recommendation
                    </h4>
                    {area.recommendedEquipment.isManualOverride && (
                      <span className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full">
                        Manual Override
                      </span>
                    )}
                  </div>

                  <div className="text-sm">
                    <p className="text-green-800 dark:text-green-200 font-medium">
                      {area.recommendedEquipment.airMovers} Air Movers •{" "}
                      {area.recommendedEquipment.lgrDehumidifiers} LGR
                      Dehumidifiers •{" "}
                      {area.recommendedEquipment.hepaAirScrubbers} HEPA
                      Scrubbers
                    </p>

                    {/* Show delta if manual override */}
                    {area.recommendedEquipment.isManualOverride &&
                      area.recommendedEquipment.originalCalculation && (
                        <div className="mt-2 text-xs space-x-2">
                          {area.recommendedEquipment.airMovers !==
                            area.recommendedEquipment.originalCalculation
                              .airMovers && (
                            <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                              Air Movers:{" "}
                              {area.recommendedEquipment.airMovers >
                              area.recommendedEquipment.originalCalculation
                                .airMovers
                                ? "+"
                                : ""}
                              {area.recommendedEquipment.airMovers -
                                area.recommendedEquipment.originalCalculation
                                  .airMovers}
                            </span>
                          )}
                          {area.recommendedEquipment.lgrDehumidifiers !==
                            area.recommendedEquipment.originalCalculation
                              .lgrDehumidifiers && (
                            <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                              LGR Dehus:{" "}
                              {area.recommendedEquipment.lgrDehumidifiers >
                              area.recommendedEquipment.originalCalculation
                                .lgrDehumidifiers
                                ? "+"
                                : ""}
                              {area.recommendedEquipment.lgrDehumidifiers -
                                area.recommendedEquipment.originalCalculation
                                  .lgrDehumidifiers}
                            </span>
                          )}
                          {area.recommendedEquipment.hepaAirScrubbers !==
                            area.recommendedEquipment.originalCalculation
                              .hepaAirScrubbers && (
                            <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                              HEPAs:{" "}
                              {area.recommendedEquipment.hepaAirScrubbers >
                              area.recommendedEquipment.originalCalculation
                                .hepaAirScrubbers
                                ? "+"
                                : ""}
                              {area.recommendedEquipment.hepaAirScrubbers -
                                area.recommendedEquipment.originalCalculation
                                  .hepaAirScrubbers}
                            </span>
                          )}
                        </div>
                      )}

                    {/* Damage Assessment Summary */}
                    <div className="mt-2 text-green-600 dark:text-green-400">
                      <p className="text-xs">
                        Based on {area.totalArea || 0} sq ft, Class{" "}
                        {area.damageClass || "2"}, Category{" "}
                        {area.damageCategory || "2"},
                        {area.materialsAffectedPercent || 50}% materials
                        {area.containmentNeeded && ", containment needed"}
                      </p>
                      {area.equipmentRuleVersion && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Calculation: {area.equipmentRuleVersion} •{" "}
                          {area.lastCalculatedAt
                            ? new Date(
                                area.lastCalculatedAt
                              ).toLocaleDateString()
                            : "Not calculated"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* DAMAGE ASSESSMENT SUMMARY */}
              {(area.damageCategory ||
                area.damageClass ||
                area.containmentNeeded !== undefined) && (
                <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-md">
                  <h4 className="font-medium text-purple-800 dark:text-purple-300 text-sm mb-2">
                    Damage Assessment
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {area.damageCategory && (
                      <div>
                        <span className="text-purple-600 dark:text-purple-400">
                          Category:{" "}
                        </span>
                        <span className="text-purple-800 dark:text-purple-200">
                          {area.damageCategory} -{" "}
                          {area.damageCategory === "1"
                            ? "Clean Water"
                            : area.damageCategory === "2"
                            ? "Gray Water"
                            : "Black Water"}
                        </span>
                      </div>
                    )}
                    {area.damageClass && (
                      <div>
                        <span className="text-purple-600 dark:text-purple-400">
                          Class:{" "}
                        </span>
                        <span className="text-purple-800 dark:text-purple-200">
                          {area.damageClass} -{" "}
                          {area.damageClass === "1"
                            ? "Limited Area"
                            : area.damageClass === "2"
                            ? "Medium Area"
                            : area.damageClass === "3"
                            ? "Large Area"
                            : "Deeply Held"}
                        </span>
                      </div>
                    )}
                    {area.materialsAffectedPercent !== undefined && (
                      <div>
                        <span className="text-purple-600 dark:text-purple-400">
                          Materials Affected:{" "}
                        </span>
                        <span className="text-purple-800 dark:text-purple-200">
                          {area.materialsAffectedPercent}%
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-purple-600 dark:text-purple-400">
                        Containment:{" "}
                      </span>
                      <span className="text-purple-800 dark:text-purple-200">
                        {area.containmentNeeded ? "Required" : "Not Required"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Project: {(area.projectId as any).name}
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Line Items: {lineItems.length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Created: {new Date(area.createdAt).toLocaleDateString()}
              </p>
              <AreaActions
                areaId={area._id.toString()}
                projectId={projectId}
                lineItemsCount={lineItems.length}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Photos and Line Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photo Upload and Display Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              {session.user.role !== "estimator" ||
              (area.projectId as any).status === "draft" ? (
                <AreaPhotoUpload areaId={areaId} />
              ) : null}
              <AreaPhotosDisplay
                areaId={areaId}
                initialPhotos={area.photos || []}
              />
            </div>

            {/* Line Items Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Damage Items ({lineItems.length})
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Specific damage found in this area
                </p>
              </div>

              {lineItems.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-gray-400 text-2xl">📝</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No damage items yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Add the first damage item to document specific damage
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {lineItems.map((item) => (
                    <div
                      key={item._id.toString()}
                      className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {item.name}
                          </h3>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                            <span>Qty: {item.quantity}</span>
                            <span>Unit: {item.unit}</span>
                            {/* ADD COST DISPLAY */}
                            {item.unitCost && (
                              <span className="text-green-600 dark:text-green-400">
                                ${item.unitCost}/{item.unit}
                              </span>
                            )}
                            {item.totalCost && (
                              <span className="font-semibold text-green-700 dark:text-green-300">
                                Total: ${item.totalCost}
                              </span>
                            )}
                          </div>
                          {item.notes && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                              {item.notes}
                            </p>
                          )}
                          {item.iicrcReference && (
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                              IICRC: {item.iicrcReference}
                            </p>
                          )}
                        </div>
                        <LineItemActions
                          lineItemId={item._id.toString()}
                          areaId={areaId}
                          photosCount={item.photos.length}
                        />
                      </div>

                      {/* ADD COST FORM FOR ESTIMATORS */}
                      {session.user.role === "estimator" && (
                        <AddCostForm
                          areaId={areaId}
                          lineItemId={item._id.toString()}
                          currentQuantity={item.quantity}
                          currentUnit={item.unit}
                          itemName={item.name}
                          existingUnitCost={item.unitCost}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Add Line Item Section (Conditional) */}
          {canShowAddItemForm && (
            <div>
              <AddLineItemForm
                areaId={area._id.toString()}
                projectId={projectId}
                userRole={session.user.role}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
