import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { seedLineItemCatalog } from "@/lib/seed-catalog";

// GET - for testing if route works
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Seed catalog route is working!",
  });
}

// POST - for importing from JSON file
export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await seedLineItemCatalog();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
      });
    } else {
      return NextResponse.json(
        { error: "Failed to import catalog", details: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Import catalog error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
