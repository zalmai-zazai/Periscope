import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import User from "@/models/User";
import Company from "@/models/Company";
import Area from "@/models/Area";
import LineItem from "@/models/LineItem";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // AWAIT the params first
    const { projectId } = await params;
    const { reportType, options } = await request.json();

    // Get project with all related data
    const project = await Project.findById(projectId)
      .populate("inspectorId", "firstName lastName")
      .populate("mitTechId", "firstName lastName")
      .populate("estimatorId", "firstName lastName")
      .populate("companyId")
      .lean();

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Get areas for this project
    const areas = await Area.find({ projectId }).lean();

    // Get all line items for this project
    const lineItems = await LineItem.find({ projectId }).lean();

    // Check permissions based on report type
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only estimators and above can generate insurance claim reports
    if (
      reportType === "insurance_claim" &&
      !["estimator", "admin", "super-admin"].includes(user.role)
    ) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Generate report data based on options
    const reportData = await generateReportData(
      project,
      areas,
      lineItems,
      reportType,
      options,
      user
    );

    return NextResponse.json({
      success: true,
      reportData,
      message: "Report data prepared successfully",
    });
  } catch (error) {
    console.error("Report generation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function generateReportData(
  project: any,
  areas: any[],
  lineItems: any[],
  reportType: string,
  options: any,
  user: any
) {
  const company = await Company.findById(project.companyId);

  // Calculate totals from areas and line items
  const areaSummaries = areas.map((area) => {
    // Get line items for this specific area
    const areaLineItems = lineItems.filter(
      (item: any) => item.areaId?.toString() === area._id.toString()
    );

    const totalCost = areaLineItems.reduce(
      (sum: number, item: any) => sum + (item.totalCost || 0),
      0
    );

    // Convert equipment recommendations to the format expected by PDF
    const equipmentRecommendations = [];
    if (area.recommendedEquipment) {
      if (area.recommendedEquipment.airMovers > 0) {
        equipmentRecommendations.push({
          name: "Air Mover",
          quantity: area.recommendedEquipment.airMovers,
        });
      }
      if (area.recommendedEquipment.lgrDehumidifiers > 0) {
        equipmentRecommendations.push({
          name: "LGR Dehumidifier",
          quantity: area.recommendedEquipment.lgrDehumidifiers,
        });
      }
      if (area.recommendedEquipment.hepaAirScrubbers > 0) {
        equipmentRecommendations.push({
          name: "HEPA Air Scrubber",
          quantity: area.recommendedEquipment.hepaAirScrubbers,
        });
      }
    }

    return {
      areaName: area.name,
      description: area.description,
      equipment: equipmentRecommendations,
      lineItems: options.includeAmounts ? areaLineItems : [],
      totalCost: options.includeAmounts ? totalCost : 0,
      photos: options.includePhotos ? area.photos || [] : [],
      damageCategory: area.damageCategory,
      damageClass: area.damageClass,
      containmentNeeded: area.containmentNeeded,
      materialsAffectedPercent: area.materialsAffectedPercent,
      measurements: {
        length: area.length,
        width: area.width,
        height: area.height,
        totalArea: area.totalArea,
        unit: area.unit,
      },
    };
  });

  const totalProjectCost = options.includeAmounts
    ? areaSummaries.reduce((sum: number, area: any) => sum + area.totalCost, 0)
    : 0;

  // Get sketches if option is enabled
  const sketches = options.includeSketches ? project.skitchPhotos || [] : [];

  return {
    metadata: {
      generatedAt: new Date().toISOString(),
      reportType,
      version: 1,
      options,
    },
    company: {
      name: company?.name,
      address: company?.address,
      phone: company?.phone,
      email: company?.email,
      logo: company?.logo,
    },
    project: {
      name: project.name,
      projectNumber: project.projectNumber,
      clientName: project.clientName,
      clientAddress: project.address,
      clientEmail: project.clientEmail,
      clientPhone: project.clientPhone,
      dateOfLoss: project.dateOfLoss,
      typeOfLoss: project.damageType,
      description: project.description,
      insuranceCarrier: project.insuranceCarrier,
      claimNumber: project.claimNumber,
      status: project.status,
      createdAt: project.createdAt,
    },
    team: {
      inspector: project.inspectorId
        ? `${project.inspectorId.firstName} ${project.inspectorId.lastName}`
        : "Not assigned",
      mitigationTech: project.mitTechId
        ? `${project.mitTechId.firstName} ${project.mitTechId.lastName}`
        : "Not assigned",
      estimator: project.estimatorId
        ? `${project.estimatorId.firstName} ${project.estimatorId.lastName}`
        : "Not assigned",
    },
    assessment: {
      areas: areaSummaries,
      totalProjectCost,
      equipmentSummary: options.includeEquipment
        ? generateEquipmentSummary(areaSummaries)
        : [],
      preparedBy: `${user.firstName} ${user.lastName}`,
      preparerRole: user.role,
    },
    visualContent: {
      includePhotos: options.includePhotos,
      includeSketches: options.includeSketches,
      sketches: sketches,
    },
  };
}

function generateEquipmentSummary(areaSummaries: any[]) {
  const equipmentMap = new Map();

  areaSummaries.forEach((area) => {
    area.equipment.forEach((equip: any) => {
      const key = equip.name;
      if (equipmentMap.has(key)) {
        equipmentMap.set(key, equipmentMap.get(key) + (equip.quantity || 1));
      } else {
        equipmentMap.set(key, equip.quantity || 1);
      }
    });
  });

  return Array.from(equipmentMap.entries()).map(([name, quantity]) => ({
    name,
    quantity,
  }));
}
