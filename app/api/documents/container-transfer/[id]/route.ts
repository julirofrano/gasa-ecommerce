import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { odooClient } from "@/lib/odoo/client";

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
