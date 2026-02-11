import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { odooClient } from "@/lib/odoo/client";

const REPORT_NAME = "account.report_invoice";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const invoiceId = Number(id);

  if (!invoiceId || isNaN(invoiceId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const pdf = await odooClient.fetchReportPdf(REPORT_NAME, invoiceId);

    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="factura-${invoiceId}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Invoice PDF download error:", error);
    return NextResponse.json(
      { error: "No se pudo descargar el documento" },
      { status: 500 },
    );
  }
}
