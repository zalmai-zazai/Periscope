import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import dbConnect from "@/lib/mongodb";
import Project from "@/models/Project";
import Company from "@/models/Company";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const {
      name,
      address,
      clientName,
      clientEmail,
      clientPhone,
      damageType,
      description,
    } = await request.json();

    // Validate required fields
    if (!name || !address || !clientName || !damageType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user is allowed to create projects
    if (session.user?.role === "inspector") {
      const company = await Company.findOne({ _id: session.user.companyId });
      if (!company?.allowInspectorsCreateProjects) {
        return NextResponse.json(
          {
            error: "Your company does not allow inspectors to create projects",
          },
          { status: 403 }
        );
      }
    }

    // Create new project
    const project = new Project({
      name,
      address,
      clientName,
      clientEmail,
      clientPhone,
      damageType,
      description,
      inspectorId: session.user.id,
      companyId: session.user.companyId,
      status: "draft",
    });

    await project.save();

    return NextResponse.json({
      success: true,
      message: "Project created successfully",
      data: project,
    });
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Build query based on user role
    let query: any = { companyId: session.user.companyId };

    // Inspectors only see their own projects
    if (session.user?.role === "inspector") {
      query.inspectorId = session.user.id;
    }

    const projects = await Project.find(query)
      .populate("inspectorId", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error("Get projects error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
