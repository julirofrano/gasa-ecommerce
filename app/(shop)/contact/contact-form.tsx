"use client";

import { useState } from "react";

const subjects = [
  "Cotización de productos",
  "Consulta técnica",
  "Servicio de instalaciones",
  "Oxígeno en casa",
  "Hielo en pellets",
  "Envases y recargas",
  "Cuenta corriente",
  "Otro",
];

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    // TODO: Wire to server action
    setTimeout(() => setStatus("sent"), 1000);
  }

  if (status === "sent") {
    return (
      <div className="border-2 border-foreground bg-muted p-8 md:border-4 md:p-12">
        <p className="text-xs font-bold uppercase tracking-widest text-accent">
          Confirmación
        </p>
        <p className="mt-4 text-2xl font-black uppercase tracking-tighter md:text-3xl">
          Mensaje Enviado
        </p>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          Gracias por contactarnos. Nuestro equipo te responderá dentro de las
          próximas 24 horas hábiles.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-8 border-2 border-foreground bg-foreground px-8 py-3 text-sm font-bold uppercase tracking-wide text-background transition-colors duration-200 hover:border-accent hover:bg-accent"
        >
          Enviar Otro Mensaje
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Row 1: Name + Company */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-xs font-bold uppercase tracking-widest"
          >
            Nombre <span className="text-accent">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full border-b-2 border-foreground bg-transparent py-2 text-sm focus:border-accent focus:outline-none"
            placeholder="Tu nombre completo"
          />
        </div>
        <div>
          <label
            htmlFor="company"
            className="mb-2 block text-xs font-bold uppercase tracking-widest"
          >
            Empresa
          </label>
          <input
            type="text"
            id="company"
            name="company"
            className="w-full border-b-2 border-foreground bg-transparent py-2 text-sm focus:border-accent focus:outline-none"
            placeholder="Nombre de tu empresa"
          />
        </div>
      </div>

      {/* Row 2: Email + Phone */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-xs font-bold uppercase tracking-widest"
          >
            Email <span className="text-accent">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="w-full border-b-2 border-foreground bg-transparent py-2 text-sm focus:border-accent focus:outline-none"
            placeholder="tu@email.com"
          />
        </div>
        <div>
          <label
            htmlFor="phone"
            className="mb-2 block text-xs font-bold uppercase tracking-widest"
          >
            Teléfono
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            className="w-full border-b-2 border-foreground bg-transparent py-2 text-sm focus:border-accent focus:outline-none"
            placeholder="+54 9 261 ..."
          />
        </div>
      </div>

      {/* Subject */}
      <div>
        <label
          htmlFor="subject"
          className="mb-2 block text-xs font-bold uppercase tracking-widest"
        >
          Asunto <span className="text-accent">*</span>
        </label>
        <select
          id="subject"
          name="subject"
          required
          className="w-full appearance-none border-b-2 border-foreground bg-transparent py-2 text-sm focus:border-accent focus:outline-none"
          defaultValue=""
        >
          <option value="" disabled>
            Seleccioná un asunto
          </option>
          {subjects.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Message */}
      <div>
        <label
          htmlFor="message"
          className="mb-2 block text-xs font-bold uppercase tracking-widest"
        >
          Mensaje <span className="text-accent">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="w-full resize-none border-b-2 border-foreground bg-transparent py-2 text-sm focus:border-accent focus:outline-none"
          placeholder="Describí tu consulta..."
        />
      </div>

      {/* Submit */}
      <div className="flex items-center gap-6">
        <button
          type="submit"
          disabled={status === "sending"}
          className="border-2 border-foreground bg-foreground px-10 py-4 text-sm font-bold uppercase tracking-wide text-background transition-colors duration-200 hover:border-accent hover:bg-accent disabled:opacity-50"
        >
          {status === "sending" ? "Enviando..." : "Enviar Mensaje"}
        </button>
        <p className="text-xs text-muted-foreground">
          <span className="text-accent">*</span> Campos obligatorios
        </p>
      </div>
    </form>
  );
}
