import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import dbConnect from "@/lib/mongodb";
import LineItem from "@/models/LineItem";
import Area from "@/models/Area";

export async function POST(
  request: Request,
  { params }: { params: { areaId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { name, itemCode, unit, quantity, notes, iicrcReference } =
      await request.json();

    if (!name || !unit) {
      return NextResponse.json(
        { error: "Name and unit are required" },
        { status: 400 }
      );
    }

    // Verify area exists and user has access
    const area = await Area.findOne({
      _id: params.areaId,
    }).populate("projectId");

    if (
      !area ||
      (area.projectId as any).companyId.toString() !== session.user.companyId
    ) {
      return NextResponse.json({ error: "Area not found" }, { status: 404 });
    }

    // Create line item
    const lineItem = new LineItem({
      name,
      itemCode,
      unit,
      quantity: quantity || 1,
      notes,
      iicrcReference,
      areaId: params.areaId,
      projectId: (area.projectId as any)._id,
      companyId: session.user.companyId,
    });

    await lineItem.save();

    return NextResponse.json({
      success: true,
      message: "Line item created successfully",
      data: lineItem,
    });
  } catch (error) {
    console.error("Create line item error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { areaId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Verify area access
    const area = await Area.findOne({
      _id: params.areaId,
    }).populate("projectId");

    if (
      !area ||
      (area.projectId as any).companyId.toString() !== session.user.companyId
    ) {
      return NextResponse.json({ error: "Area not found" }, { status: 404 });
    }

    // Get line items for this area
    const lineItems = await LineItem.find({
      areaId: params.areaId,
    })
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: lineItems,
    });
  } catch (error) {
    console.error("Get line items error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { areaId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { lineItemId } = await request.json();

    if (!lineItemId) {
      return NextResponse.json(
        { error: "Line item ID is required" },
        { status: 400 }
      );
    }

    // Verify line item exists and user has access
    const lineItem = await LineItem.findOne({
      _id: lineItemId,
      areaId: params.areaId,
    }).populate("areaId");

    if (
      !lineItem ||
      (lineItem.areaId as any).companyId.toString() !== session.user.companyId
    ) {
      return NextResponse.json(
        { error: "Line item not found" },
        { status: 404 }
      );
    }

    await LineItem.deleteOne({ _id: lineItemId });

    return NextResponse.json({
      success: true,
      message: "Line item deleted successfully",
    });
  } catch (error) {
    console.error("Delete line item error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
