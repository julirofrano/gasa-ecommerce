"use client";

import { useState } from "react";

const categories = [
  "Conducta antiética",
  "Fraude o corrupción",
  "Conflicto de intereses",
  "Acoso o discriminación",
  "Incumplimiento de normas de seguridad",
  "Daño ambiental",
  "Uso indebido de recursos",
  "Otro",
];

const severityLevels = [
  { value: "low", label: "Bajo" },
  { value: "medium", label: "Medio" },
  { value: "high", label: "Alto" },
  { value: "critical", label: "Crítico" },
];

export function AnonymousReportForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    // TODO: Wire to server action / email endpoint
    setTimeout(() => setStatus("sent"), 1200);
  }

  if (status === "sent") {
    return (
      <div className="border-2 border-foreground bg-muted p-8 md:border-4 md:p-12">
        <p className="text-xs font-bold uppercase tracking-widest text-[#0094BB]">
          Confirmación
        </p>
        <p className="mt-4 text-2xl font-black uppercase tracking-tighter md:text-3xl">
          Reporte Recibido
        </p>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          Su reporte fue enviado de forma anónima y confidencial. Será revisado
          por el comité de ética. Gracias por contribuir a una cultura de
          integridad.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-8 border-2 border-foreground bg-foreground px-8 py-3 text-sm font-bold uppercase tracking-wide text-background transition-colors duration-200 hover:border-[#0094BB] hover:bg-[#0094BB]"
        >
          Enviar Otro Reporte
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Privacy notice */}
      <div className="border-l-4 border-[#0094BB] bg-muted p-5">
        <p className="text-xs font-bold uppercase tracking-widest text-[#0094BB]">
          Aviso de Privacidad
        </p>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Este formulario es completamente anónimo. No recopilamos datos de
          identificación personal, dirección IP ni información del navegador.
          Todos los campos de contacto son opcionales.
        </p>
      </div>

      {/* Category */}
      <div>
        <label
          htmlFor="report-category"
          className="mb-2 block text-xs font-bold uppercase tracking-widest"
        >
          Tipo de Reporte <span className="text-[#0094BB]">*</span>
        </label>
        <select
          id="report-category"
          name="category"
          required
          className="w-full appearance-none border-b-2 border-foreground bg-transparent py-2 text-sm focus:border-[#0094BB] focus:outline-none"
          defaultValue=""
        >
          <option value="" disabled>
            Seleccione una categoría
          </option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Severity + Date */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div>
          <label
            htmlFor="report-severity"
            className="mb-2 block text-xs font-bold uppercase tracking-widest"
          >
            Gravedad <span className="text-[#0094BB]">*</span>
          </label>
          <select
            id="report-severity"
            name="severity"
            required
            className="w-full appearance-none border-b-2 border-foreground bg-transparent py-2 text-sm focus:border-[#0094BB] focus:outline-none"
            defaultValue=""
          >
            <option value="" disabled>
              Seleccione nivel
            </option>
            {severityLevels.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="report-date"
            className="mb-2 block text-xs font-bold uppercase tracking-widest"
          >
            Fecha Aproximada
          </label>
          <input
            type="date"
            id="report-date"
            name="incidentDate"
            className="w-full border-b-2 border-foreground bg-transparent py-2 text-sm focus:border-[#0094BB] focus:outline-none"
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <label
          htmlFor="report-location"
          className="mb-2 block text-xs font-bold uppercase tracking-widest"
        >
          Lugar del Incidente
        </label>
        <input
          type="text"
          id="report-location"
          name="location"
          className="w-full border-b-2 border-foreground bg-transparent py-2 text-sm focus:border-[#0094BB] focus:outline-none"
          placeholder="Sucursal, área, departamento..."
        />
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="report-description"
          className="mb-2 block text-xs font-bold uppercase tracking-widest"
        >
          Descripción del Incidente <span className="text-[#0094BB]">*</span>
        </label>
        <textarea
          id="report-description"
          name="description"
          required
          rows={6}
          className="w-full resize-none border-b-2 border-foreground bg-transparent py-2 text-sm leading-relaxed focus:border-[#0094BB] focus:outline-none"
          placeholder="Describa los hechos con el mayor detalle posible: qué ocurrió, quiénes estuvieron involucrados, cuándo y dónde sucedió..."
        />
      </div>

      {/* Optional contact */}
      <div className="border-t-2 border-foreground pt-8">
        <p className="mb-1 text-xs font-bold uppercase tracking-widest">
          Contacto{" "}
          <span className="font-normal text-muted-foreground">(Opcional)</span>
        </p>
        <p className="mb-6 text-xs leading-relaxed text-muted-foreground">
          Si desea recibir seguimiento sobre su reporte, puede dejar un medio de
          contacto. Este dato es completamente opcional y será tratado de manera
          confidencial.
        </p>
        <input
          type="text"
          id="report-contact"
          name="contact"
          className="w-full border-b-2 border-foreground bg-transparent py-2 text-sm focus:border-[#0094BB] focus:outline-none"
          placeholder="Email, teléfono, o cualquier medio de contacto..."
        />
      </div>

      {/* Submit */}
      <div className="flex items-center gap-6">
        <button
          type="submit"
          disabled={status === "sending"}
          className="border-2 border-foreground bg-foreground px-10 py-4 text-sm font-bold uppercase tracking-wide text-background transition-colors duration-200 hover:border-[#0094BB] hover:bg-[#0094BB] disabled:opacity-50"
        >
          {status === "sending" ? "Enviando..." : "Enviar Reporte Anónimo"}
        </button>
        <p className="text-xs text-muted-foreground">
          <span className="text-[#0094BB]">*</span> Campos obligatorios
        </p>
      </div>
    </form>
  );
}
