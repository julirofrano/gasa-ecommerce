"use client";

import { useState } from "react";
import { updatePassword } from "@/app/(account)/profile/actions";

interface PasswordSectionProps {
  hasPassword: boolean;
}

export function PasswordSection({ hasPassword }: PasswordSectionProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (newPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setIsPending(true);

    const result = await updatePassword(
      hasPassword ? currentPassword : null,
      newPassword,
    );

    setIsPending(false);

    if (result.success) {
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setError(result.error ?? "Error al actualizar la contraseña.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!hasPassword && (
        <p className="text-sm text-muted-foreground">
          Establezca una contraseña para poder acceder al portal con email y
          contraseña además del enlace de acceso.
        </p>
      )}

      {hasPassword && (
        <div>
          <label
            htmlFor="current-password"
            className="mb-2 block text-xs font-bold uppercase tracking-widest"
          >
            Contraseña Actual
          </label>
          <input
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full border-b-2 border-foreground bg-transparent px-0 py-3 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none"
            required
            autoComplete="current-password"
          />
        </div>
      )}

      <div>
        <label
          htmlFor="new-password"
          className="mb-2 block text-xs font-bold uppercase tracking-widest"
        >
          Nueva Contraseña
        </label>
        <input
          id="new-password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Mínimo 8 caracteres"
          className="w-full border-b-2 border-foreground bg-transparent px-0 py-3 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>

      <div>
        <label
          htmlFor="confirm-password"
          className="mb-2 block text-xs font-bold uppercase tracking-widest"
        >
          Confirmar Contraseña
        </label>
        <input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Repita la contraseña"
          className="w-full border-b-2 border-foreground bg-transparent px-0 py-3 text-sm placeholder:text-muted-foreground focus:border-accent focus:outline-none"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>

      {error && (
        <div className="border-2 border-red-600 bg-red-600/10 px-4 py-3 text-sm font-bold text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="border-2 border-accent bg-accent/10 px-4 py-3 text-sm font-bold text-accent">
          Contraseña actualizada correctamente.
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="border-2 border-foreground bg-foreground px-6 py-3 text-sm font-bold uppercase tracking-wide text-background transition-colors duration-200 hover:border-accent hover:bg-accent disabled:opacity-50"
      >
        {isPending
          ? "Guardando..."
          : hasPassword
            ? "Cambiar Contraseña"
            : "Establecer Contraseña"}
      </button>
    </form>
  );
}
