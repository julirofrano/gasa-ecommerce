import { resend, FROM_EMAIL, REPLY_TO } from "./resend";
import { ACCENT_COLOR } from "@/lib/utils/constants";

const isDev = process.env.NODE_ENV !== "production";

interface SendResult {
  success: boolean;
  error?: string;
}

function emailLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#f2f2f2;font-family:Inter,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f2f2f2;">
    <tr><td align="center" style="padding:40px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border:4px solid #000000;">
        <!-- Header -->
        <tr>
          <td style="background-color:#000000;padding:32px 40px;">
            <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.3em;text-transform:uppercase;color:${ACCENT_COLOR};">
              Gases Aconcagua S.A.
            </p>
            <p style="margin:12px 0 0;font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:-0.04em;color:#ffffff;line-height:1;">
              Portal de Clientes
            </p>
          </td>
        </tr>
        <!-- Content -->
        <tr>
          <td style="padding:40px;">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="border-top:2px solid #000000;padding:24px 40px;">
            <p style="margin:0;font-size:11px;color:#666666;line-height:1.6;">
              Este correo fue enviado automáticamente por el Portal de Clientes de Gases Aconcagua S.A.
              Si no solicitó este correo, puede ignorarlo de forma segura.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function ctaButton(url: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:32px 0;">
  <tr>
    <td style="background-color:#000000;border:2px solid #000000;padding:16px 32px;">
      <a href="${url}" style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#ffffff;text-decoration:none;">${label}</a>
    </td>
  </tr>
</table>`;
}

export async function sendWelcomeEmail(
  to: string,
  name: string,
  magicLinkUrl: string,
): Promise<SendResult> {
  const firstName = name.split(" ")[0];
  const html = emailLayout(`
    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.3em;text-transform:uppercase;color:${ACCENT_COLOR};">
      Bienvenido
    </p>
    <p style="margin:16px 0 0;font-size:15px;line-height:1.7;color:#000000;">
      Hola <strong>${firstName}</strong>, su cuenta en el Portal de Clientes de GASA ha sido creada.
    </p>
    <p style="margin:12px 0 0;font-size:15px;line-height:1.7;color:#000000;">
      Desde el portal puede consultar el estado de sus pedidos, gestionar sus envases, descargar comprobantes y más.
    </p>
    <p style="margin:12px 0 0;font-size:15px;line-height:1.7;color:#000000;">
      Haga clic en el siguiente enlace para verificar su correo e ingresar por primera vez:
    </p>
    ${ctaButton(magicLinkUrl, "INGRESAR AL PORTAL")}
    <p style="margin:0;font-size:12px;color:#666666;line-height:1.6;">
      Este enlace expira en 7 días. Si no realizó una compra con nosotros, puede ignorar este correo.
    </p>
  `);

  if (isDev) {
    console.log("[DEV] Welcome email magic link:", magicLinkUrl);
    console.log(`[DEV] To: ${to}, Name: ${name}`);
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      replyTo: REPLY_TO,
      subject: "Bienvenido al Portal de Clientes — GASA",
      html,
    });
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Failed to send welcome email:", message);
    // In dev, still return success so the flow continues
    if (isDev) return { success: true };
    return { success: false, error: message };
  }
}

export async function sendRegistrationReceivedEmail(
  to: string,
  name: string,
): Promise<SendResult> {
  const firstName = name.split(" ")[0];
  const html = emailLayout(`
    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.3em;text-transform:uppercase;color:${ACCENT_COLOR};">
      Solicitud Recibida
    </p>
    <p style="margin:16px 0 0;font-size:15px;line-height:1.7;color:#000000;">
      Hola <strong>${firstName}</strong>, recibimos su solicitud de registro en el Portal de Clientes de GASA.
    </p>
    <p style="margin:12px 0 0;font-size:15px;line-height:1.7;color:#000000;">
      Nuestro equipo revisará su solicitud y le notificaremos por correo electrónico cuando su cuenta sea aprobada.
    </p>
    <p style="margin:24px 0 0;font-size:12px;color:#666666;line-height:1.6;">
      Este proceso suele completarse en 1-2 días hábiles. Si tiene consultas, no dude en contactarnos.
    </p>
  `);

  if (isDev) {
    console.log(`[DEV] Registration received email → To: ${to}, Name: ${name}`);
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      replyTo: REPLY_TO,
      subject: "Recibimos su solicitud de registro — GASA",
      html,
    });
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Failed to send registration received email:", message);
    if (isDev) return { success: true };
    return { success: false, error: message };
  }
}

export async function sendAdminApprovalEmail(
  to: string,
  data: {
    contactName: string;
    companyName: string;
    cuit: string;
    email: string;
    phone: string;
    accountType: string;
    approveUrl: string;
    rejectUrl: string;
  },
): Promise<SendResult> {
  const companyRow =
    data.accountType === "Empresa"
      ? `<tr>
        <td style="padding:8px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#666666;">Empresa</td>
        <td style="padding:8px 0;font-size:14px;color:#000000;">${data.companyName}</td>
      </tr>`
      : "";

  const html = emailLayout(`
    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.3em;text-transform:uppercase;color:${ACCENT_COLOR};">
      Nueva Solicitud de Registro
    </p>
    <p style="margin:16px 0 0;font-size:15px;line-height:1.7;color:#000000;">
      Se recibió una nueva solicitud de registro en el portal de clientes:
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;width:100%;">
      <tr>
        <td style="padding:8px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#666666;width:120px;">Tipo de cuenta</td>
        <td style="padding:8px 0;font-size:14px;color:#000000;">${data.accountType}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#666666;">Contacto</td>
        <td style="padding:8px 0;font-size:14px;color:#000000;">${data.contactName}</td>
      </tr>
      ${companyRow}
      <tr>
        <td style="padding:8px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#666666;">CUIT</td>
        <td style="padding:8px 0;font-size:14px;color:#000000;">${data.cuit}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#666666;">Email</td>
        <td style="padding:8px 0;font-size:14px;color:#000000;">${data.email}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#666666;">Teléfono</td>
        <td style="padding:8px 0;font-size:14px;color:#000000;">${data.phone}</td>
      </tr>
    </table>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:32px 0;">
      <tr>
        <td style="background-color:#000000;border:2px solid #000000;padding:16px 32px;">
          <a href="${data.approveUrl}" style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#ffffff;text-decoration:none;">APROBAR</a>
        </td>
        <td style="width:16px;"></td>
        <td style="background-color:#ffffff;border:2px solid #000000;padding:16px 32px;">
          <a href="${data.rejectUrl}" style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#000000;text-decoration:none;">RECHAZAR</a>
        </td>
      </tr>
    </table>
  `);

  if (isDev) {
    console.log(`[DEV] Admin approval email → To: ${to}`);
    console.log(`[DEV] Approve URL: ${data.approveUrl}`);
    console.log(`[DEV] Reject URL: ${data.rejectUrl}`);
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      replyTo: REPLY_TO,
      subject: `Nueva solicitud de registro (${data.accountType}): ${data.contactName}${data.accountType === "Empresa" ? ` — ${data.companyName}` : ""}`,
      html,
    });
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Failed to send admin approval email:", message);
    if (isDev) return { success: true };
    return { success: false, error: message };
  }
}

export async function sendRegistrationRejectedEmail(
  to: string,
  name: string,
): Promise<SendResult> {
  const firstName = name.split(" ")[0];
  const html = emailLayout(`
    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.3em;text-transform:uppercase;color:${ACCENT_COLOR};">
      Solicitud de Registro
    </p>
    <p style="margin:16px 0 0;font-size:15px;line-height:1.7;color:#000000;">
      Hola <strong>${firstName}</strong>, lamentamos informarle que su solicitud de registro en el Portal de Clientes de GASA no fue aprobada en esta oportunidad.
    </p>
    <p style="margin:12px 0 0;font-size:15px;line-height:1.7;color:#000000;">
      Si cree que esto es un error o desea más información, por favor contáctenos respondiendo a este correo.
    </p>
  `);

  if (isDev) {
    console.log(`[DEV] Registration rejected email → To: ${to}, Name: ${name}`);
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      replyTo: REPLY_TO,
      subject: "Actualización sobre su solicitud de registro — GASA",
      html,
    });
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Failed to send registration rejected email:", message);
    if (isDev) return { success: true };
    return { success: false, error: message };
  }
}

export async function sendEmailConfirmationEmail(
  to: string,
  name: string,
  confirmUrl: string,
): Promise<SendResult> {
  const firstName = name.split(" ")[0];
  const html = emailLayout(`
    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.3em;text-transform:uppercase;color:${ACCENT_COLOR};">
      Confirme su Correo
    </p>
    <p style="margin:16px 0 0;font-size:15px;line-height:1.7;color:#000000;">
      Hola <strong>${firstName}</strong>, gracias por registrarse en el Portal de Clientes de GASA.
    </p>
    <p style="margin:12px 0 0;font-size:15px;line-height:1.7;color:#000000;">
      Para activar su cuenta, haga clic en el siguiente enlace:
    </p>
    ${ctaButton(confirmUrl, "CONFIRMAR CORREO")}
    <p style="margin:0;font-size:12px;color:#666666;line-height:1.6;">
      Este enlace expira en 7 días. Si no creó esta cuenta, puede ignorar este correo de forma segura.
    </p>
  `);

  if (isDev) {
    console.log("[DEV] Email confirmation link:", confirmUrl);
    console.log(`[DEV] To: ${to}, Name: ${name}`);
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      replyTo: REPLY_TO,
      subject: "Confirme su correo electrónico — GASA",
      html,
    });
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Failed to send email confirmation email:", message);
    if (isDev) return { success: true };
    return { success: false, error: message };
  }
}

export async function sendMagicLinkEmail(
  to: string,
  name: string,
  magicLinkUrl: string,
): Promise<SendResult> {
  const firstName = name.split(" ")[0];
  const html = emailLayout(`
    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.3em;text-transform:uppercase;color:${ACCENT_COLOR};">
      Enlace de Acceso
    </p>
    <p style="margin:16px 0 0;font-size:15px;line-height:1.7;color:#000000;">
      Hola <strong>${firstName}</strong>, recibimos una solicitud de acceso a su cuenta en el Portal de Clientes de GASA.
    </p>
    <p style="margin:12px 0 0;font-size:15px;line-height:1.7;color:#000000;">
      Haga clic en el siguiente enlace para ingresar:
    </p>
    ${ctaButton(magicLinkUrl, "INGRESAR AHORA")}
    <p style="margin:0;font-size:12px;color:#666666;line-height:1.6;">
      Este enlace expira en 7 días. Si no solicitó este acceso, puede ignorar este correo de forma segura.
    </p>
  `);

  if (isDev) {
    console.log("[DEV] Magic link email:", magicLinkUrl);
    console.log(`[DEV] To: ${to}, Name: ${name}`);
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      replyTo: REPLY_TO,
      subject: "Enlace de acceso al Portal — GASA",
      html,
    });
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Failed to send magic link email:", message);
    if (isDev) return { success: true };
    return { success: false, error: message };
  }
}
