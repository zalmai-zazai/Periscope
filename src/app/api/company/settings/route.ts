import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import dbConnect from "@/lib/mongodb";
import Company from "@/models/Company";

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only allow admins to update company settings
    if (session.user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    const updates = await request.json();

    // Validate and prepare update object
    const validSettings = [
      "allowInspectorsCreateProjects",
      "allowEstimatorsCreateProjects",
      "allowEstimatorsEditSubmitted",
      "allowEstimatorsAddCosts",
    ];

    const updateData: any = {};

    for (const [key, value] of Object.entries(updates)) {
      if (validSettings.includes(key) && typeof value === "boolean") {
        updateData[key] = value;
      }
    }

    // Check if we have valid updates
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid settings provided" },
        { status: 400 }
      );
    }

    // Update the company settings
    const company = await Company.findOneAndUpdate(
      { _id: session.user.companyId },
      updateData,
      { new: true } // Return updated document
    );

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        allowInspectorsCreateProjects: company.allowInspectorsCreateProjects,
        allowEstimatorsCreateProjects: company.allowEstimatorsCreateProjects,
        allowEstimatorsEditSubmitted: company.allowEstimatorsEditSubmitted,
        allowEstimatorsAddCosts: company.allowEstimatorsAddCosts,
      },
    });
  } catch (error) {
    console.error("Update company settings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
