export interface Certificate {
  name: string;
  issueDate: string;
  expiryDate: string;
  fileType: string;
  fileSize: string;
  downloadUrl: string;
}

export const certificates: Certificate[] = [
  {
    name: "ISO 9001:2015 — Sistema de Gestión de Calidad",
    issueDate: "2024-03-15",
    expiryDate: "2027-03-15",
    fileType: "PDF",
    fileSize: "1.2 MB",
    downloadUrl: "#",
  },
  {
    name: "ISO 14001:2015 — Sistema de Gestión Ambiental",
    issueDate: "2024-03-15",
    expiryDate: "2027-03-15",
    fileType: "PDF",
    fileSize: "980 KB",
    downloadUrl: "#",
  },
  {
    name: "Habilitación ANMAT — Gases Medicinales",
    issueDate: "2024-06-01",
    expiryDate: "2026-06-01",
    fileType: "PDF",
    fileSize: "750 KB",
    downloadUrl: "#",
  },
  {
    name: "Habilitación ENARGAS — Instalaciones de Gas",
    issueDate: "2023-11-20",
    expiryDate: "2025-11-20",
    fileType: "PDF",
    fileSize: "620 KB",
    downloadUrl: "#",
  },
  {
    name: "Certificación IRAM — Acetileno Disuelto",
    issueDate: "2024-01-10",
    expiryDate: "2026-01-10",
    fileType: "PDF",
    fileSize: "540 KB",
    downloadUrl: "#",
  },
  {
    name: "Registro Nacional de Precursores Químicos",
    issueDate: "2024-08-01",
    expiryDate: "2025-08-01",
    fileType: "PDF",
    fileSize: "430 KB",
    downloadUrl: "#",
  },
];
