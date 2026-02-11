interface MockContainer {
  id: number;
  name: string;
  partner_id?: [number, string];
  product_id: [number, string];
  status: string;
  last_fill_date?: string;
  next_service_date?: string;
  capacity: number;
  location?: string;
  notes?: string;
}

export interface MockContainerHistoryEntry {
  date: string;
  title: string;
  description?: string;
}

export interface MockContainerData {
  container: MockContainer;
  history: MockContainerHistoryEntry[];
}

const MOCK_CONTAINERS: MockContainerData[] = [
  {
    container: {
      id: 1,
      name: "ENV-O2-001",
      partner_id: [42, "Metalúrgica Cuyo S.R.L."],
      product_id: [10, "Oxígeno Industrial — Tubo 10m³"],
      status: "in_use",
      last_fill_date: "2025-01-28",
      next_service_date: "2025-07-28",
      capacity: 10,
      location: "Planta Principal — Luján de Cuyo",
      notes: "Tubo asignado sector soldadura",
    },
    history: [
      {
        date: "2025-01-28T14:00:00",
        title: "Carga completa",
        description: "Recarga realizada en planta GASA",
      },
      {
        date: "2025-01-27T08:00:00",
        title: "En tránsito",
        description: "Retiro para recarga",
      },
      {
        date: "2025-01-20T10:00:00",
        title: "Solicitud de recarga",
        description: "Solicitado por Carlos Méndez",
      },
      {
        date: "2024-08-15T09:00:00",
        title: "Asignación inicial",
        description: "Asignado a Metalúrgica Cuyo S.R.L.",
      },
    ],
  },
  {
    container: {
      id: 2,
      name: "ENV-CO2-003",
      partner_id: [42, "Metalúrgica Cuyo S.R.L."],
      product_id: [11, "CO₂ Alimenticio — Tubo 30kg"],
      status: "empty",
      last_fill_date: "2024-12-10",
      next_service_date: "2025-06-10",
      capacity: 30,
      location: "Depósito — Godoy Cruz",
    },
    history: [
      {
        date: "2025-01-15T11:00:00",
        title: "Envase vacío",
        description: "Reportado como vacío",
      },
      {
        date: "2024-12-10T10:00:00",
        title: "Carga completa",
      },
      {
        date: "2024-09-20T09:00:00",
        title: "Asignación inicial",
      },
    ],
  },
  {
    container: {
      id: 3,
      name: "ENV-AR-007",
      partner_id: [42, "Metalúrgica Cuyo S.R.L."],
      product_id: [12, "Argón 5.0 — Tubo 10m³"],
      status: "in_use",
      last_fill_date: "2025-02-05",
      next_service_date: "2025-08-05",
      capacity: 10,
      location: "Planta Principal — Luján de Cuyo",
      notes: "Uso exclusivo soldadura TIG",
    },
    history: [
      {
        date: "2025-02-05T16:00:00",
        title: "Carga completa",
        description: "Entregado junto con pedido SO-2025-003",
      },
      {
        date: "2025-02-04T07:30:00",
        title: "En tránsito",
      },
      {
        date: "2025-01-10T14:00:00",
        title: "Asignación inicial",
      },
    ],
  },
  {
    container: {
      id: 4,
      name: "ENV-N2-012",
      partner_id: [42, "Metalúrgica Cuyo S.R.L."],
      product_id: [13, "Nitrógeno Industrial — Tubo 10m³"],
      status: "in_transit",
      last_fill_date: "2024-11-20",
      next_service_date: "2025-05-20",
      capacity: 10,
      location: "En tránsito — GASA → Planta Principal",
    },
    history: [
      {
        date: "2025-02-06T08:00:00",
        title: "En tránsito",
        description: "Salida de planta GASA con recarga completa",
      },
      {
        date: "2025-02-04T09:00:00",
        title: "Recarga en proceso",
      },
      {
        date: "2025-02-01T11:00:00",
        title: "Solicitud de recarga",
      },
    ],
  },
  {
    container: {
      id: 5,
      name: "ENV-AC-005",
      partner_id: [42, "Metalúrgica Cuyo S.R.L."],
      product_id: [14, "Acetileno — Tubo 7kg"],
      status: "maintenance",
      last_fill_date: "2024-10-05",
      next_service_date: "2025-04-05",
      capacity: 7,
      location: "Planta GASA — En servicio técnico",
      notes: "Prueba hidráulica programada",
    },
    history: [
      {
        date: "2025-01-20T10:00:00",
        title: "En mantenimiento",
        description: "Prueba hidráulica periódica obligatoria",
      },
      {
        date: "2025-01-18T08:00:00",
        title: "Retiro para mantenimiento",
        description: "Retirado de Planta Principal",
      },
      {
        date: "2024-10-05T14:00:00",
        title: "Carga completa",
      },
    ],
  },
];

export function getMockContainers(partnerId: number): MockContainerData[] {
  return MOCK_CONTAINERS.filter(
    (c) => c.container.partner_id?.[0] === partnerId,
  );
}

export function getMockContainer(
  containerId: number,
): MockContainerData | undefined {
  return MOCK_CONTAINERS.find((c) => c.container.id === containerId);
}
