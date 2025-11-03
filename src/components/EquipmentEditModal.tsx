"use client";

import { useEffect, useState } from "react";

interface EquipmentEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: {
    airMovers: number;
    lgrDehumidifiers: number;
    hepaAirScrubbers: number;
  };
  onSave: (equipment: {
    airMovers: number;
    lgrDehumidifiers: number;
    hepaAirScrubbers: number;
  }) => void;
  onUseCalculated: () => void;
  calculatedEquipment?: {
    airMovers: number;
    lgrDehumidifiers: number;
    hepaAirScrubbers: number;
  };
}

export function EquipmentEditModal({
  isOpen,
  onClose,
  equipment,
  onSave,
  onUseCalculated,
  calculatedEquipment,
}: EquipmentEditModalProps) {
  const [localEquipment, setLocalEquipment] = useState(equipment);

  // Update local state when equipment prop changes
  useEffect(() => {
    setLocalEquipment(equipment);
  }, [equipment]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localEquipment);
    onClose();
  };

  const handleUseCalculated = () => {
    onUseCalculated();
    onClose();
  };

  const EquipmentControl = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
        {calculatedEquipment && (
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
            (Calculated:{" "}
            {
              calculatedEquipment[
                label.toLowerCase().includes("air mover")
                  ? "airMovers"
                  : label.toLowerCase().includes("lgr")
                  ? "lgrDehumidifiers"
                  : "hepaAirScrubbers"
              ]
            }
            )
          </span>
        )}
      </label>
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          -
        </button>
        <input
          type="number"
          min="0"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-center dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Edit Equipment Recommendation
        </h3>

        <div className="space-y-4">
          <EquipmentControl
            label="Air Movers"
            value={localEquipment.airMovers}
            onChange={(value) =>
              setLocalEquipment((prev) => ({ ...prev, airMovers: value }))
            }
          />

          <EquipmentControl
            label="LGR Dehumidifiers"
            value={localEquipment.lgrDehumidifiers}
            onChange={(value) =>
              setLocalEquipment((prev) => ({
                ...prev,
                lgrDehumidifiers: value,
              }))
            }
          />

          <EquipmentControl
            label="HEPA Scrubbers"
            value={localEquipment.hepaAirScrubbers}
            onChange={(value) =>
              setLocalEquipment((prev) => ({
                ...prev,
                hepaAirScrubbers: value,
              }))
            }
          />
        </div>

        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handleUseCalculated}
            className="px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 underline"
          >
            Use Calculated Values
          </button>
          <div className="space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
