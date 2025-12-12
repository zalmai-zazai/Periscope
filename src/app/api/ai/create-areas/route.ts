import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import Area from "@/models/Area";
import mongoose from "mongoose";

export async function POST(request: Request) {
  try {
    console.log("🏗️ Creating areas from AI analysis");

    // 1. Authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get request data
    const body = await request.json();
    const { projectId, rooms, sketchPhotoUrl, defaultHeight = 8 } = body;

    console.log("📋 Project ID:", projectId);
    console.log("🏠 Rooms to create:", rooms?.length || 0);
    console.log("📏 Default height:", defaultHeight, "feet");

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    if (!rooms || !Array.isArray(rooms) || rooms.length === 0) {
      return NextResponse.json(
        { error: "No rooms data provided" },
        { status: 400 }
      );
    }

    await dbConnect();

    // 3. Verify project exists and user has access
    const project = await Project.findOne({
      _id: projectId,
      companyId: session.user.companyId,
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 404 }
      );
    }

    // 4. Create areas for each detected room
    const createdAreas = [];

    for (const room of rooms) {
      try {
        // Prepare area data
        const areaData: any = {
          projectId: new mongoose.Types.ObjectId(projectId),
          name: room.name || `Room ${createdAreas.length + 1}`,
          description: `Created from sketch analysis. ${room.rawText || ""}`,
          createdBy: session.user.id,
          companyId: session.user.companyId,
          sketchPhotos: sketchPhotoUrl ? [{ url: sketchPhotoUrl }] : [],
          aiAnalysis: {
            source: "sketch_analysis",
            confidence: room.confidence || 0.5,
            rawText: room.rawText || "",
            analyzedAt: new Date(),
          },
          // Set default damage assessment values
          damageCategory: "2", // Default Category 2 (Gray Water)
          damageClass: "2", // Default Class 2 (Medium Area)
          containmentNeeded: false,
          materialsAffectedPercent: 50,
          equipmentRuleVersion: "v1.0",
        };

        // Add dimensions if available
        if (
          room.dimensions &&
          room.dimensions.length &&
          room.dimensions.width
        ) {
          areaData.length = room.dimensions.length;
          areaData.width = room.dimensions.width;

          // ====== MAP UNITS TO "feet" or "meters" ======
          const aiUnit = (room.dimensions.unit || "ft").toLowerCase().trim();

          if (aiUnit === "m" || aiUnit === "meter" || aiUnit === "meters") {
            areaData.unit = "meters";
          } else {
            areaData.unit = "feet"; // Default for ft, foot, feet, ', etc.
          }

          // Calculate total area
          areaData.totalArea = room.dimensions.length * room.dimensions.width;
        } else {
          // If no dimensions, still set default unit
          areaData.unit = "feet";
        }

        // Add height (optional)
        if (room.dimensions && room.dimensions.height) {
          areaData.height = room.dimensions.height;
        } else if (defaultHeight) {
          areaData.height = defaultHeight;
        }

        // ====== ADD EQUIPMENT RECOMMENDATION ======
        if (room.equipment) {
          areaData.recommendedEquipment = {
            airMovers: room.equipment.airMovers || 0,
            lgrDehumidifiers: room.equipment.lgrDehumidifiers || 0,
            hepaAirScrubbers: room.equipment.hepaAirScrubbers || 0,
            isManualOverride: room.equipment.isManualOverride || false,
            // Store original calculation if manual override
            ...(room.equipment.isManualOverride && room.originalEquipment
              ? {
                  originalCalculation: {
                    airMovers: room.originalEquipment.airMovers || 0,
                    lgrDehumidifiers:
                      room.originalEquipment.lgrDehumidifiers || 0,
                    hepaAirScrubbers:
                      room.originalEquipment.hepaAirScrubbers || 0,
                  },
                }
              : {}),
          };
          areaData.lastCalculatedAt = new Date();
        }

        console.log(
          `Creating area: ${areaData.name} (${areaData.length || "?"}x${
            areaData.width || "?"
          } ${areaData.unit}) - Equipment: ${
            areaData.recommendedEquipment?.airMovers || 0
          }A ${areaData.recommendedEquipment?.lgrDehumidifiers || 0}L ${
            areaData.recommendedEquipment?.hepaAirScrubbers || 0
          }H`
        );

        // Create the area
        const newArea = new Area(areaData);
        await newArea.save();

        createdAreas.push({
          id: newArea._id,
          name: newArea.name,
          dimensions: {
            length: areaData.length || null,
            width: areaData.width || null,
            height: areaData.height || null,
            unit: areaData.unit,
          },
          equipment: areaData.recommendedEquipment,
        });

        console.log(`✅ Created area: ${newArea.name}`);
      } catch (roomError) {
        console.error(`❌ Failed to create area for room:`, room);
        console.error(`Error details:`, roomError);
        // Continue with other rooms
      }
    }

    // 5. Return success response
    return NextResponse.json({
      success: true,
      createdCount: createdAreas.length,
      areas: createdAreas,
      message: `Successfully created ${createdAreas.length} areas in project "${project.name}"`,
      defaultHeightUsed: defaultHeight,
    });
  } catch (error) {
    console.error("❌ Error creating areas:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create areas",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
