"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface AddCostFormProps {
  areaId: string; // ADD THIS and
  lineItemId: string;
  currentQuantity: number;
  currentUnit: string;
  itemName: string;
  existingUnitCost?: number;
}

export function AddCostForm({
  areaId, // ADD THIS
  lineItemId,
  currentQuantity,
  currentUnit,
  itemName,
  existingUnitCost,
}: AddCostFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    unitCost: existingUnitCost?.toString() || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // UPDATED API PATH
      const response = await fetch(
        `/api/areas/${areaId}/line-items/${lineItemId}/cost`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            unitCost: parseFloat(formData.unitCost),
          }),
        },
      );

      const result = await response.json();

      if (result.success) {
        setFormData({ unitCost: "" });
        router.refresh();
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const calculatedTotal = formData.unitCost
    ? (parseFloat(formData.unitCost) * currentQuantity).toFixed(2)
    : "0.00";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mt-4">
      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
        Add Cost Estimate
      </h4>

      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div className="p-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md text-xs">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Unit Cost ($)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <span className="text-gray-500 text-sm">$</span>
              </div>
              <input
                type="number"
                name="unitCost"
                min="0"
                step="0.01"
                required
                value={formData.unitCost}
                onChange={handleChange}
                className="w-full pl-6 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="0.00"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              per {currentUnit}
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Total Cost
            </label>
            <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-md text-sm font-semibold text-green-600 dark:text-green-400">
              ${calculatedTotal}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {currentQuantity} {currentUnit} × ${formData.unitCost || "0"}
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-1 px-3 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
        >
          {loading
            ? "Saving..."
            : existingUnitCost
              ? "Update Cost"
              : "Add Cost"}
        </button>
      </form>
    </div>
  );
}
