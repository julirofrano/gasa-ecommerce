"use server";

import { sendContactFormEmail } from "@/lib/email/send";

interface ContactFormResult {
  success: boolean;
  error?: string;
}

export async function submitContactForm(
  formData: FormData,
): Promise<ContactFormResult> {
  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const subject = formData.get("subject")?.toString().trim();
  const message = formData.get("message")?.toString().trim();

  if (!name || !email || !subject || !message) {
    return { success: false, error: "Complete todos los campos obligatorios." };
  }

  const company = formData.get("company")?.toString().trim() || undefined;
  const phone = formData.get("phone")?.toString().trim() || undefined;

  return sendContactFormEmail({
    name,
    company,
    email,
    phone,
    subject,
    message,
  });
}
