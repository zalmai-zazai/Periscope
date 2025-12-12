import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

// PATCH /api/company/users/[userId]/role
export async function PATCH(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only allow admins to update roles
    if (session.user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    const { userId } = await params;
    const { role } = await request.json();

    // Validate role
    const validRoles = [
      "admin",
      "project-manager",
      "estimator",
      "inspector",
      "mitigation-tech",
    ];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Find the user to update
    const userToUpdate = await User.findOne({
      _id: userId,
      companyId: session.user.companyId, // Ensure user belongs to admin's company
    });

    if (!userToUpdate) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent admins from changing their own role (safety measure)
    if (userToUpdate._id.toString() === session.user.id) {
      return NextResponse.json(
        {
          error: "Cannot change your own role",
        },
        { status: 400 }
      );
    }

    // Update the user's role
    userToUpdate.role = role;
    await userToUpdate.save();

    console.log(`✅ User ${userToUpdate.email} role updated to: ${role}`);

    return NextResponse.json({
      success: true,
      message: "User role updated successfully",
      user: {
        id: userToUpdate._id,
        name: userToUpdate.name,
        email: userToUpdate.email,
        role: userToUpdate.role,
      },
    });
  } catch (error) {
    console.error("Role update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
