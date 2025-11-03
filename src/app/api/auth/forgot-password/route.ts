import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { sendEmail } from "@/lib/email";
export async function POST(request: Request) {
  try {
    await dbConnect();

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    // Don't reveal if user exists or not for security
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If the email exists, a reset code has been generated",
      });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration (1 hour from now)
    const resetPasswordExpires = new Date();
    resetPasswordExpires.setHours(resetPasswordExpires.getHours() + 1);

    // Save to user
    user.resetPasswordToken = code;
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save();

    const emailResult = await sendEmail(
      email,
      "Your DamageScope Password Reset Code",
      `
        <h2>Password Reset Request</h2>
        <p>Your password reset code is: <strong>${code}</strong></p>
        <p>This code will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    );

    console.log(
      `Reset code ${code} sent to ${email}, email success:`,
      emailResult.success
    );

    return NextResponse.json({
      success: true,
      message: "Reset code generated successfully",
      data: {
        code, // This will be shown to user for testing
        expiresAt: resetPasswordExpires,
      },
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
