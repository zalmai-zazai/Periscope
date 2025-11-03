import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Company from "@/models/Company";

export async function GET() {
  try {
    await dbConnect();

    // Test if we can query the database
    const userCount = await User.countDocuments();
    const companyCount = await Company.countDocuments();

    return NextResponse.json({
      success: true,
      message: "Database connected successfully!",
      data: {
        userCount,
        companyCount,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
