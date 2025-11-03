import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import dbConnect from "@/lib/mongodb";
import Company from "@/models/Company";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Get company data
    const company = await Company.findOne({ _id: session.user.companyId });
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Get users in this company
    // Update the users query to include isActive:
    // Update the users query to include suspension fields:
    const users = await User.find({ companyId: session.user.companyId })
      .select("name email role isActive suspendedAt suspensionReason")
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        company,
        users,
      },
    });
  } catch (error) {
    console.error("Company data fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
