"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import {
  findPartnersByEmail,
  hasPortalAccount,
  isPortalActive,
  generateSignupToken,
} from "@/lib/odoo/portal";
import { sendMagicLinkEmail } from "@/lib/email/send";

export async function loginAction(
  _prevState: { error: string | null },
  formData: FormData,
) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const callbackUrl = (formData.get("callbackUrl") as string) || "/profile";

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Credenciales incorrectas. Intente nuevamente." };
    }
    // Next.js redirect throws NEXT_REDIRECT — rethrow
    throw error;
  }

  return { error: null };
}

export async function requestMagicLink(
  email: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Security: always return success regardless of email existence
    const partners = await findPartnersByEmail(email);
    if (partners.length === 0) return { success: true };

    // Find the first partner that has an active portal account
    let portalPartner = null;
    for (const p of partners) {
      if ((await hasPortalAccount(p.id)) && (await isPortalActive(p.id))) {
        portalPartner = p;
        break;
      }
    }
    if (!portalPartner) return { success: true };

    const token = await generateSignupToken(portalPartner.id);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const magicLinkUrl = `${appUrl}/magic-link?token=${token}`;
    await sendMagicLinkEmail(email, portalPartner.name, magicLinkUrl);

    return { success: true };
  } catch (error) {
    console.error("requestMagicLink error:", error);
    return { success: true }; // Don't reveal errors to client
  }
}

/**
 * Check if an email belongs to an inactive (pending approval) user.
 * Used on login failure to show a more specific message.
 */
export async function checkPendingRegistration(
  email: string,
): Promise<{ pending: boolean }> {
  try {
    const partners = await findPartnersByEmail(email);
    for (const p of partners) {
      if ((await hasPortalAccount(p.id)) && !(await isPortalActive(p.id))) {
        return { pending: true };
      }
    }
    return { pending: false };
  } catch (error) {
    console.error("checkPendingRegistration error:", error);
    return { pending: false };
  }
}
