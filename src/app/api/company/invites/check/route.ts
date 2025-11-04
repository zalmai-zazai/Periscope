import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Invite from "@/models/Invite";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Find the invite
    const invite = await Invite.findOne({
      token,
      status: "pending",
      expiresAt: { $gt: new Date() },
    }).populate("companyId", "name");

    if (!invite) {
      return NextResponse.json(
        {
          error: "Invalid or expired invitation",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        companyName: invite.companyId.name,
        role: invite.role,
        email: invite.email,
      },
    });
  } catch (error) {
    console.error("Check invite error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
