import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { odooClient } from "@/lib/odoo/client";
import { getInvoiceById } from "@/lib/odoo/invoices";
import { verifyResourceOwnership } from "@/lib/auth/ownership";

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
    // Verify the invoice belongs to the user's company
    const invoice = await getInvoiceById(invoiceId);
    if (!invoice) {
      return NextResponse.json(
        { error: "Documento no encontrado" },
        { status: 404 },
      );
    }

    const isOwner = await verifyResourceOwnership(invoice.partner_id[0]);
    if (!isOwner) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

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
