"use client";

import { useState } from "react";
import { AddLineItemForm } from "./AddLineItemForm";
import { CollapsibleNotes } from "@/components/CollapsibleNotes";
import { LineItemActions } from "@/components/LineItemActions";

interface LineItemsSectionProps {
  lineItems: any[];
  areaId: string;
  projectId: string;
  userRole: string;
  canShowAddItemForm: boolean;
}

export function LineItemsSection({
  lineItems,
  areaId,
  projectId,
  userRole,
  canShowAddItemForm,
}: LineItemsSectionProps) {
  const [showAddItemModal, setShowAddItemModal] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Damage Items ({lineItems.length})
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Specific damage found in this area
          </p>
        </div>

        {canShowAddItemForm && (
          <button
            onClick={() => setShowAddItemModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-xs md:text-sm"
          >
            + Add Line Item
          </button>
        )}
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
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {item.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>Item Code: {item.itemCode}</span>
                    <span>Qty: {item.quantity}</span>
                    <span>Unit: {item.unit}</span>
                  </div>
                  {item.notes && <CollapsibleNotes notes={item.notes} />}
                </div>
                <LineItemActions
                  lineItemId={item._id.toString()}
                  areaId={areaId}
                  photosCount={item.photos.length}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full sm:max-w-md md:max-w-lg max-h-[90vh] overflow-y-auto p-6 relative">
            <button
              onClick={() => setShowAddItemModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              ✕
            </button>

            <AddLineItemForm
              areaId={areaId}
              projectId={projectId}
              userRole={userRole}
              onSuccess={() => setShowAddItemModal(false)}
            />

            {/* Cancel Button */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowAddItemModal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
