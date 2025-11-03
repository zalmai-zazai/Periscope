import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

// POST /api/company/users/[userId]/suspend
export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only allow admins to suspend users
    if (session.user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    const { userId } = params;
    const { reason } = await request.json();

    // Find the user to suspend
    const userToSuspend = await User.findOne({
      _id: userId,
      companyId: session.user.companyId, // Ensure user belongs to admin's company
    });

    if (!userToSuspend) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent admins from suspending themselves
    if (userToSuspend._id.toString() === session.user.id) {
      return NextResponse.json(
        {
          error: "Cannot suspend yourself",
        },
        { status: 400 }
      );
    }

    // Check if user is already suspended
    if (!userToSuspend.isActive) {
      return NextResponse.json(
        {
          error: "User is already suspended",
        },
        { status: 400 }
      );
    }

    // Suspend the user
    userToSuspend.isActive = false;
    userToSuspend.suspendedAt = new Date();
    userToSuspend.suspendedBy = session.user.id;
    userToSuspend.suspensionReason = reason || "No reason provided";

    await userToSuspend.save();

    console.log(
      `✅ User ${userToSuspend.email} suspended by ${session.user.email}`
    );

    return NextResponse.json({
      success: true,
      message: "User suspended successfully",
      user: {
        id: userToSuspend._id,
        name: userToSuspend.name,
        email: userToSuspend.email,
        isActive: userToSuspend.isActive,
        suspendedAt: userToSuspend.suspendedAt,
      },
    });
  } catch (error) {
    console.error("User suspension error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
