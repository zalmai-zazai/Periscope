import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import dbConnect from "@/lib/mongodb";
import LineItemCatalog from "@/models/LineItemCatalog";
import { getOpenAI, shouldUseRealAI, isOpenAIConfigured } from "@/lib/openai";
import { aiCustomLimiter } from "@/lib/rate-limit";
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // ADD RATE LIMITING CHECK
    const userId = session.user?.id || session.user?.email || "anonymous";
    const rateLimitResult = aiCustomLimiter.check(userId);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: `Too many custom AI requests. Please try again in ${Math.ceil(
            (rateLimitResult.resetTime - Date.now()) / 1000
          )} seconds.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(
              (rateLimitResult.resetTime - Date.now()) / 1000
            ).toString(),
            "X-RateLimit-Limit": "5",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": rateLimitResult.resetTime.toString(),
          },
        }
      );
    }
    await dbConnect();

    const { itemName, userPrompt, existingNotes } = await request.json();

    if (!itemName || !userPrompt) {
      return NextResponse.json(
        { error: "Item name and user prompt are required" },
        { status: 400 }
      );
    }

    // Check if we should use real AI
    const useRealAI = shouldUseRealAI();
    const openaiConfigured = isOpenAIConfigured();

    if (useRealAI && openaiConfigured) {
      // REAL OPENAI INTEGRATION
      const openai = getOpenAI();

      if (!openai) {
        throw new Error("OpenAI client not configured");
      }

      const systemPrompt = `You are an expert in property damage restoration and IICRC standards. 
      You provide professional justifications based on IICRC S500 (water damage) and S520 (mold remediation) standards.
      
      IMPORTANT INSTRUCTIONS:
      - Do NOT mention the user's question in your response
      - Provide specific IICRC section references when possible
      - Sound like you're quoting directly from the standards
      - Use professional, authoritative language
      - Focus on why certain procedures are necessary for proper restoration
      - Address common insurance adjuster concerns professionally
      
      Current item: ${itemName}
      ${existingNotes ? `Existing notes: ${existingNotes}` : ""}`;

      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 500,
        temperature: 0.3, // Lower temperature for more consistent, professional responses
      });

      const aiResponse = completion.choices[0]?.message?.content?.trim();

      if (!aiResponse) {
        throw new Error("No response from AI");
      }

      // Extract IICRC reference if possible, or use default
      const iicrcReference =
        aiResponse.includes("S500") || aiResponse.includes("S520")
          ? "Refer to specific sections mentioned above"
          : "Refer to IICRC S500/S520 standards";

      return NextResponse.json({
        success: true,
        data: {
          notes: existingNotes
            ? `${existingNotes}\n\n${aiResponse}`
            : aiResponse,
          iicrcReference: iicrcReference,
          source: "openai",
        },
      });
    } else {
      // FALLBACK TO MOCK DATA
      const generateProfessionalResponse = (
        name: string,
        prompt: string,
        existingNotes: string
      ) => {
        const promptLower = prompt.toLowerCase();

        // Keep your existing mock responses here
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
        }
        // ... keep all your existing mock responses
        else {
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
          source: openaiConfigured ? "mock_fallback" : "mock_no_config",
        },
      });
    }
  } catch (error) {
    console.error("Custom AI justification error:", error);

    // Fallback to mock data on error
    const { itemName, userPrompt, existingNotes } = await request
      .json()
      .catch(() => ({}));

    const fallbackResponse = {
      notes: `${
        existingNotes ? existingNotes + "\n\n" : ""
      }Based on IICRC standards, proper procedures should be followed for ${itemName}. Refer to S500 for water damage and S520 for mold remediation guidelines.`,
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
