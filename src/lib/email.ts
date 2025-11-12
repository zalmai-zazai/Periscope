import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

const emailService = process.env.EMAIL_SERVICE;
const emailFrom = process.env.EMAIL_FROM;
const emailPassword = process.env.EMAIL_PASSWORD;

console.log("🔧 Email Config Debug:", {
  emailService,
  emailFrom,
  hasPassword: !!emailPassword,
  passwordLength: emailPassword?.length,
});

// Create transporter with proper typing
let transporter: Transporter | null = null;

if (emailService === "gmail" && emailFrom && emailPassword) {
  console.log("✅ Configuring Gmail transporter...");
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailFrom,
      pass: emailPassword,
    },
  });
} else {
  console.warn("❌ Gmail not configured - emails will not be sent");
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  message?: string;
  error?: unknown;
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<EmailResult> {
  // ✅ KEEP THIS - Always log to terminal for development
  console.log("📧 [TERMINAL] Reset code would be sent to:", to);
  console.log("📧 [TERMINAL] Email subject:", subject);
  console.log("📧 [TERMINAL] Email content:", html);

  if (!transporter || !emailFrom) {
    console.log(
      "📧 Email not sent (no configuration) - but code is logged above"
    );
    return { success: false, message: "Email not configured" };
  }

  try {
    const info = await transporter.sendMail({
      from: emailFrom,
      to,
      subject,
      html,
    });

    console.log("📧 ✅ Real email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Real email send error:", error);
    return { success: false, error };
  }
}

// Test email configuration
export async function testEmailConfig(): Promise<boolean> {
  if (!transporter) {
    console.log("❌ Email transporter not configured");
    return false;
  }

  try {
    await transporter.verify();
    console.log("✅ Email server connection successful");
    return true;
  } catch (error) {
    console.error("❌ Email server connection failed:", error);
    return false;
  }
}
