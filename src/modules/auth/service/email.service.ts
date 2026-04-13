import { EmailJobData } from "@/jobs";
import { helpers } from "@/utils/helper";
import { logger } from "@/utils/logger";

const { sendEmail } = helpers;

export const sendWelcomeEmail = async (email: string, name?: string) => {
  const subject = "Welcome to Marketplace";
  const html = `
    <h1>Welcome to Marketplace!</h1>
    <p>Hi${name ? " " + name : ""},</p>
    <p>Thank you for registering. Please verify your email to get started.</p>
    <p>If you didn't create this account, please ignore this email.</p>
  `;
  return sendEmail(email, subject, html);
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify-email?token=${token}`;
  const subject = "Verify your email";
  const html = `
    <h1>Verify your email</h1>
    <p>Click the link below to verify your email address:</p>
    <a href="${verificationUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
    <p>Or copy this link: ${verificationUrl}</p>
    <p>This link expires in 24 hours.</p>
  `;
  return sendEmail(email, subject, html);
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${token}`;
  const subject = "Reset your password";
  const html = `
    <h1>Reset your password</h1>
    <p>Click the link below to reset your password:</p>
    <a href="${resetUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
    <p>Or copy this link: ${resetUrl}</p>
    <p>This link expires in 1 hour.</p>
    <p>If you didn't request a password reset, please ignore this email.</p>
  `;
  return sendEmail(email, subject, html);
};

export const sendOrderConfirmationEmail = async (
  email: string,
  orderId: string,
  total: string,
) => {
  const subject = "Order Confirmation";
  const html = `
    <h1>Order Confirmed!</h1>
    <p>Your order #${orderId} has been confirmed.</p>
    <p>Total: $${total}</p>
    <p>We'll notify you when your order ships.</p>
  `;
  return sendEmail(email, subject, html);
};

export const sendMfaTokenEmail = async (email: string, token: string) => {
  const subject = "Your MFA Token";
  const html = `
    <h1>Your MFA Token</h1>
    <p>Your authentication token is: <strong>${token}</strong></p>
    <p>This token will expire in 5 minutes.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `;
  return sendEmail(email, subject, html);
};

export const emailService = {
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendOrderConfirmationEmail,
  sendMfaTokenEmail,
};

export const processEmailJob = async (data: EmailJobData) => {
  const { type, to, data: jobData } = data;

  switch (type) {
    case "welcome":
      await sendWelcomeEmail(to, jobData.name as string);
      break;
    case "verification":
      await sendVerificationEmail(to, jobData.token as string);
      break;
    case "password-reset":
      await sendPasswordResetEmail(to, jobData.token as string);
      break;
    case "order-confirmation":
      await sendOrderConfirmationEmail(
        to,
        jobData.orderId as string,
        jobData.total as string,
      );
      break;
    case "mfa-token":
      await sendMfaTokenEmail(to, jobData.token as string);
      break;
    default:
      logger.warn(`Unknown email type: ${type}`);
  }
};
