"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GASA Global Error]", error);
  }, [error]);

  return (
    <html lang="es-AR">
      <head>
        <title>Error del Sistema — GASA</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');

              *, *::before, *::after {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                border-radius: 0 !important;
                box-shadow: none !important;
              }

              body {
                font-family: 'Inter', Arial, Helvetica, sans-serif;
                background: #ffffff;
                color: #000000;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
              }

              .ge-pattern {
                position: fixed;
                inset: 0;
                pointer-events: none;
                background-image:
                  linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px);
                background-size: 20px 20px;
              }

              .ge-container {
                position: relative;
                min-height: 100vh;
                display: flex;
                flex-direction: column;
                justify-content: center;
                max-width: 1200px;
                margin: 0 auto;
                padding: 5rem 1rem;
              }

              .ge-label {
                font-size: 10px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.15em;
                color: #666666;
              }

              .ge-sublabel {
                margin-top: 4px;
                font-size: 12px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.1em;
                color: #0094BB;
              }

              .ge-title {
                margin-top: 1.5rem;
                font-size: clamp(6rem, 20vw, 16rem);
                font-weight: 900;
                line-height: 0.85;
                letter-spacing: -0.04em;
                text-transform: uppercase;
                position: relative;
              }

              .ge-stripe {
                position: absolute;
                left: 0;
                right: 0;
                bottom: 38%;
                height: 8px;
                background: #0094BB;
              }

              @media (min-width: 768px) {
                .ge-stripe { height: 12px; }
              }

              .ge-divider {
                margin-top: 2rem;
                border: none;
                border-top: 2px solid #000000;
              }

              @media (min-width: 768px) {
                .ge-divider { margin-top: 3rem; border-top-width: 4px; }
              }

              .ge-content {
                margin-top: 2rem;
                display: flex;
                flex-direction: column;
                gap: 2rem;
              }

              @media (min-width: 768px) {
                .ge-content {
                  margin-top: 3rem;
                  flex-direction: row;
                  align-items: flex-end;
                  justify-content: space-between;
                }
              }

              .ge-copy h2 {
                font-size: clamp(1.5rem, 3vw, 1.875rem);
                font-weight: 900;
                text-transform: uppercase;
                letter-spacing: -0.04em;
                line-height: 1.1;
              }

              .ge-copy p {
                margin-top: 1rem;
                font-size: 14px;
                line-height: 1.7;
                color: #666666;
                max-width: 32rem;
              }

              .ge-ref {
                margin-top: 1rem;
                padding-left: 0.75rem;
                border-left: 2px solid #0094BB;
                font-family: monospace;
                font-size: 12px;
                color: #666666;
              }

              .ge-actions {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
              }

              @media (min-width: 640px) {
                .ge-actions { flex-direction: row; }
              }

              .ge-btn {
                display: inline-block;
                padding: 1rem 2rem;
                font-size: 14px;
                font-weight: 700;
                font-family: 'Inter', Arial, sans-serif;
                text-transform: uppercase;
                letter-spacing: 0.05em;
                text-decoration: none;
                text-align: center;
                border: 2px solid #000000;
                cursor: pointer;
                transition: all 0.2s;
              }

              .ge-btn-primary {
                background: #000000;
                color: #ffffff;
              }

              .ge-btn-primary:hover {
                background: #0094BB;
                border-color: #0094BB;
              }

              .ge-btn-secondary {
                background: #ffffff;
                color: #000000;
              }

              .ge-btn-secondary:hover {
                background: #000000;
                color: #ffffff;
              }

              .ge-footer {
                margin-top: 4rem;
                padding-top: 1.5rem;
                border-top: 1px solid rgba(0,0,0,0.1);
                display: flex;
                flex-wrap: wrap;
                justify-content: space-between;
                align-items: center;
                gap: 0.5rem;
              }

              .ge-footer span {
                font-size: 10px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.15em;
                color: #999999;
              }

              .ge-footer a {
                font-size: 10px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.15em;
                color: #0094BB;
                text-decoration: none;
                transition: color 0.2s;
              }

              .ge-footer a:hover {
                color: #000000;
              }
            `,
          }}
        />
      </head>
      <body>
        <div className="ge-pattern" />
        <div className="ge-container">
          <p className="ge-label">Error Crítico del Sistema</p>
          <p className="ge-sublabel">La Aplicación No Pudo Cargar</p>

          <div className="ge-title">
            Error
            <div className="ge-stripe" />
          </div>

          <hr className="ge-divider" />

          <div className="ge-content">
            <div className="ge-copy">
              <h2>
                Ocurrió un error
                <br />
                crítico.
              </h2>
              <p>
                La aplicación no pudo inicializarse correctamente. Esto puede
                deberse a un problema temporal del servidor. Intentá recargar la
                página.
              </p>
              {error.digest && <p className="ge-ref">Ref: {error.digest}</p>}
            </div>

            <div className="ge-actions">
              <button onClick={reset} className="ge-btn ge-btn-primary">
                Reintentar
              </button>
              <a href="/" className="ge-btn ge-btn-secondary">
                Ir al Inicio
              </a>
            </div>
          </div>

          <div className="ge-footer">
            <span>&copy; {new Date().getFullYear()} Gases Aconcagua S.A.</span>
            <a href="mailto:consultas@gasesaconcagua.com.ar">
              consultas@gasesaconcagua.com.ar
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
