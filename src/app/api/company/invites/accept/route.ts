import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Invite from "@/models/Invite";
import User from "@/models/User";
import Company from "@/models/Company";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const { token } = await request.json();

    // Validate input
    if (!token) {
      return NextResponse.json(
        { error: "Invite token is required" },
        { status: 400 }
      );
    }

    // Find the invite
    const invite = await Invite.findOne({
      token,
      status: "pending",
      expiresAt: { $gt: new Date() }, // Not expired
    }).populate("companyId", "name");

    if (!invite) {
      return NextResponse.json(
        {
          error:
            "Invalid or expired invitation. Please ask for a new invitation.",
        },
        { status: 404 }
      );
    }

    // Check if user already exists with this email
    let user = await User.findOne({ email: invite.email });

    if (user) {
      // User exists - check if they're already in the company
      if (
        user.companyId &&
        user.companyId.toString() === invite.companyId._id.toString()
      ) {
        return NextResponse.json(
          {
            error: "You are already a member of this company.",
          },
          { status: 400 }
        );
      }

      // Update existing user with company and role
      user.companyId = invite.companyId._id;
      user.role = invite.role;
      await user.save();
    } else {
      // Create new user (they'll need to set password later)
      user = new User({
        name: invite.email.split("@")[0], // Default name from email
        email: invite.email,
        companyId: invite.companyId._id,
        role: invite.role,
        emailVerified: new Date(), // Auto-verify since they came from invite
      });
      await user.save();
    }

    // Update invite status
    invite.status = "accepted";
    await invite.save();

    console.log(
      `✅ User ${user.email} joined company ${invite.companyId.name} as ${invite.role}`
    );

    return NextResponse.json({
      success: true,
      message: `Successfully joined ${invite.companyId.name} as ${invite.role}`,
      data: {
        companyName: invite.companyId.name,
        role: invite.role,
        userId: user._id,
      },
    });
  } catch (error) {
    console.error("Accept invite error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
