import nodemailer from "nodemailer";

const emailServer = process.env.EMAIL_SERVER;
const emailFrom = process.env.EMAIL_FROM;

if (!emailServer) {
  console.warn("EMAIL_SERVER not configured - emails will not be sent");
}

// Create transporter

const transporter = emailServer
  ? nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: process.env.EMAIL_FROM, // Use env variable
        pass: process.env.EMAIL_PASSWORD, // Use env variable
      },
    })
  : null;

export async function sendEmail(to: string, subject: string, html: string) {
  if (!transporter || !emailFrom) {
    console.log("📧 Email not sent (no configuration):", { to, subject });
    return { success: false, message: "Email not configured" };
  }

  try {
    const info = await transporter.sendMail({
      from: emailFrom,
      to,
      subject,
      html,
    });

    console.log("📧 Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email send error:", error);
    return { success: false, error };
  }
}

// Test email configuration (optional)
export async function testEmailConfig() {
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
