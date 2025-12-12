"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/useToast";

interface RoomData {
  name: string;
  dimensions: {
    length: number;
    width: number;
    unit: string;
    height?: number;
  };
  rawText: string;
  confidence: number;
  equipment: {
    airMovers: number;
    lgrDehumidifiers: number;
    hepaAirScrubbers: number;
    isManualOverride: boolean;
  };
  originalEquipment: {
    airMovers: number;
    lgrDehumidifiers: number;
    hepaAirScrubbers: number;
  };
  approved: boolean;
}

interface SketchReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  photoUrl: string;
  projectId: string;
  onAreasCreated: () => void;
}

export function SketchReviewModal({
  isOpen,
  onClose,
  photoUrl,
  projectId,
  onAreasCreated,
}: SketchReviewModalProps) {
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(true);
  const [creating, setCreating] = useState(false);
  const [rooms, setRooms] = useState<RoomData[]>([]);
  const [defaultHeight, setDefaultHeight] = useState(8);
  const [selectAll, setSelectAll] = useState(true);
  const toast = useToast();

  // Equipment calculator (simplified from your logic)
  const calculateEquipment = (room: any, height: number = 8) => {
    if (!room.dimensions?.length || !room.dimensions?.width) {
      return {
        airMovers: 0,
        lgrDehumidifiers: 0,
        hepaAirScrubbers: 0,
        isManualOverride: false,
      };
    }

    const length = room.dimensions.length;
    const width = room.dimensions.width;
    const area = length * width;

    // Basic IICRC calculations (simplified)
    const airMovers = Math.max(1, Math.ceil(area / 60));
    const lgrDehumidifiers = Math.max(1, Math.ceil(area / 300));
    const hepaAirScrubbers = 0; // Default no containment

    return {
      airMovers,
      lgrDehumidifiers,
      hepaAirScrubbers,
      isManualOverride: false,
    };
  };

  // Step 1: Analyze sketch when modal opens
  useEffect(() => {
    if (isOpen && photoUrl) {
      analyzeSketch();
    }
  }, [isOpen, photoUrl]);

  const analyzeSketch = async () => {
    setLoading(true);
    setAnalyzing(true);

    try {
      console.log("🔍 Analyzing sketch in modal:", photoUrl);

      const response = await fetch(`/api/ai/analyze-sketch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: photoUrl,
          projectId: projectId,
        }),
      });

      const result = await response.json();

      if (response.ok && result.data?.detectedRooms) {
        // Process rooms with equipment calculations
        const processedRooms = result.data.detectedRooms.map((room: any) => {
          const equipment = calculateEquipment(room, defaultHeight);
          return {
            name: room.name || `Room ${room.index + 1}`,
            dimensions: room.dimensions || { length: 0, width: 0, unit: "ft" },
            rawText: room.rawText || "",
            confidence: room.confidence || 0.5,
            equipment: equipment,
            originalEquipment: { ...equipment },
            approved: true, // Auto-approve all by default
          };
        });

        setRooms(processedRooms);
        toast.success(`Found ${processedRooms.length} rooms`);
      } else {
        throw new Error(result.error || "No rooms detected");
      }
    } catch (error: any) {
      console.error("Analysis error:", error);
      toast.error("Analysis failed", error.message || "Please try again");
      setRooms([]);
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  };

  // Toggle approval for a single room
  const toggleRoomApproval = (index: number) => {
    const updatedRooms = [...rooms];
    updatedRooms[index].approved = !updatedRooms[index].approved;
    setRooms(updatedRooms);
  };

  // Toggle all rooms
  const toggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setRooms(rooms.map((room) => ({ ...room, approved: newSelectAll })));
  };

  // Update equipment for a room
  const updateRoomEquipment = (index: number, field: string, value: number) => {
    const updatedRooms = [...rooms];
    updatedRooms[index].equipment = {
      ...updatedRooms[index].equipment,
      [field]: Math.max(0, value),
      isManualOverride: true,
    };
    setRooms(updatedRooms);
  };

  // Reset equipment to calculated values
  const resetRoomEquipment = (index: number) => {
    const updatedRooms = [...rooms];
    updatedRooms[index].equipment = {
      ...updatedRooms[index].originalEquipment,
      isManualOverride: false,
    };
    setRooms(updatedRooms);
  };

  // Create areas from approved rooms
  const createAreas = async () => {
    const approvedRooms = rooms.filter((room) => room.approved);

    if (approvedRooms.length === 0) {
      toast.error("No rooms selected", "Please approve at least one room");
      return;
    }

    setCreating(true);
    const loadingToast = toast.loading(
      `Creating ${approvedRooms.length} areas...`
    );

    try {
      const response = await fetch(`/api/ai/create-areas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: projectId,
          rooms: approvedRooms.map((room) => ({
            name: room.name,
            dimensions: room.dimensions,
            equipment: room.equipment,
          })),
          sketchPhotoUrl: photoUrl,
          defaultHeight: defaultHeight,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast.dismiss(loadingToast);
        toast.success(`Created ${result.createdCount} areas!`);

        // Notify parent and close modal
        onAreasCreated();
        onClose();

        // Optional: refresh page after delay
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        throw new Error(result.error || "Failed to create areas");
      }
    } catch (error: any) {
      console.error("Create error:", error);
      toast.dismiss(loadingToast);
      toast.error(
        "Failed to create areas",
        error.message || "Please try again"
      );
    } finally {
      setCreating(false);
    }
  };

  // Recalculate all equipment with new height
  const recalculateWithNewHeight = (height: number) => {
    setDefaultHeight(height);
    const updatedRooms = rooms.map((room) => {
      const newEquipment = calculateEquipment(room, height);
      return {
        ...room,
        equipment: room.equipment.isManualOverride
          ? room.equipment
          : newEquipment,
        originalEquipment: newEquipment,
      };
    });
    setRooms(updatedRooms);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Review Sketch Analysis
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                AI detected {rooms.length} rooms • Edit equipment before
                creating
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <span className="text-2xl">×</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center p-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              {analyzing
                ? "Analyzing sketch with AI..."
                : "Processing results..."}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              This may take a few moments
            </p>
          </div>
        )}

        {/* Content when loaded */}
        {!loading && (
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Height Setting */}
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <label className="font-medium text-blue-800 dark:text-blue-300">
                    Default Ceiling Height
                  </label>
                  <span className="text-sm text-blue-600 dark:text-blue-400">
                    Applies to all rooms
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <input
                    type="number"
                    min="1"
                    max="20"
                    step="0.5"
                    value={defaultHeight}
                    onChange={(e) =>
                      recalculateWithNewHeight(parseFloat(e.target.value) || 8)
                    }
                    className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                  />
                  <span className="text-gray-600 dark:text-gray-400">feet</span>
                  <button
                    onClick={() => recalculateWithNewHeight(8)}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Reset to 8ft
                  </button>
                </div>
              </div>

              {/* Rooms List */}
              <div className="space-y-4">
                {/* Select All Header */}
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <span className="font-medium text-gray-900 dark:text-white">
                      Select All Rooms ({rooms.filter((r) => r.approved).length}
                      /{rooms.length})
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const updatedRooms = rooms.map((room) => ({
                        ...room,
                        equipment: {
                          ...room.originalEquipment,
                          isManualOverride: false,
                        },
                      }));
                      setRooms(updatedRooms);
                      toast.success("All equipment reset to calculated values");
                    }}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Reset All Equipment
                  </button>
                </div>

                {/* Room Cards */}
                {rooms.map((room, index) => (
                  <div
                    key={index}
                    className={`p-4 border rounded-lg transition-colors ${
                      room.approved
                        ? "border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-900/10"
                        : "border-gray-200 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-900/10"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      {/* Room Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={room.approved}
                            onChange={() => toggleRoomApproval(index)}
                            className="h-4 w-4 text-blue-600 rounded"
                          />
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {room.name}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {room.dimensions.length} × {room.dimensions.width}{" "}
                              {room.dimensions.unit}
                              {room.dimensions.height
                                ? ` × ${room.dimensions.height}ft`
                                : ` × ${defaultHeight}ft`}
                            </p>
                            {room.rawText && (
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                Detected: "{room.rawText}"
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Equipment Display */}
                        <div className="mt-4">
                          <div className="flex items-center space-x-6">
                            {/* Air Movers */}
                            <EquipmentControl
                              label="Air Movers"
                              value={room.equipment.airMovers}
                              originalValue={room.originalEquipment.airMovers}
                              isManual={room.equipment.isManualOverride}
                              onChange={(val) =>
                                updateRoomEquipment(index, "airMovers", val)
                              }
                              onReset={() =>
                                updateRoomEquipment(
                                  index,
                                  "airMovers",
                                  room.originalEquipment.airMovers
                                )
                              }
                            />

                            {/* LGR Dehumidifiers */}
                            <EquipmentControl
                              label="LGR Dehumidifiers"
                              value={room.equipment.lgrDehumidifiers}
                              originalValue={
                                room.originalEquipment.lgrDehumidifiers
                              }
                              isManual={room.equipment.isManualOverride}
                              onChange={(val) =>
                                updateRoomEquipment(
                                  index,
                                  "lgrDehumidifiers",
                                  val
                                )
                              }
                              onReset={() =>
                                updateRoomEquipment(
                                  index,
                                  "lgrDehumidifiers",
                                  room.originalEquipment.lgrDehumidifiers
                                )
                              }
                            />

                            {/* HEPA Scrubbers */}
                            <EquipmentControl
                              label="HEPA Scrubbers"
                              value={room.equipment.hepaAirScrubbers}
                              originalValue={
                                room.originalEquipment.hepaAirScrubbers
                              }
                              isManual={room.equipment.isManualOverride}
                              onChange={(val) =>
                                updateRoomEquipment(
                                  index,
                                  "hepaAirScrubbers",
                                  val
                                )
                              }
                              onReset={() =>
                                updateRoomEquipment(
                                  index,
                                  "hepaAirScrubbers",
                                  room.originalEquipment.hepaAirScrubbers
                                )
                              }
                            />
                          </div>

                          {/* Manual Override Indicator */}
                          {room.equipment.isManualOverride && (
                            <div className="mt-2 flex items-center space-x-2">
                              <span className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full">
                                Manual Override
                              </span>
                              <button
                                onClick={() => resetRoomEquipment(index)}
                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                Reset to Calculated
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {rooms.filter((r) => r.approved).length} of {rooms.length}{" "}
                  rooms selected
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={onClose}
                    disabled={creating}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createAreas}
                    disabled={
                      creating || rooms.filter((r) => r.approved).length === 0
                    }
                    className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {creating ? (
                      <>
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                        Creating...
                      </>
                    ) : (
                      `Create ${rooms.filter((r) => r.approved).length} Areas`
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Equipment Control Component
function EquipmentControl({
  label,
  value,
  originalValue,
  isManual,
  onChange,
  onReset,
}: {
  label: string;
  value: number;
  originalValue: number;
  isManual: boolean;
  onChange: (value: number) => void;
  onReset: () => void;
}) {
  return (
    <div className="flex items-center space-x-3">
      <div>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}:
          </span>
          <span
            className={`text-sm ${
              isManual ? "text-green-600 font-semibold" : "text-gray-600"
            }`}
          >
            {value}
          </span>
          {isManual && value !== originalValue && (
            <span className="text-xs px-1.5 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
              {value > originalValue ? "+" : ""}
              {value - originalValue}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1 mt-1">
          <button
            type="button"
            onClick={() => onChange(value - 1)}
            className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
            disabled={value <= 0}
          >
            -
          </button>
          <input
            type="number"
            min="0"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value) || 0)}
            className="w-12 px-1 py-0.5 text-center border border-gray-300 rounded dark:bg-gray-800 dark:text-white text-sm"
          />
          <button
            type="button"
            onClick={() => onChange(value + 1)}
            className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            +
          </button>
          {isManual && (
            <button
              onClick={onReset}
              className="ml-2 text-xs text-blue-600 dark:text-blue-400 hover:underline"
              title="Reset to calculated value"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
