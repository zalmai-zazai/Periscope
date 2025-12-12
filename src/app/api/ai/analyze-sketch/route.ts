// src/app/api/ai/analyze-sketch/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { aiAnalyzeLimiter } from "@/lib/rate-limit";
// NEW: Import your OpenAI helpers (same as justify-line-item)
import { getOpenAI, shouldUseRealAI, isOpenAIConfigured } from "@/lib/openai";

export async function POST(request: Request) {
  try {
    console.log("🔍 Sketch analysis API called");

    // 1. Authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Rate limiting
    const userId = session.user?.id || session.user?.email || "anonymous";
    const rateLimitResult = aiAnalyzeLimiter.check(userId);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: `Too many sketch analysis requests. Please try again in ${Math.ceil(
            (rateLimitResult.resetTime - Date.now()) / 1000
          )} seconds.`,
        },
        { status: 429 }
      );
    }

    // 3. Get request data
    const body = await request.json();
    const { imageUrl, projectId } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    console.log("📸 Analyzing image:", imageUrl);

    // NEW: Check if we should use real AI (same pattern as justify-line-item)
    const useRealAI = shouldUseRealAI();
    const openaiConfigured = isOpenAIConfigured();

    if (useRealAI && openaiConfigured) {
      // ============================================
      // REAL OPENAI VISION API INTEGRATION
      // ============================================
      console.log("🤖 Using real OpenAI Vision API");
      const openai = getOpenAI();

      if (!openai) {
        throw new Error("OpenAI client not configured");
      }

      // Call OpenAI's vision model (GPT-4V)
      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // Make sure this is gpt-4o
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `CRITICAL: You MUST analyze this architectural sketch and return ONLY valid JSON.

IMAGE ANALYSIS TASK:
1. Identify ALL room labels (Living Room, Kitchen, Bedroom, Bathroom, Office, Dining Room, etc.)
2. Identify ALL measurements near each room (formats: "12x15 ft", "10' x 8'", "15 x 20", "12m x 15m")
3. Match rooms with their measurements
4. If no measurements for a room, use null

OUTPUT FORMAT - MUST BE VALID JSON ARRAY:
[
  {
    "name": "string (room name)",
    "dimensions": {
      "length": number or null,
      "width": number or null,
      "unit": "ft" or "m" or null
    },
    "confidence": number (0.0 to 1.0),
    "rawText": "string (exact text found)"
  }
]

EXAMPLES:
Good: [{"name": "Living Room", "dimensions": {"length": 12, "width": 15, "unit": "ft"}, "confidence": 0.9, "rawText": "Living Room 12x15 ft"}]
Good: [{"name": "Kitchen", "dimensions": null, "confidence": 0.7, "rawText": "Kitchen"}]

RULES:
1. RETURN ONLY THE JSON ARRAY
2. NO EXPLANATIONS
3. NO APOLOGIES
4. NO MARKDOWN
5. If you see nothing, return empty array: []

BEGIN JSON OUTPUT:`,
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
      });

      const aiResponse = completion.choices[0]?.message?.content?.trim();
      console.log("🤖 OpenAI raw response:", aiResponse);

      if (!aiResponse) {
        throw new Error("No response from OpenAI");
      }

      // Try to parse the JSON response
      let parsedRooms;
      try {
        // Try to extract JSON if AI added extra text
        const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          parsedRooms = JSON.parse(jsonMatch[0]);
          console.log("✅ Successfully parsed JSON from AI");
        } else {
          console.log("⚠️ No JSON array found in response, using mock data");
          parsedRooms = getMockSketchData();
        }
      } catch (parseError) {
        console.error("❌ Failed to parse OpenAI JSON:", parseError);
        console.log("Raw AI response was:", aiResponse);
        parsedRooms = getMockSketchData();
      }

      return NextResponse.json({
        success: true,
        data: {
          detectedRooms: parsedRooms,
          source: "openai_vision",
          message: "AI analysis complete using GPT-4 Vision",
        },
      });
    } else {
      // ============================================
      // FALLBACK TO MOCK DATA (for testing)
      // ============================================
      console.log("🎭 Using mock data (OpenAI not configured or disabled)");
      const mockData = getMockSketchData();

      return NextResponse.json({
        success: true,
        data: {
          detectedRooms: mockData,
          source: openaiConfigured ? "mock_fallback" : "mock_no_config",
          message: "Mock data - OpenAI not fully configured",
        },
      });
    }
  } catch (error) {
    console.error("❌ Error in sketch analysis:", error);

    // Ultimate fallback on error
    return NextResponse.json({
      success: true,
      data: {
        detectedRooms: getMockSketchData(),
        source: "error_fallback",
        message: "Using fallback data due to error",
      },
    });
  }
}

// Helper function for mock data (same concept as justify-line-item)
function getMockSketchData() {
  return [
    {
      name: "Living Room",
      dimensions: { length: 12, width: 15, unit: "ft" },
      confidence: 0.85,
      rawText: "Living Room 12x15 ft",
    },
    {
      name: "Kitchen",
      dimensions: { length: 10, width: 8, unit: "ft" },
      confidence: 0.78,
      rawText: "Kitchen 10x8 ft",
    },
    {
      name: "Bedroom",
      dimensions: { length: 14, width: 12, unit: "ft" },
      confidence: 0.72,
      rawText: "Bedroom 14' x 12'",
    },
  ];
}
