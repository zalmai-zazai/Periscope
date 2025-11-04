import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import dbConnect from "@/lib/mongodb";
import Company from "@/models/Company";

// Handle POST requests to generate new join codes
export async function POST(request: Request) {
  try {
    console.log("🔍 POST /api/company/join-code called");

    const session = await getServerSession(authOptions);

    if (!session) {
      console.log("❌ No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only allow admins to generate join codes
    if (session.user?.role !== "admin") {
      console.log("❌ User is not admin:", session.user?.role);
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();
    console.log("✅ Database connected");

    // Find the user's company
    const company = await Company.findOne({ _id: session.user.companyId });
    if (!company) {
      console.log("❌ Company not found for ID:", session.user.companyId);
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    console.log("🔍 Found company:", company.name);

    // Generate a new join code
    const newJoinCode = generateJoinCode();
    console.log("🔍 Generated new join code:", newJoinCode);

    company.joinCode = newJoinCode;
    await company.save();

    console.log(`✅ New join code saved for ${company.name}: ${newJoinCode}`);

    return NextResponse.json({
      success: true,
      message: "New join code generated",
      joinCode: newJoinCode,
    });
  } catch (error) {
    console.error("❌ Join code generation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to generate random join code
function generateJoinCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Also add a GET method to check if the route is working
export async function GET() {
  return NextResponse.json({
    message: "Join code API is working",
    usage: "Send POST request to generate new join code",
  });
}
