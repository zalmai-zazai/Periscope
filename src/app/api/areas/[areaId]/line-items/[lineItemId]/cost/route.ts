import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import dbConnect from "@/lib/mongodb";
import LineItem from "@/models/LineItem";

export async function PUT(
  request: Request,
  { params }: { params: { areaId: string; lineItemId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only estimators can add costs
    if (session.user.role !== "estimator") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    const { unitCost } = await request.json();

    if (!unitCost || unitCost < 0) {
      return NextResponse.json(
        { error: "Valid unit cost is required" },
        { status: 400 }
      );
    }
    console.log("Cost update request:", {
      areaId: params.areaId,
      lineItemId: params.lineItemId,
      unitCost,
      sessionUser: session.user.id,
    });
    // Get the line item and verify it belongs to the area
    const lineItem = await LineItem.findOne({
      _id: params.lineItemId,
      areaId: params.areaId,
    });
    console.log("Found line item:", lineItem ? "Yes" : "No");
    if (!lineItem) {
      return NextResponse.json(
        { error: "Line item not found" },
        { status: 404 }
      );
    }

    // Calculate total cost
    const totalCost = unitCost * lineItem.quantity;

    // Update with cost data
    const updatedLineItem = await LineItem.findByIdAndUpdate(
      params.lineItemId,
      {
        unitCost,
        totalCost,
        costAddedBy: session.user.id,
        costAddedAt: new Date(),
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Cost added successfully",
      data: updatedLineItem,
    });
  } catch (error) {
    console.error("Add cost error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
