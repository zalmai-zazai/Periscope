import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import dbConnect from "@/lib/mongodb";
import LineItemCatalog from "@/models/LineItemCatalog";
import { getOpenAI, shouldUseRealAI, isOpenAIConfigured } from "@/lib/openai";
import { aiJustifyLimiter } from "@/lib/rate-limit";
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ADD RATE LIMITING CHECK
    const userId = session.user?.id || session.user?.email || "anonymous";
    const rateLimitResult = aiJustifyLimiter.check(userId);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: `Too many AI justification requests. Please try again in ${Math.ceil(
            (rateLimitResult.resetTime - Date.now()) / 1000
          )} seconds.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(
              (rateLimitResult.resetTime - Date.now()) / 1000
            ).toString(),
            "X-RateLimit-Limit": "10",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
          },
        }
      );
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

    // Check if we should use real AI
    const useRealAI = shouldUseRealAI();
    const openaiConfigured = isOpenAIConfigured();

    if (useRealAI && openaiConfigured) {
      // REAL OPENAI INTEGRATION FOR AUTO-JUSTIFICATION
      const openai = getOpenAI();

      if (!openai) {
        throw new Error("OpenAI client not configured");
      }

      const systemPrompt = `You are an expert in property damage restoration and IICRC standards.
      Generate a professional justification for why this line item is necessary, based on IICRC S500 (water damage) and S520 (mold remediation) standards.

      ITEM: ${itemName}
      UNIT: ${unit}

      REQUIREMENTS:
      - Provide specific IICRC section references when possible
      - Explain why this procedure is necessary for proper restoration
      - Include technical details about the process
      - Mention any safety considerations
      - Use professional, authoritative language
      - Keep response concise but comprehensive (2-3 paragraphs max)

      Focus on the restoration necessity and industry standards compliance.`;

      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
        messages: [{ role: "system", content: systemPrompt }],
        max_tokens: 400,
        temperature: 0.3,
      });

      const aiResponse = completion.choices[0]?.message?.content?.trim();

      if (!aiResponse) {
        throw new Error("No response from AI");
      }

      // Extract or determine IICRC reference
      let iicrcReference = "Refer to IICRC S500/S520 standards";
      if (aiResponse.includes("S500")) {
        iicrcReference = "S500 - Water Damage Restoration";
      } else if (aiResponse.includes("S520")) {
        iicrcReference = "S520 - Mold Remediation";
      }

      // Save to database for future use (if it matches a catalog item)
      const catalogItem = await LineItemCatalog.findOne({
        description: { $regex: itemName, $options: "i" },
      });

      if (catalogItem) {
        catalogItem.aiJustificationNotes = aiResponse;
        catalogItem.aiIicrcReference = iicrcReference;
        catalogItem.aiJustificationSource = "ai";
        catalogItem.aiJustifiedAt = new Date();
        await catalogItem.save();
      }

      return NextResponse.json({
        success: true,
        data: {
          notes: aiResponse,
          iicrcReference: iicrcReference,
          source: "openai",
        },
      });
    } else {
      // FALLBACK TO MOCK DATA
      const generateMockJustification = (name: string, unitType: string) => {
        const mockData = {
          drywall: {
            notes:
              "Remove water-compromised drywall per S500 standards. Category 2/3 water requires removal of porous materials. Check moisture content before proceeding with removal. Document all removed materials for insurance claims. Proper removal prevents microbial growth and structural instability.",
            iicrcReference: "S500 Section 11.4.2",
          },
          carpet: {
            notes:
              "Carpet removal required due to water saturation. Padding must also be removed and disposed. Subfloor inspection recommended after removal. Allow proper drying time before installation of new materials. Follow S500 guidelines for carpet restoration decisions.",
            iicrcReference: "S500 Section 11.5.1",
          },
          mold: {
            notes:
              "Mold remediation per S520 standards. Containment required. HEPA filtration during work. Post-remediation verification needed. Source identification and moisture control are critical for successful remediation.",
            iicrcReference: "S520 Section 8.3",
          },
          baseboard: {
            notes:
              "Remove water-damaged baseboards. Check wall cavity for hidden moisture. Replace with moisture-resistant materials if reconstruction needed. Proper removal allows for thorough drying of wall assemblies.",
            iicrcReference: "S500 Section 11.4.3",
          },
          dehumidifier: {
            notes:
              "LGR dehumidifier placement for structural drying. Monitor every 24 hours. Maintain 40-50% RH target. Document drying progress. Proper equipment selection based on psychrometric calculations per S500.",
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
          notes: `Professional assessment required for: ${name}. Document conditions and follow appropriate IICRC standards based on water category and material type. Consider Category 1, 2, or 3 water classification and porous vs. non-porous materials.`,
          iicrcReference: "Refer to S500/S520",
        };
      };

      const justification = generateMockJustification(itemName, unit);

      // Save to database for future use (if it matches a catalog item)
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
          source: openaiConfigured ? "mock_fallback" : "mock_no_config",
        },
      });
    }
  } catch (error) {
    console.error("AI justification error:", error);

    // Fallback to basic mock data on error
    const { itemName } = await request.json().catch(() => ({}));

    const fallbackResponse = {
      notes: `Professional assessment required for: ${itemName}. Follow IICRC S500/S520 standards based on water category and material type. Document all procedures and moisture readings.`,
      iicrcReference: "Refer to IICRC S500/S520",
    };

    return NextResponse.json({
      success: true,
      data: {
        notes: fallbackResponse.notes,
        iicrcReference: fallbackResponse.iicrcReference,
        source: "error_fallback",
      },
    });
  }
}
