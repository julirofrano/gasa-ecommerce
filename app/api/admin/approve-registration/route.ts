import { NextRequest } from "next/server";
import {
  validateAdminApprovalToken,
  setPortalActive,
  generateSignupToken,
} from "@/lib/odoo/portal";
import { odooClient } from "@/lib/odoo/client";
import {
  sendWelcomeEmail,
  sendRegistrationRejectedEmail,
} from "@/lib/email/send";
import { ACCENT_COLOR } from "@/lib/utils/constants";
import type { OdooPartner } from "@/lib/odoo/types";

function htmlPage(title: string, message: string, isError = false) {
  const borderColor = isError ? "#c00" : "#000";
  return new Response(
    `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title} — GASA</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:Inter,'Helvetica Neue',Arial,sans-serif; background:#f2f2f2; display:flex; align-items:center; justify-content:center; min-height:100vh; padding:16px; }
    .card { max-width:480px; width:100%; background:#fff; border:4px solid ${borderColor}; }
    .header { background:#000; padding:32px 40px; }
    .header .label { font-size:11px; font-weight:700; letter-spacing:0.3em; text-transform:uppercase; color:${ACCENT_COLOR}; }
    .header .title { margin-top:12px; font-size:24px; font-weight:900; text-transform:uppercase; letter-spacing:-0.04em; color:#fff; line-height:1; }
    .body { padding:40px; }
    .body p { font-size:15px; line-height:1.7; color:#000; }
    .body p + p { margin-top:12px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <p class="label">Gases Aconcagua S.A.</p>
      <p class="title">${title}</p>
    </div>
    <div class="body">
      ${message}
    </div>
  </div>
</body>
</html>`,
    { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const token = searchParams.get("token");
  const action = searchParams.get("action");

  if (!token || !action || !["approve", "reject"].includes(action)) {
    return htmlPage(
      "Enlace Inválido",
      "<p>El enlace proporcionado no es válido o está incompleto.</p>",
      true,
    );
  }

  const tokenData = await validateAdminApprovalToken(token);
  if (!tokenData) {
    return htmlPage(
      "Enlace Expirado",
      "<p>Este enlace de aprobación ha expirado o ya fue utilizado. Contacte al administrador del sistema.</p>",
      true,
    );
  }

  const { contactId } = tokenData;

  // Read partner info for emails
  const partners = await odooClient.read<OdooPartner>(
    "res.partner",
    [contactId],
    ["name", "email"],
  );
  const partner = partners[0];
  if (!partner?.email) {
    return htmlPage(
      "Error",
      "<p>No se encontró el contacto asociado a esta solicitud.</p>",
      true,
    );
  }

  if (action === "approve") {
    // Activate portal access
    await setPortalActive(contactId, true);

    // Generate magic link and send welcome email
    const signupToken = await generateSignupToken(contactId);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const magicLinkUrl = `${appUrl}/magic-link?token=${signupToken}`;

    await sendWelcomeEmail(partner.email, partner.name, magicLinkUrl);

    return htmlPage(
      "Registro Aprobado",
      `<p>La cuenta de <strong>${partner.name}</strong> (${partner.email}) ha sido activada.</p>
       <p>Se envió un correo de bienvenida con el enlace de acceso.</p>`,
    );
  }

  // action === "reject"
  // Deactivate portal access and archive the partner contact
  await setPortalActive(contactId, false);
  await odooClient.write("res.partner", [contactId], { active: false });

  await sendRegistrationRejectedEmail(partner.email, partner.name);

  return htmlPage(
    "Registro Rechazado",
    `<p>La solicitud de <strong>${partner.name}</strong> (${partner.email}) ha sido rechazada.</p>
     <p>Se envió un correo de notificación al solicitante.</p>`,
  );
}
