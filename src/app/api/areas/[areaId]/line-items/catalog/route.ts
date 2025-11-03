import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import dbConnect from "@/lib/mongodb";
import LineItemCatalog from "@/models/LineItemCatalog";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");

    let query: any = { isActive: true };

    if (search) {
      query.$or = [
        { code: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      query.category = category;
    }

    let catalogItems = await LineItemCatalog.find(query)
      .sort({ code: 1 })
      .limit(50)
      .lean();

    // TEMPORARY: If no items in database, return sample data for testing
    // Remove this after we add proper catalog seeding
    // if (catalogItems.length === 0) {
    //   catalogItems = [
    //     {
    //       _id: "1",
    //       code: "WD-CARPET-RMV",
    //       description: "Carpet removal, water damaged",
    //       unit: "sqft",
    //       category: "water-damage",
    //       iicrcReference: "S500",
    //       defaultNotes: "Remove and dispose of water damaged carpet",
    //       isActive: true,
    //       __v: 0,
    //     },
    //     {
    //       _id: "2",
    //       code: "WD-DRYWALL-RMV",
    //       description: "Drywall removal, water damaged",
    //       unit: "sqft",
    //       category: "water-damage",
    //       iicrcReference: "S500",
    //       defaultNotes: "Remove and dispose of water damaged drywall",
    //       isActive: true,
    //       __v: 0,
    //     },
    //     {
    //       _id: "3",
    //       code: "WD-BASE-RMV",
    //       description: "Baseboard removal, water damaged",
    //       unit: "linear-ft",
    //       category: "water-damage",
    //       iicrcReference: "S500",
    //       defaultNotes: "Remove and dispose of water damaged baseboards",
    //       isActive: true,
    //       __v: 0,
    //     },
    //   ] as any; // Use 'as any' to bypass TypeScript checking for temporary data
    // }

    return NextResponse.json({
      success: true,
      data: catalogItems,
    });
  } catch (error) {
    console.error("Get catalog items error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
