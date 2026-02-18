import { NextRequest } from "next/server";
import {
  validateEmailConfirmationToken,
  setPortalActive,
} from "@/lib/odoo/portal";
import { ACCENT_COLOR } from "@/lib/utils/constants";

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
    .cta { display:inline-block; margin-top:24px; background:#000; border:2px solid #000; padding:16px 32px; font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#fff; text-decoration:none; }
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

  if (!token) {
    return htmlPage(
      "Enlace Inválido",
      "<p>El enlace proporcionado no es válido o está incompleto.</p>",
      true,
    );
  }

  const tokenData = await validateEmailConfirmationToken(token);
  if (!tokenData) {
    return htmlPage(
      "Enlace Expirado",
      "<p>Este enlace de confirmación ha expirado o ya fue utilizado. Intente registrarse nuevamente.</p>",
      true,
    );
  }

  try {
    await setPortalActive(tokenData.contactId, true);
  } catch {
    // May already be active (double-click). That's fine.
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const loginUrl = `${appUrl}/login`;

  return htmlPage(
    "Correo Confirmado",
    `<p>Su correo electrónico ha sido verificado y su cuenta está activa.</p>
     <p>Ya puede iniciar sesión con su correo y contraseña.</p>
     <a class="cta" href="${loginUrl}">INICIAR SESIÓN</a>`,
  );
}
