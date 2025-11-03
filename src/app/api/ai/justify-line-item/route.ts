import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import dbConnect from "@/lib/mongodb";
import LineItemCatalog from "@/models/LineItemCatalog";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { itemName, unit } = await request.json();

    if (!itemName) {
      return NextResponse.json(
        { error: "Item name is required" },
        { status: 400 }
      );
    }

    // 1. First, try to find existing catalog item with AI justification
    const existingCatalogItem = await LineItemCatalog.findOne({
      description: { $regex: itemName, $options: "i" },
      aiJustificationSource: { $in: ["ai", "manual"] },
    });

    if (existingCatalogItem && existingCatalogItem.aiJustificationNotes) {
      // Use existing AI justification from database
      return NextResponse.json({
        success: true,
        data: {
          notes: existingCatalogItem.aiJustificationNotes,
          iicrcReference: existingCatalogItem.aiIicrcReference,
          source: "database",
        },
      });
    }

    // 2. If no existing AI justification, generate mock data
    const generateMockJustification = (name: string, unitType: string) => {
      const mockData = {
        drywall: {
          notes:
            "Remove water-compromised drywall per S500 standards. Category 2/3 water requires removal of porous materials. Check moisture content before proceeding with removal.",
          iicrcReference: "S500 Section 11.4.2",
        },
        carpet: {
          notes:
            "Carpet removal required due to water saturation. Padding must also be removed and disposed. Subfloor inspection recommended after removal.",
          iicrcReference: "S500 Section 11.5.1",
        },
        mold: {
          notes:
            "Mold remediation per S520 standards. Containment required. HEPA filtration during work. Post-remediation verification needed.",
          iicrcReference: "S520 Section 8.3",
        },
        baseboard: {
          notes:
            "Remove water-damaged baseboards. Check wall cavity for hidden moisture. Replace with moisture-resistant materials if reconstruction needed.",
          iicrcReference: "S500 Section 11.4.3",
        },
        dehumidifier: {
          notes:
            "LGR dehumidifier placement for structural drying. Monitor every 24 hours. Maintain 40-50% RH target. Document drying progress.",
          iicrcReference: "S500 Section 9.2.4",
        },
      };

      const lowerName = name.toLowerCase();
      for (const [key, data] of Object.entries(mockData)) {
        if (lowerName.includes(key)) {
          return data;
        }
      }

      return {
        notes: `Professional assessment required for: ${name}. Document conditions and follow appropriate IICRC standards based on water category and material type.`,
        iicrcReference: "Refer to S500/S520",
      };
    };

    const justification = generateMockJustification(itemName, unit);

    // 3. Save to database for future use (if it matches a catalog item)
    const catalogItem = await LineItemCatalog.findOne({
      description: { $regex: itemName, $options: "i" },
    });

    if (catalogItem) {
      catalogItem.aiJustificationNotes = justification.notes;
      catalogItem.aiIicrcReference = justification.iicrcReference;
      catalogItem.aiJustificationSource = "manual"; // "manual" for mock data
      catalogItem.aiJustifiedAt = new Date();
      await catalogItem.save();
    }

    return NextResponse.json({
      success: true,
      data: {
        notes: justification.notes,
        iicrcReference: justification.iicrcReference,
        source: catalogItem ? "database_saved" : "mock",
      },
    });
  } catch (error) {
    console.error("AI justification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
