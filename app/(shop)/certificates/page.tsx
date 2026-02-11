import type { Metadata } from "next";
import { certificates } from "@/lib/data/certificates";

export const metadata: Metadata = {
  title: "Certificados",
  description:
    "Certificaciones de calidad, habilitaciones y registros de Gases Aconcagua S.A.",
  alternates: { canonical: "/certificates" },
};

function getCertificateStatus(expiryDate: string) {
  const expiry = new Date(expiryDate);
  const now = new Date();
  const threeMonths = new Date();
  threeMonths.setMonth(threeMonths.getMonth() + 3);

  if (expiry < now) return { label: "Vencido", className: "bg-red-600" };
  if (expiry < threeMonths)
    return { label: "Por Vencer", className: "bg-yellow-600" };
  return { label: "Vigente", className: "bg-foreground" };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function CertificatesPage() {
  return (
    <div>
      {/* Hero */}
      <section className="border-b-4 border-foreground py-16 md:py-24">
        <div className="container mx-auto px-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#0094BB]">
            Calidad & Cumplimiento
          </p>
          <h1 className="text-4xl font-black uppercase tracking-tighter md:text-5xl">
            Certificados
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Nuestro compromiso con la calidad se respalda con certificaciones de
            organismos nacionales e internacionales. Todos nuestros procesos
            están auditados y certificados.
          </p>
        </div>
      </section>

      {/* Certificates Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {certificates.map((cert) => {
              const status = getCertificateStatus(cert.expiryDate);
              return (
                <div
                  key={cert.name}
                  className="border-2 border-foreground bg-background p-6 md:border-4"
                >
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <h3 className="text-sm font-bold uppercase tracking-wide">
                      {cert.name}
                    </h3>
                    <span
                      className={`${status.className} shrink-0 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-background`}
                    >
                      {status.label}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>
                      <span className="font-bold uppercase tracking-wide">
                        Emisión:
                      </span>{" "}
                      {formatDate(cert.issueDate)}
                    </p>
                    <p>
                      <span className="font-bold uppercase tracking-wide">
                        Vencimiento:
                      </span>{" "}
                      {formatDate(cert.expiryDate)}
                    </p>
                    <p>
                      <span className="font-bold uppercase tracking-wide">
                        Formato:
                      </span>{" "}
                      {cert.fileType} — {cert.fileSize}
                    </p>
                  </div>
                  <a
                    href={cert.downloadUrl}
                    className="mt-4 inline-block text-xs font-bold uppercase tracking-widest text-[#0094BB] transition-colors duration-200 hover:text-foreground"
                  >
                    Descargar &darr;
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
