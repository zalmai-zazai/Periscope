import { NextResponse } from "next/server";
import { testEmailConfig, sendEmail } from "@/lib/email";

export async function GET() {
  try {
    // Test email server connection
    const connectionTest = await testEmailConfig();

    // Try to send a test email
    const emailTest = await sendEmail(
      "test@example.com",
      "DamageScope Test Email",
      `
        <h2>Test Email from DamageScope</h2>
        <p>If you receive this, your email configuration is working!</p>
        <p>Time: ${new Date().toISOString()}</p>
      `
    );

    return NextResponse.json({
      success: true,
      connectionTest,
      emailTest,
      config: {
        hasEmailServer: !!process.env.EMAIL_SERVER,
        hasEmailFrom: !!process.env.EMAIL_FROM,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        config: {
          hasEmailServer: !!process.env.EMAIL_SERVER,
          hasEmailFrom: !!process.env.EMAIL_FROM,
        },
      },
      { status: 500 }
    );
  }
}
