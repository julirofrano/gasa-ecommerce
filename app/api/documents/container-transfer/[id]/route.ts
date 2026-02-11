import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { odooClient } from "@/lib/odoo/client";
import { verifyResourceOwnership } from "@/lib/auth/ownership";

const REPORT_NAME = "gas_container_management.report_container_transfer";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const transferId = Number(id);

  if (!transferId || isNaN(transferId)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    // Verify the transfer belongs to the user's company
    const transfers = await odooClient.read<{
      partner_id: [number, string];
    }>("container.transfer", [transferId], ["partner_id"]);
    const transfer = transfers[0];

    if (!transfer) {
      return NextResponse.json(
        { error: "Documento no encontrado" },
        { status: 404 },
      );
    }

    const isOwner = await verifyResourceOwnership(transfer.partner_id[0]);
    if (!isOwner) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const pdf = await odooClient.fetchReportPdf(REPORT_NAME, transferId);

    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="transferencia-${transferId}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Container transfer PDF download error:", error);
    return NextResponse.json(
      { error: "No se pudo descargar el documento" },
      { status: 500 },
    );
  }
}
