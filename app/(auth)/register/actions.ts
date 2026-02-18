"use server";

import {
  findPartnersByEmail,
  setPartnerPassword,
  generateAdminApprovalToken,
  generateEmailConfirmationToken,
  findCompanyByCuit,
} from "@/lib/odoo/portal";
import { createPartner, createCompanyContact } from "@/lib/odoo/partners";
import {
  sendRegistrationReceivedEmail,
  sendAdminApprovalEmail,
  sendEmailConfirmationEmail,
} from "@/lib/email/send";
import { isValidCuit, formatCuit } from "@/lib/utils/cuit";

interface RegisterState {
  error: string | null;
  success: boolean;
  pendingApproval?: boolean;
  pendingEmailConfirmation?: boolean;
}

export async function registerAction(
  _prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const accountType = (formData.get("accountType") as string) || "empresa";
  const name = (formData.get("name") as string)?.trim();
  const lastName = (formData.get("lastName") as string)?.trim();
  const company = (formData.get("company") as string)?.trim();
  const cuit = (formData.get("cuit") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const phone = (formData.get("phone") as string)?.trim();
  const password = formData.get("password") as string;

  // ── Validation ────────────────────────────────────────────
  if (!name || !lastName || !email || !phone || !password) {
    return {
      error: "Todos los campos obligatorios deben completarse.",
      success: false,
    };
  }

  if (accountType === "empresa") {
    if (!company || !cuit) {
      return { error: "Todos los campos son obligatorios.", success: false };
    }
    if (!isValidCuit(cuit)) {
      return {
        error:
          "El CUIT ingresado no es válido. Verifique el número e intente nuevamente.",
        success: false,
      };
    }
  } else {
    // Particular: CUIT is optional, but validate if provided
    if (cuit && !isValidCuit(cuit)) {
      return {
        error:
          "El CUIT/CUIL ingresado no es válido. Verifique el número e intente nuevamente.",
        success: false,
      };
    }
  }

  if (password.length < 8) {
    return {
      error: "La contraseña debe tener al menos 8 caracteres.",
      success: false,
    };
  }

  const formattedCuit = cuit ? formatCuit(cuit) : "";

  try {
    // ── Check email uniqueness ──────────────────────────────
    const existing = await findPartnersByEmail(email);
    if (existing.length > 0) {
      return {
        error:
          "Ya existe una cuenta con este correo electrónico. Intente iniciar sesión.",
        success: false,
      };
    }

    const fullName = `${name} ${lastName}`;
    let contactId: number;
    let companyName: string;

    if (accountType === "empresa") {
      // ── Empresa: company + child contact ──────────────────
      let companyId: number;

      const existingCompany = await findCompanyByCuit(formattedCuit);
      if (existingCompany) {
        companyId = existingCompany.id;
        companyName = existingCompany.name;
      } else {
        companyId = await createPartner({
          name: company,
          email,
          vat: formattedCuit,
          isCompany: true,
        });
        companyName = company;
      }

      contactId = await createCompanyContact(companyId, {
        name: fullName,
        email,
        phone,
      });
    } else {
      // ── Particular: single partner ────────────────────────
      contactId = await createPartner({
        name: fullName,
        email,
        phone,
        vat: formattedCuit || undefined,
        isCompany: false,
      });
      companyName = "";
    }

    if (accountType === "empresa") {
      // ── Empresa: admin approval required ────────────────
      // Set password hash; x_portal_active defaults to false
      await setPartnerPassword(contactId, password);

      const token = await generateAdminApprovalToken(contactId);
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const approveUrl = `${appUrl}/api/admin/approve-registration?token=${token}&action=approve`;
      const rejectUrl = `${appUrl}/api/admin/approve-registration?token=${token}&action=reject`;

      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail) {
        await sendAdminApprovalEmail(adminEmail, {
          contactName: fullName,
          companyName: companyName || "—",
          cuit: formattedCuit || "No proporcionado",
          email,
          phone,
          accountType: "Empresa",
          approveUrl,
          rejectUrl,
        });
      } else {
        console.log("[DEV] No ADMIN_EMAIL set. Approval links:");
        console.log(`[DEV] Approve: ${approveUrl}`);
        console.log(`[DEV] Reject: ${rejectUrl}`);
      }

      await sendRegistrationReceivedEmail(email, fullName);

      return { error: null, success: true, pendingApproval: true };
    } else {
      // ── Particular: email confirmation required ─────────
      // Set password hash; x_portal_active defaults to false
      await setPartnerPassword(contactId, password);

      const token = await generateEmailConfirmationToken(contactId);
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const confirmUrl = `${appUrl}/api/confirm-email?token=${token}`;

      await sendEmailConfirmationEmail(email, fullName, confirmUrl);

      return {
        error: null,
        success: true,
        pendingEmailConfirmation: true,
      };
    }
  } catch (error) {
    console.error("Registration error:", error);
    return {
      error:
        "Ocurrió un error al crear su cuenta. Por favor intente nuevamente.",
      success: false,
    };
  }
}
