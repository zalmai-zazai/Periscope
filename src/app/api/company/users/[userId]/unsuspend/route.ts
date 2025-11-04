import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

// POST /api/company/users/[userId]/unsuspend
export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only allow admins to unsuspend users
    if (session.user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    const { userId } = params;

    // Find the user to unsuspend
    const userToUnsuspend = await User.findOne({
      _id: userId,
      companyId: session.user.companyId, // Ensure user belongs to admin's company
    });

    if (!userToUnsuspend) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is already active
    if (userToUnsuspend.isActive) {
      return NextResponse.json(
        {
          error: "User is already active",
        },
        { status: 400 }
      );
    }

    // Unsuspend the user
    userToUnsuspend.isActive = true;
    userToUnsuspend.suspendedAt = undefined;
    userToUnsuspend.suspendedBy = undefined;
    userToUnsuspend.suspensionReason = undefined;

    await userToUnsuspend.save();

    console.log(
      `✅ User ${userToUnsuspend.email} unsuspended by ${session.user.email}`
    );

    return NextResponse.json({
      success: true,
      message: "User unsuspended successfully",
      user: {
        id: userToUnsuspend._id,
        name: userToUnsuspend.name,
        email: userToUnsuspend.email,
        isActive: userToUnsuspend.isActive,
      },
    });
  } catch (error) {
    console.error("User unsuspension error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
