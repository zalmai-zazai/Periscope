"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { EquipmentEditModal } from "@/components/EquipmentEditModal";
import { useToast } from "@/hooks/useToast";

interface AddAreaFormProps {
  projectId: string;
  onSuccess?: () => void;
}

interface EquipmentCalculation {
  airMovers: number;
  lgrDehumidifiers: number;
  hepaAirScrubbers: number;
  calculating: boolean;
  error?: string;
}

export function AddAreaForm({ projectId, onSuccess }: AddAreaFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [equipmentRecommendation, setEquipmentRecommendation] =
    useState<EquipmentCalculation | null>(null);
  const toast = useToast();

  // Equipment editing state
  const [isEditingEquipment, setIsEditingEquipment] = useState(false);
  const [manualEquipment, setManualEquipment] = useState({
    airMovers: 0,
    lgrDehumidifiers: 0,
    hepaAirScrubbers: 0,
  });
  const [isManualOverride, setIsManualOverride] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    length: "",
    width: "",
    height: "",
    unit: "feet" as "feet" | "meters",
    damageCategory: "2" as "1" | "2" | "3",
    damageClass: "2" as "1" | "2" | "3" | "4",
    containmentNeeded: false,
    materialsAffectedPercent: 50,
  });

  // Professional equipment calculation rules
  const calculateEquipment = useCallback((): EquipmentCalculation => {
    if (!formData.length || !formData.width) {
      return {
        airMovers: 0,
        lgrDehumidifiers: 0,
        hepaAirScrubbers: 0,
        calculating: false,
        error: "Enter length and width to calculate equipment",
      };
    }

    try {
      // Calculate area in square feet
      const areaSqFt = parseFloat(formData.length) * parseFloat(formData.width);
      const ceilingHeight = formData.height ? parseFloat(formData.height) : 8; // Default 8ft
      const roomVolume = areaSqFt * ceilingHeight;

      let airMovers = 0;
      let lgrDehumidifiers = 0;
      let hepaAirScrubbers = 0;

      // ============================================================================
      // AIR MOVER CALCULATIONS (IICRC S500 - Pages 52-53)
      // ============================================================================

      // Rule 1: One airmover in each affected room as baseline
      airMovers += 1;

      // Rule 2: Add airmovers based on affected floor area (50-70 sq ft per airmover)
      // Using 60 sq ft as average for calculation
      const floorAirMovers = Math.ceil(areaSqFt / 60);
      airMovers += floorAirMovers;

      // Rule 3: Add airmovers for upper walls/ceilings if Class 2 or higher
      if (formData.damageClass === "3" || formData.damageClass === "4") {
        // For large areas, add additional airmovers for upper surfaces
        const upperSurfaceAirMovers = Math.ceil(areaSqFt / 125); // 100-150 sq ft average
        airMovers += upperSurfaceAirMovers;
      }

      // Rule 4: Adjust for materials affected percentage
      airMovers = Math.ceil(
        airMovers * (formData.materialsAffectedPercent / 100)
      );

      // Rule 5: Minimum of 1 airmover for any wet area
      if (airMovers === 0 && areaSqFt > 0) airMovers = 1;

      // ============================================================================
      // DEHUMIDIFIER CALCULATIONS (IICRC S500 - Based on Water Class)
      // ============================================================================

      // Industry standard practice (since S500 appendix is missing):
      // Use Air Changes Per Hour (ACH) method based on water class

      const achRequirements = {
        "1": 2, // Class 1: Limited evaporation load - 2 ACH
        "2": 3, // Class 2: Significant evaporation load - 3 ACH
        "3": 4, // Class 3: Greatest evaporation load - 4 ACH
        "4": 4, // Class 4: Deeply held water - 4 ACH (may need specialized drying)
      };

      const requiredACH = achRequirements[formData.damageClass] || 3;

      // Calculate total CFM required for dehumidification
      const totalCFMRequired = (roomVolume * requiredACH) / 60;

      // Standard LGR dehumidifier = ~150 CFM capacity
      // Calculate how many LGR dehumidifiers needed
      lgrDehumidifiers = Math.ceil(totalCFMRequired / 150);

      // Minimum dehumidifier requirements based on category
      const categoryBaseDehus = {
        "1": 1, // Clean water - minimal
        "2": 1, // Gray water - standard
        "3": 2, // Black water - aggressive
      };

      lgrDehumidifiers = Math.max(
        categoryBaseDehus[formData.damageCategory] || 1,
        lgrDehumidifiers
      );

      // ============================================================================
      // HEPA AIR SCRUBBER CALCULATIONS (IICRC S520 - 4 ACH Minimum)
      // ============================================================================

      if (formData.containmentNeeded) {
        // IICRC S520 MANDATE: Minimum 4 Air Changes Per Hour for containment
        const achRequirement = 4;

        // Calculate total CFM required for containment
        const containmentCFMRequired = (roomVolume * achRequirement) / 60;

        // Standard HEPA scrubber = ~500 CFM capacity
        // Calculate how many HEPA scrubbers needed
        hepaAirScrubbers = Math.ceil(containmentCFMRequired / 500);

        // Minimum 1 HEPA scrubber for any containment
        hepaAirScrubbers = Math.max(1, hepaAirScrubbers);

        // Additional HEPA for contaminated water (Category 2/3)
        if (
          formData.damageCategory === "2" ||
          formData.damageCategory === "3"
        ) {
          hepaAirScrubbers += 1;
        }
      }

      return {
        airMovers,
        lgrDehumidifiers,
        hepaAirScrubbers,
        calculating: false,
      };
    } catch (error) {
      return {
        airMovers: 0,
        lgrDehumidifiers: 0,
        hepaAirScrubbers: 0,
        calculating: false,
        error: "Failed to calculate equipment",
      };
    }
  }, [formData]);

  // Real-time calculation with debouncing
  useEffect(() => {
    setEquipmentRecommendation((prev) =>
      prev
        ? { ...prev, calculating: true }
        : {
            airMovers: 0,
            lgrDehumidifiers: 0,
            hepaAirScrubbers: 0,
            calculating: true,
          }
    );

    const timer = setTimeout(() => {
      const result = calculateEquipment();
      setEquipmentRecommendation(result);
    }, 300);

    return () => clearTimeout(timer);
  }, [calculateEquipment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Calculate final equipment recommendation
      const finalEquipment = calculateEquipment();

      const response = await fetch(`/api/projects/${projectId}/areas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          // Convert empty strings to undefined for numbers
          length: formData.length ? parseFloat(formData.length) : undefined,
          width: formData.width ? parseFloat(formData.width) : undefined,
          height: formData.height ? parseFloat(formData.height) : undefined,
          // Include equipment calculation results
          recommendedEquipment: isManualOverride
            ? {
                airMovers: manualEquipment.airMovers,
                lgrDehumidifiers: manualEquipment.lgrDehumidifiers,
                hepaAirScrubbers: manualEquipment.hepaAirScrubbers,
                isManualOverride: true,
                originalCalculation:
                  finalEquipment && !finalEquipment.error
                    ? {
                        airMovers: finalEquipment.airMovers,
                        lgrDehumidifiers: finalEquipment.lgrDehumidifiers,
                        hepaAirScrubbers: finalEquipment.hepaAirScrubbers,
                      }
                    : undefined,
              }
            : finalEquipment && !finalEquipment.error
            ? {
                airMovers: finalEquipment.airMovers,
                lgrDehumidifiers: finalEquipment.lgrDehumidifiers,
                hepaAirScrubbers: finalEquipment.hepaAirScrubbers,
                isManualOverride: false,
              }
            : undefined,
          equipmentRuleVersion: "v1.0",
          lastCalculatedAt: new Date().toISOString(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Show success toast
        toast.success("Area created successfully");
        onSuccess?.(); // THIS CLOSES THE MODAL

        // Reset form
        setFormData({
          name: "",
          description: "",
          length: "",
          width: "",
          height: "",
          unit: "feet",
          damageCategory: "2",
          damageClass: "2",
          containmentNeeded: false,
          materialsAffectedPercent: 50,
        });
        setEquipmentRecommendation(null);
        setIsManualOverride(false);
        router.refresh();
      } else {
        setError(result.error);
        toast.error(
          "Failed to create area",
          result.error || "Please try again"
        );
      }
    } catch (error) {
      setError("Something went wrong");
      toast.error("Failed to create area", "Please try again later");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
          ? value
          : value,
    }));
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setFormData((prev) => ({
      ...prev,
      materialsAffectedPercent: value,
    }));
  };

  // Calculate area for display
  const calculateArea = () => {
    if (!formData.length || !formData.width) return 0;
    return parseFloat(formData.length) * parseFloat(formData.width);
  };

  // Initialize manual equipment when calculation changes
  useEffect(() => {
    if (
      equipmentRecommendation &&
      !equipmentRecommendation.calculating &&
      !equipmentRecommendation.error
    ) {
      setManualEquipment({
        airMovers: equipmentRecommendation.airMovers,
        lgrDehumidifiers: equipmentRecommendation.lgrDehumidifiers,
        hepaAirScrubbers: equipmentRecommendation.hepaAirScrubbers,
      });
    }
  }, [equipmentRecommendation]);

  // Equipment modal handlers
  const handleSaveEquipment = (newEquipment: {
    airMovers: number;
    lgrDehumidifiers: number;
    hepaAirScrubbers: number;
  }) => {
    setManualEquipment(newEquipment);
    setIsManualOverride(true);
    toast.success("Equipment updated manually");
  };

  const handleUseCalculatedEquipment = () => {
    setIsManualOverride(false);
    if (
      equipmentRecommendation &&
      !equipmentRecommendation.calculating &&
      !equipmentRecommendation.error
    ) {
      setManualEquipment({
        airMovers: equipmentRecommendation.airMovers,
        lgrDehumidifiers: equipmentRecommendation.lgrDehumidifiers,
        hepaAirScrubbers: equipmentRecommendation.hepaAirScrubbers,
      });
    }
    toast.success("Using calculated equipment values");
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Add New Area
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Basic Area Information */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 dark:text-white">
            Basic Information
          </h4>

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Area Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="e.g., Kitchen, Bathroom, Living Room"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Additional details about this area..."
            />
          </div>
        </div>

        {/* Room Measurements */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 dark:text-white">
            Room Measurements
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="length"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Length *
              </label>
              <input
                type="number"
                id="length"
                name="length"
                step="0.1"
                min="0"
                required
                value={formData.length}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="0.0"
              />
            </div>
            <div>
              <label
                htmlFor="width"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Width *
              </label>
              <input
                type="number"
                id="width"
                name="width"
                step="0.1"
                min="0"
                required
                value={formData.width}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="0.0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="height"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Height (optional)
              </label>
              <input
                type="number"
                id="height"
                name="height"
                step="0.1"
                min="0"
                value={formData.height}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="0.0"
              />
            </div>
            <div>
              <label
                htmlFor="unit"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Unit
              </label>
              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="feet">Feet</option>
                <option value="meters">Meters</option>
              </select>
            </div>
          </div>
        </div>

        {/* Damage Assessment */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 dark:text-white">
            Damage Assessment
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="damageCategory"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Damage Category
              </label>
              <select
                id="damageCategory"
                name="damageCategory"
                value={formData.damageCategory}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="1">1 - Clean Water</option>
                <option value="2">2 - Gray Water</option>
                <option value="3">3 - Black Water</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="damageClass"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Damage Class
              </label>
              <select
                id="damageClass"
                name="damageClass"
                value={formData.damageClass}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="1">1 - Limited Area</option>
                <option value="2">2 - Medium Area</option>
                <option value="3">3 - Large Area</option>
                <option value="4">4 - Deeply Held</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="materialsAffectedPercent"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Materials Affected: {formData.materialsAffectedPercent}%
            </label>
            <input
              type="range"
              id="materialsAffectedPercent"
              name="materialsAffectedPercent"
              min="0"
              max="100"
              step="5"
              value={formData.materialsAffectedPercent}
              onChange={handleSliderChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="containmentNeeded"
              name="containmentNeeded"
              checked={formData.containmentNeeded}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="containmentNeeded"
              className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
            >
              Containment Required
            </label>
          </div>
        </div>

        {/* Equipment Recommendation Display */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300">
              🌀 Equipment Recommendation
            </h4>
            {isManualOverride && (
              <span className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full">
                Manual Override
              </span>
            )}
          </div>

          {equipmentRecommendation?.calculating ? (
            <p className="text-blue-600 dark:text-blue-400">
              Calculating equipment needs...
            </p>
          ) : equipmentRecommendation?.error ? (
            <p className="text-yellow-600 dark:text-yellow-400 text-sm">
              {equipmentRecommendation.error}
            </p>
          ) : equipmentRecommendation ? (
            <div>
              {/* Equipment Values */}
              <p className="text-blue-800 dark:text-blue-200 font-medium">
                {isManualOverride
                  ? manualEquipment.airMovers
                  : equipmentRecommendation.airMovers}{" "}
                Air Movers •{" "}
                {isManualOverride
                  ? manualEquipment.lgrDehumidifiers
                  : equipmentRecommendation.lgrDehumidifiers}{" "}
                LGR Dehumidifiers •{" "}
                {isManualOverride
                  ? manualEquipment.hepaAirScrubbers
                  : equipmentRecommendation.hepaAirScrubbers}{" "}
                HEPA Scrubbers
              </p>

              {/* Delta Indicator */}
              {isManualOverride && equipmentRecommendation && (
                <div className="mt-2 text-xs space-x-2">
                  {manualEquipment.airMovers !==
                    equipmentRecommendation.airMovers && (
                    <span className="inline-block px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                      Air Movers:{" "}
                      {manualEquipment.airMovers >
                      equipmentRecommendation.airMovers
                        ? "+"
                        : ""}
                      {manualEquipment.airMovers -
                        equipmentRecommendation.airMovers}
                    </span>
                  )}
                  {manualEquipment.lgrDehumidifiers !==
                    equipmentRecommendation.lgrDehumidifiers && (
                    <span className="inline-block px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                      LGR Dehus:{" "}
                      {manualEquipment.lgrDehumidifiers >
                      equipmentRecommendation.lgrDehumidifiers
                        ? "+"
                        : ""}
                      {manualEquipment.lgrDehumidifiers -
                        equipmentRecommendation.lgrDehumidifiers}
                    </span>
                  )}
                  {manualEquipment.hepaAirScrubbers !==
                    equipmentRecommendation.hepaAirScrubbers && (
                    <span className="inline-block px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                      HEPAs:{" "}
                      {manualEquipment.hepaAirScrubbers >
                      equipmentRecommendation.hepaAirScrubbers
                        ? "+"
                        : ""}
                      {manualEquipment.hepaAirScrubbers -
                        equipmentRecommendation.hepaAirScrubbers}
                    </span>
                  )}
                </div>
              )}

              {/* Assumptions and Actions */}
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Based on {calculateArea().toFixed(1)} sq ft, Class{" "}
                  {formData.damageClass}, Category {formData.damageCategory},
                  {formData.materialsAffectedPercent}% materials
                  {formData.containmentNeeded && ", containment needed"}
                </p>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingEquipment(true)}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 underline"
                  >
                    Edit Equipment
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Enter room measurements to see equipment recommendations
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? "Adding Area..." : "Add Area"}
        </button>
      </form>
      {/* Equipment Edit Modal */}
      <EquipmentEditModal
        isOpen={isEditingEquipment}
        onClose={() => setIsEditingEquipment(false)}
        equipment={manualEquipment}
        onSave={handleSaveEquipment}
        onUseCalculated={handleUseCalculatedEquipment}
        calculatedEquipment={
          equipmentRecommendation &&
          !equipmentRecommendation.calculating &&
          !equipmentRecommendation.error
            ? equipmentRecommendation
            : undefined
        }
      />
    </div>
  );
}
