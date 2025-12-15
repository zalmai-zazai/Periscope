import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

// DELETE /api/company/users/[userId]
export async function DELETE(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only allow admins to remove users
    if (session.user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    const { userId } = await params;

    // Find the user to remove
    const userToRemove = await User.findOne({
      _id: userId,
      companyId: session.user.companyId, // Ensure user belongs to admin's company
    });

    if (!userToRemove) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent admins from removing themselves (safety measure)
    if (userToRemove._id.toString() === session.user.id) {
      return NextResponse.json(
        {
          error: "Cannot remove yourself from the company",
        },
        { status: 400 }
      );
    }

    // Remove the user from the company
    await User.findByIdAndDelete(userId);

    console.log(`✅ User ${userToRemove.email} removed from company`);

    return NextResponse.json({
      success: true,
      message: "User removed from company successfully",
    });
  } catch (error) {
    console.error("User removal error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
