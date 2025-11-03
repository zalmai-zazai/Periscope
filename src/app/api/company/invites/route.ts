import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import dbConnect from "@/lib/mongodb";
import Company from "@/models/Company";
import User from "@/models/User";
import Invite from "@/models/Invite";
import { sendEmail } from "@/lib/email";

// GET /api/company/invites - Get pending invites
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only allow admins to view invites
    if (session.user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    const invites = await Invite.find({
      companyId: session.user.companyId,
      status: "pending",
    })
      .populate("invitedBy", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: invites,
    });
  } catch (error) {
    console.error("Error fetching invites:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/company/invites - Send email invite
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only allow admins to send invites
    if (session.user?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    const { email, role } = await request.json();

    // Validate input
    if (!email || !role) {
      return NextResponse.json(
        { error: "Email and role are required" },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ["admin", "project-manager", "estimator", "inspector"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Get company info
    const company = await Company.findOne({ _id: session.user.companyId });
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Check if user already exists in company
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
      companyId: session.user.companyId,
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "User already exists in your company",
        },
        { status: 400 }
      );
    }

    // Check for existing pending invite
    const existingInvite = await Invite.findOne({
      email: email.toLowerCase(),
      companyId: session.user.companyId,
      status: "pending",
    });

    if (existingInvite) {
      return NextResponse.json(
        {
          error: "Pending invite already exists for this email",
        },
        { status: 400 }
      );
    }

    // Generate unique token
    const token = require("crypto").randomBytes(32).toString("hex");

    // Create invite (expires in 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invite = new Invite({
      email: email.toLowerCase(),
      companyId: session.user.companyId,
      role,
      token,
      invitedBy: session.user.id,
      expiresAt,
    });

    await invite.save();

    console.log(`✅ Invite created for ${email} to join ${company.name}`);

    // Send email (we'll implement this in next step)
    const inviteLink = `${process.env.NEXTAUTH_URL}/auth/accept-invite?token=${token}`;

    // In your existing POST function, update the email sending part:
    const emailResult = await sendEmail(
      email,
      `You're invited to join ${company.name} on DamageScope`,
      `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px;">DamageScope</h1>
        <p style="margin: 10px 0 0; opacity: 0.9;">Property Damage Assessment</p>
      </div>
      
      <div style="padding: 30px; background: white;">
        <h2 style="color: #333; margin-bottom: 20px;">You've Been Invited!</h2>
        <p style="color: #666; line-height: 1.6;">
          You have been invited to join <strong>${
            company.name
          }</strong> on DamageScope as a <strong>${role}</strong>.
        </p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #667eea;">
          <p style="margin: 0; color: #555;">
            <strong>Company:</strong> ${company.name}<br>
            <strong>Role:</strong> ${role}<br>
            <strong>Expires:</strong> ${new Date(
              expiresAt
            ).toLocaleDateString()}
          </p>
        </div>

        <a href="${inviteLink}" style="display: inline-block; background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
          Accept Invitation
        </a>
        
        <p style="color: #888; font-size: 14px; margin-top: 25px;">
          This invitation link will expire in 7 days.<br>
          If you didn't expect this invitation, you can safely ignore this email.
        </p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
        <p style="margin: 0;">DamageScope &copy; ${new Date().getFullYear()}</p>
      </div>
    </div>
  `
    );

    return NextResponse.json({
      success: true,
      message: "Invitation sent successfully",
      invite: {
        id: invite._id,
        email: invite.email,
        role: invite.role,
        expiresAt: invite.expiresAt,
      },
      emailSent: emailResult.success,
    });
  } catch (error) {
    console.error("Invite creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
