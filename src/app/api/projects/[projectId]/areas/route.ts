import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import dbConnect from "@/lib/mongodb";
import Area from "@/models/Area";
import Project from "@/models/Project";
import LineItem from "@/models/LineItem";
import { deleteImage } from "@/lib/cloudinary";

export async function POST(request: Request, context: any) {
  const params = await context.params; // unwrap
  const projectId = params.projectId;

  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const {
      name,
      description,
      length,
      width,
      height,
      unit,
      // NEW: Damage assessment fields
      damageCategory,
      damageClass,
      containmentNeeded,
      materialsAffectedPercent,
      // NEW: Equipment data
      recommendedEquipment,
      equipmentRuleVersion,
      lastCalculatedAt,
    } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Area name is required" },
        { status: 400 }
      );
    }

    // Verify project exists and user has access
    const project = await Project.findOne({
      _id: params.projectId,
      companyId: session.user.companyId,
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Create area with all data including equipment
    const area = new Area({
      name,
      description,
      length,
      width,
      height,
      unit: unit || "feet",
      // NEW: Damage assessment fields with defaults
      damageCategory: damageCategory || "2",
      damageClass: damageClass || "2",
      containmentNeeded: containmentNeeded || false,
      materialsAffectedPercent: materialsAffectedPercent || 50,
      // NEW: Equipment data with proper structure
      recommendedEquipment: recommendedEquipment
        ? {
            airMovers: recommendedEquipment.airMovers || 0,
            lgrDehumidifiers: recommendedEquipment.lgrDehumidifiers || 0,
            hepaAirScrubbers: recommendedEquipment.hepaAirScrubbers || 0,
            isManualOverride: recommendedEquipment.isManualOverride || false,
            originalCalculation: recommendedEquipment.originalCalculation || {
              airMovers: recommendedEquipment.airMovers || 0,
              lgrDehumidifiers: recommendedEquipment.lgrDehumidifiers || 0,
              hepaAirScrubbers: recommendedEquipment.hepaAirScrubbers || 0,
            },
          }
        : undefined,
      equipmentRuleVersion: equipmentRuleVersion || "v1.0",
      lastCalculatedAt: lastCalculatedAt || new Date(),
      projectId: params.projectId,
      companyId: session.user.companyId,
    });

    await area.save();

    return NextResponse.json({
      success: true,
      message: "Area created successfully",
      data: area,
    });
  } catch (error) {
    console.error("Create area error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request, context: any) {
  const params = await context.params; // unwrap
  const projectId = params.projectId;

  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Verify project access
    const project = await Project.findOne({
      _id: params.projectId,
      companyId: session.user.companyId,
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Get areas for this project
    const areas = await Area.find({
      projectId: params.projectId,
    })
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: areas,
    });
  } catch (error) {
    console.error("Get areas error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, context: any) {
  const params = await context.params; // unwrap
  const projectId = params.projectId;

  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { areaId } = await request.json();

    if (!areaId) {
      return NextResponse.json(
        { error: "Area ID is required" },
        { status: 400 }
      );
    }

    // Verify area exists and user has access
    const area = await Area.findOne({
      _id: areaId,
      projectId: params.projectId,
      companyId: session.user.companyId,
    });

    if (!area) {
      return NextResponse.json({ error: "Area not found" }, { status: 404 });
    }

    // DELETE AREA PHOTOS FROM CLOUDINARY
    if (area.photos && area.photos.length > 0) {
      console.log(
        `🗑️ Deleting ${area.photos.length} photos from Cloudinary...`
      );

      for (const photoUrl of area.photos) {
        try {
          // Extract publicId from URL
          const urlParts = photoUrl.split("/");
          const fileName = urlParts[urlParts.length - 1];
          const publicId = fileName.split(".")[0];

          await deleteImage(publicId);
          console.log(`✅ Deleted photo: ${publicId}`);
        } catch (error) {
          console.error(`❌ Failed to delete photo: ${photoUrl}`, error);
          // Continue with other photos even if one fails
        }
      }
    }

    // Delete all line items in this area
    await LineItem.deleteMany({ areaId });

    // Delete the area
    await Area.deleteOne({ _id: areaId });

    return NextResponse.json({
      success: true,
      message: "Area and all associated photos deleted successfully",
    });
  } catch (error) {
    console.error("Delete area error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, context: any) {
  const params = await context.params; // unwrap
  const projectId = params.projectId;

  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { areaId, name, description, length, width, height, unit } =
      await request.json();

    if (!areaId) {
      return NextResponse.json(
        { error: "Area ID is required" },
        { status: 400 }
      );
    }

    // Verify area exists and user has access
    const area = await Area.findOne({
      _id: areaId,
      projectId: params.projectId,
      companyId: session.user.companyId,
    });

    if (!area) {
      return NextResponse.json({ error: "Area not found" }, { status: 404 });
    }

    // Update area
    const updatedArea = await Area.findByIdAndUpdate(
      areaId,
      {
        name,
        description,
        length,
        width,
        height,
        unit,
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Area updated successfully",
      data: updatedArea,
    });
  } catch (error) {
    console.error("Update area error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
