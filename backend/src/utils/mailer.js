import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { logger } from "./logger.js";

let transporter = null;
let initialized = false;

function getTransporter() {
  if (initialized) return transporter;
  initialized = true;

  if (!env.SMTP_USER || !env.SMTP_PASS) {
    logger.warn("SMTP not configured — emails will be skipped");
    return null;
  }

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: false, // STARTTLS on 587
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });

  return transporter;
}

export async function sendEmail({ to, subject, text, html }) {
  const t = getTransporter();
  if (!t) {
    logger.warn(`Email skipped (no SMTP): "${subject}" → ${to}`);
    return { skipped: true };
  }

  try {
    const info = await t.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject,
      text,
      html,
    });
    logger.info(`Email sent: "${subject}" → ${to} (${info.messageId})`);
    return { messageId: info.messageId };
  } catch (err) {
    // Never crash a request because email failed
    logger.error(`Email failed to ${to}: ${err.message}`);
    return { error: err.message };
  }
}