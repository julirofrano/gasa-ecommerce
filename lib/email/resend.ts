import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

// In development, use Resend's sandbox address (no domain verification needed).
// Emails sent from onboarding@resend.dev can only be delivered to the Resend
// account owner's email. Set FROM_EMAIL in .env.local to override.
const isDev = process.env.NODE_ENV !== "production";

export const FROM_EMAIL =
  process.env.FROM_EMAIL ||
  (isDev
    ? "GASA Portal <onboarding@resend.dev>"
    : "GASA Portal <portal@gasesaconcagua.com.ar>");

export const REPLY_TO = process.env.REPLY_TO || "info@gasesaconcagua.com.ar";
