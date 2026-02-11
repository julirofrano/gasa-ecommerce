import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { odooClient } from "@/lib/odoo/client";

const REPORT_NAME = "sale.report_saleorder";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const orderId = Number(id);

  if (!orderId || isNaN(orderId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const pdf = await odooClient.fetchReportPdf(REPORT_NAME, orderId);

    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="pedido-${orderId}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Sale order PDF download error:", error);
    return NextResponse.json(
      { error: "No se pudo descargar el documento" },
      { status: 500 },
    );
  }
}
