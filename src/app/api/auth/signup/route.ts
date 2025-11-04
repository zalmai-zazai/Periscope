import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Company from "@/models/Company";

export async function POST(request: Request) {
  try {
    console.log("🔍 Starting signup API");
    await dbConnect();

    const { name, email, password, option, companyName, joinCode } =
      await request.json();
    console.log("🔍 Signup request:", {
      name,
      email,
      option,
      companyName,
      joinCode,
    });

    // Basic validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    let company;
    let userRole = "inspector"; // Default role

    // Handle different signup paths
    if (option === "create") {
      // CREATE NEW COMPANY PATH
      if (!companyName) {
        return NextResponse.json(
          { error: "Company name is required when creating a new company" },
          { status: 400 }
        );
      }

      // Check if company name already exists
      const existingCompany = await Company.findOne({
        name: companyName.trim(),
      });
      if (existingCompany) {
        return NextResponse.json(
          { error: "Company name already taken" },
          { status: 400 }
        );
      }

      console.log("🔍 Creating new company:", companyName);

      // Create the company
      company = new Company({
        name: companyName.trim(),
        allowInspectorsCreateProjects: true,
        subscription: {
          plan: "free",
          status: "active",
        },
      });

      await company.save();
      console.log("✅ Company created:", company._id);

      // User becomes admin when creating company
      userRole = "admin";
    } else if (option === "join") {
      // JOIN EXISTING COMPANY PATH
      if (!joinCode) {
        return NextResponse.json(
          { error: "Join code is required" },
          { status: 400 }
        );
      }

      console.log("🔍 Joining company with code:", joinCode);

      // Find company by join code
      company = await Company.findOne({
        joinCode: joinCode.toUpperCase().trim(),
      });
      if (!company) {
        return NextResponse.json(
          { error: "Invalid join code" },
          { status: 400 }
        );
      }

      console.log("✅ Company found:", company.name);

      // User gets default inspector role
      userRole = "inspector";

      // Generate new join code for the company (single-use codes)
      const newJoinCode = generateJoinCode();
      company.joinCode = newJoinCode;
      await company.save();
      console.log("✅ New join code generated:", newJoinCode);
    } else {
      return NextResponse.json(
        { error: "Invalid signup option" },
        { status: 400 }
      );
    }

    // Create the user
    console.log("🔍 Creating user with role:", userRole);
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: password,
      role: userRole,
      companyId: company._id,
      emailVerified: true,
      isActive: true,
    });

    await user.save();
    console.log("✅ User created:", user._id);

    // If this was a company creation, update company with owner ID
    if (option === "create") {
      company.ownerId = user._id;
      await company.save();
      console.log("✅ Company owner set");
    }

    return NextResponse.json({
      success: true,
      message:
        option === "create"
          ? "Company created successfully!"
          : `Joined ${company.name} successfully!`,
      data: {
        userId: user._id,
        companyId: company._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: company.name,
      },
    });
  } catch (error) {
    console.error("❌ SIGNUP ERROR:");
    console.error(
      "Error message:",
      error instanceof Error ? error.message : "Unknown error"
    );
    console.error("Full error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Helper function to generate random join code
function generateJoinCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
