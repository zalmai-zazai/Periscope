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

    const { itemName, userPrompt, existingNotes } = await request.json();

    if (!itemName || !userPrompt) {
      return NextResponse.json(
        { error: "Item name and user prompt are required" },
        { status: 400 }
      );
    }

    // Enhanced mock responses that sound like they're from IICRC standards
    const generateProfessionalResponse = (
      name: string,
      prompt: string,
      existingNotes: string
    ) => {
      const promptLower = prompt.toLowerCase();

      // Professional responses based on common adjuster questions
      if (
        promptLower.includes("drying chamber") ||
        promptLower.includes("equipment") ||
        promptLower.includes("too much")
      ) {
        return {
          notes: `${
            existingNotes ? existingNotes + "\n\n" : ""
          }IICRC S500 Standard requires dedicated drying equipment for each separate drying chamber to maintain proper environmental control. Section 9.3.2 states: "Each drying chamber must be controlled independently to maintain specific temperature, humidity, and airflow requirements." Using shared equipment between chambers can lead to cross-contamination and inefficient drying. Proper equipment allocation is necessary to achieve Class 1 (<70% RH), Class 2 (70-80% RH), or Class 3 (80-100% RH) drying conditions as defined in S500 Section 9.4.1.`,
          iicrcReference:
            "S500 Section 9.3.2, 9.4.1 - Drying Chamber Requirements",
        };
      } else if (
        promptLower.includes("cost") ||
        promptLower.includes("price") ||
        promptLower.includes("expensive")
      ) {
        return {
          notes: `${
            existingNotes ? existingNotes + "\n\n" : ""
          }IICRC S500 emphasizes that proper remediation following established standards prevents future microbial growth and structural damage. Section 14.2.3 notes: "While initial costs may seem elevated, compliance with IICRC standards reduces long-term liability and secondary damage." The investment in proper equipment and procedures aligns with insurance industry best practices for complete restoration.`,
          iicrcReference: "S500 Section 14.2.3 - Cost Considerations",
        };
      } else if (
        promptLower.includes("time") ||
        promptLower.includes("duration") ||
        promptLower.includes("long")
      ) {
        return {
          notes: `${
            existingNotes ? existingNotes + "\n\n" : ""
          }Per IICRC S500 Section 9.6.4, drying timeframes are determined by material type, water category, and environmental conditions. The standard requires monitoring until materials reach drying goals: "Drying shall continue until all affected materials achieve equilibrium moisture content or specific drying goals." Rushing the process can lead to microbial amplification. Typical drying requires 3-5 days with proper documentation at each stage.`,
          iicrcReference: "S500 Section 9.6.4 - Drying Timeframes",
        };
      } else if (
        promptLower.includes("safety") ||
        promptLower.includes("risk") ||
        promptLower.includes("ppe")
      ) {
        return {
          notes: `${
            existingNotes ? existingNotes + "\n\n" : ""
          }IICRC S520 Section 6.2.1 mandates appropriate PPE based on contamination levels: "Respiratory protection, gloves, and protective clothing shall be worn during mold remediation activities." For Category 2 or 3 water, S500 Section 11.3.4 requires containment and personal protective equipment to prevent exposure to contaminants and microorganisms.`,
          iicrcReference:
            "S520 Section 6.2.1, S500 Section 11.3.4 - Safety Protocols",
        };
      } else if (
        promptLower.includes("containment") ||
        promptLower.includes("barrier")
      ) {
        return {
          notes: `${
            existingNotes ? existingNotes + "\n\n" : ""
          }IICRC S500 Section 11.3.2 requires critical barriers and containment: "Containment shall be established to prevent cross-contamination of unaffected areas." For mold remediation, S520 Section 7.3.1 specifies: "Containment shall be constructed of durable materials and maintain negative pressure." Proper containment is essential for Category 2 and 3 water losses.`,
          iicrcReference:
            "S500 Section 11.3.2, S520 Section 7.3.1 - Containment Requirements",
        };
      } else if (
        promptLower.includes("document") ||
        promptLower.includes("record") ||
        promptLower.includes("proof")
      ) {
        return {
          notes: `${
            existingNotes ? existingNotes + "\n\n" : ""
          }IICRC S500 Section 12.4 emphasizes comprehensive documentation: "The restorer shall maintain detailed records including moisture mapping, drying logs, and photographic documentation." Proper documentation supports insurance claims and demonstrates compliance with industry standards. Daily moisture readings and equipment logs are required throughout the drying process.`,
          iicrcReference: "S500 Section 12.4 - Documentation Requirements",
        };
      } else {
        // Generic professional response that doesn't reveal the user's question
        return {
          notes: `${
            existingNotes ? existingNotes + "\n\n" : ""
          }Based on IICRC standards, this remediation requires professional assessment and proper procedures. S500 emphasizes systematic approaches to water damage restoration, while S520 provides specific guidance for mold remediation. Following established protocols ensures complete restoration and prevents future issues.`,
          iicrcReference: "Refer to S500/S520 applicable sections",
        };
      }
    };

    const response = generateProfessionalResponse(
      itemName,
      userPrompt,
      existingNotes
    );

    return NextResponse.json({
      success: true,
      data: {
        notes: response.notes,
        iicrcReference: response.iicrcReference,
        source: "mock_custom",
      },
    });
  } catch (error) {
    console.error("Custom AI justification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
