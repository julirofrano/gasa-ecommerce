"use server";

import { sendEthicsReportEmail } from "@/lib/email/send";

interface EthicsReportResult {
  success: boolean;
  error?: string;
}

export async function submitEthicsReport(
  formData: FormData,
): Promise<EthicsReportResult> {
  const category = formData.get("category")?.toString().trim();
  const severity = formData.get("severity")?.toString().trim();
  const description = formData.get("description")?.toString().trim();

  if (!category || !severity || !description) {
    return { success: false, error: "Complete todos los campos obligatorios." };
  }

  const incidentDate =
    formData.get("incidentDate")?.toString().trim() || undefined;
  const location = formData.get("location")?.toString().trim() || undefined;
  const contact = formData.get("contact")?.toString().trim() || undefined;

  return sendEthicsReportEmail({
    category,
    severity,
    incidentDate,
    location,
    description,
    contact,
  });
}
