import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { odooClient } from "@/lib/odoo/client";
import { getOrderById } from "@/lib/odoo/orders";
import { verifyResourceOwnership } from "@/lib/auth/ownership";

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
    // Verify the order belongs to the user's company
    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json(
        { error: "Documento no encontrado" },
        { status: 404 },
      );
    }

    const isOwner = await verifyResourceOwnership(order.partner_id[0]);
    if (!isOwner) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

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
