export interface IndustryFeature {
  title: string;
  description: string;
}

export interface Industry {
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  features: IndustryFeature[];
}

export const industries: Industry[] = [
  {
    slug: "vitivinicultura",
    name: "Vitivinicultura",
    shortDescription:
      "Gases especializados para bodegas y procesos vitivinícolas.",
    description:
      "Proveemos soluciones integrales de gases para la industria vitivinícola de Mendoza y todo Cuyo. Nuestros productos y servicios están diseñados para optimizar cada etapa del proceso enológico, desde la fermentación hasta el embotellado.",
    features: [
      {
        title: "CO₂ para Inertización",
        description:
          "Gas carbónico de alta pureza para protección de mostos y vinos durante trasiegos y embotellado.",
      },
      {
        title: "Nitrógeno Enológico",
        description:
          "Nitrógeno grado alimentario para blanketing de tanques, prevención de oxidación y embotellado.",
      },
      {
        title: "Mezclas para Soldadura",
        description:
          "Gases de protección para mantenimiento y fabricación de equipamiento de bodega en acero inoxidable.",
      },
      {
        title: "Hielo en Pellets",
        description:
          "Hielo seco para control de temperatura durante vendimia y fermentación en frío.",
      },
    ],
  },
  {
    slug: "petroleo-y-gas",
    name: "Petróleo y Gas",
    shortDescription:
      "Soluciones de gases para exploración, producción y refinación.",
    description:
      "Suministramos gases industriales de alta calidad para la industria petrolera y gasífera. Nuestras soluciones abarcan desde la exploración hasta el procesamiento, con productos que cumplen las más exigentes normas de seguridad.",
    features: [
      {
        title: "Gases de Corte y Soldadura",
        description:
          "Oxígeno, acetileno y mezclas especiales para trabajos de mantenimiento en instalaciones petroleras.",
      },
      {
        title: "Nitrógeno Industrial",
        description:
          "Para purga de tuberías, inertización de tanques y pruebas de presión en instalaciones.",
      },
      {
        title: "Gases de Calibración",
        description:
          "Mezclas certificadas para calibración de detectores y equipos de medición en plantas.",
      },
      {
        title: "Logística Especializada",
        description:
          "Servicio de entrega en yacimientos y locaciones remotas con unidades especializadas.",
      },
    ],
  },
  {
    slug: "mineria",
    name: "Minería",
    shortDescription:
      "Gases industriales para operaciones mineras de gran escala.",
    description:
      "Acompañamos la actividad minera con suministro confiable de gases industriales para procesos extractivos, metalúrgicos y de mantenimiento. Nuestra logística alcanza operaciones en alta montaña y zonas remotas.",
    features: [
      {
        title: "Oxígeno para Procesos",
        description:
          "Oxígeno de alta pureza para procesos de lixiviación y flotación de minerales.",
      },
      {
        title: "Gases de Soldadura",
        description:
          "Suministro de argón, CO₂ y mezclas para mantenimiento de equipos y estructuras mineras.",
      },
      {
        title: "Nitrógeno para Voladuras",
        description:
          "Nitrógeno líquido y gaseoso para aplicaciones en explosivos y seguridad minera.",
      },
      {
        title: "Entrega en Altura",
        description:
          "Logística especializada para operaciones en alta montaña con vehículos adecuados.",
      },
    ],
  },
  {
    slug: "metalurgia",
    name: "Metalurgia",
    shortDescription:
      "Gases para fundición, soldadura y tratamientos térmicos.",
    description:
      "Ofrecemos una gama completa de gases industriales para la industria metalúrgica, incluyendo gases de protección para soldadura, oxicorte, tratamientos térmicos y procesos de fundición.",
    features: [
      {
        title: "Argón de Alta Pureza",
        description:
          "Argón 99.999% para soldadura TIG/MIG de aceros inoxidables, aluminio y aleaciones especiales.",
      },
      {
        title: "Mezclas de Soldadura",
        description:
          "Ar/CO₂, Ar/O₂ y mezclas ternarias personalizadas para cada aplicación de soldadura.",
      },
      {
        title: "Oxicorte",
        description:
          "Oxígeno y acetileno de alta calidad para procesos de corte y calentamiento de metales.",
      },
      {
        title: "Tratamientos Térmicos",
        description:
          "Nitrógeno, hidrógeno y atmósferas controladas para recocido, cementación y temple.",
      },
    ],
  },
  {
    slug: "salud",
    name: "Salud",
    shortDescription:
      "Gases medicinales y equipamiento para instituciones de salud.",
    description:
      "Suministramos gases medicinales certificados para hospitales, clínicas, consultorios y atención domiciliaria. Nuestros productos cumplen con las normativas de ANMAT y las farmacopeas vigentes.",
    features: [
      {
        title: "Oxígeno Medicinal",
        description:
          "Oxígeno USP grado medicinal para terapia respiratoria, anestesia y cuidados intensivos.",
      },
      {
        title: "Óxido Nitroso",
        description:
          "N₂O para anestesia y analgesia en cirugías, odontología y obstetricia.",
      },
      {
        title: "Aire Medicinal",
        description:
          "Aire comprimido grado medicinal para ventilación mecánica y nebulización.",
      },
      {
        title: "Oxígeno Domiciliario",
        description:
          "Servicio integral de oxigenoterapia en casa con concentradores y equipos portátiles.",
      },
    ],
  },
  {
    slug: "alimentacion",
    name: "Alimentación",
    shortDescription:
      "Gases alimentarios para conservación, envasado y procesamiento.",
    description:
      "Proveemos gases de grado alimentario para la industria de alimentos y bebidas, incluyendo soluciones para envasado en atmósfera modificada, congelación rápida, carbonatación y conservación.",
    features: [
      {
        title: "Envasado en Atmósfera Modificada",
        description:
          "Mezclas de N₂ y CO₂ para MAP que extienden la vida útil de alimentos frescos.",
      },
      {
        title: "Congelación Criogénica",
        description:
          "Nitrógeno líquido y CO₂ para congelación IQF ultra-rápida de alimentos.",
      },
      {
        title: "Carbonatación",
        description:
          "CO₂ de alta pureza grado alimentario para bebidas carbonatadas y aguas saborizadas.",
      },
      {
        title: "Fumigación y Conservación",
        description:
          "Tratamientos con CO₂ y N₂ para control de plagas en granos y productos almacenados.",
      },
    ],
  },
  {
    slug: "investigacion",
    name: "Investigación",
    shortDescription:
      "Gases de alta pureza para laboratorios y centros de investigación.",
    description:
      "Suministramos gases de ultra alta pureza y mezclas certificadas para laboratorios, universidades y centros de investigación. Nuestros productos cumplen con los estándares más exigentes para análisis instrumental.",
    features: [
      {
        title: "Gases Carrier",
        description:
          "Helio, hidrógeno y nitrógeno de ultra alta pureza para cromatografía de gases.",
      },
      {
        title: "Mezclas de Calibración",
        description:
          "Mezclas certificadas con trazabilidad para calibración de equipos analíticos.",
      },
      {
        title: "Gases Especiales",
        description:
          "Gases raros y mezclas personalizadas para aplicaciones específicas de investigación.",
      },
      {
        title: "Criogenia",
        description:
          "Nitrógeno y helio líquido para aplicaciones criogénicas y conservación de muestras.",
      },
    ],
  },
  {
    slug: "manufactura",
    name: "Manufactura",
    shortDescription:
      "Gases industriales para procesos de fabricación y producción.",
    description:
      "Acompañamos a la industria manufacturera con gases industriales para corte, soldadura, tratamientos superficiales y procesos de producción. Nuestras soluciones mejoran la productividad y calidad.",
    features: [
      {
        title: "Corte por Plasma y Láser",
        description:
          "Gases asistentes y de protección para procesos de corte automatizado y CNC.",
      },
      {
        title: "Soldadura Automatizada",
        description:
          "Mezclas optimizadas para soldadura robótica y procesos de alta productividad.",
      },
      {
        title: "Tratamiento Superficial",
        description:
          "Gases para granallado criogénico, limpieza y preparación de superficies.",
      },
      {
        title: "Neumática Industrial",
        description:
          "Aire comprimido y nitrógeno de alta pureza para sistemas neumáticos y actuadores.",
      },
    ],
  },
  {
    slug: "construccion",
    name: "Construcción",
    shortDescription:
      "Gases para soldadura estructural y trabajos de construcción.",
    description:
      "Proveemos gases industriales para la industria de la construcción, desde soldadura estructural hasta corte de materiales. Nuestro servicio incluye entrega en obra y asesoramiento técnico.",
    features: [
      {
        title: "Soldadura Estructural",
        description:
          "Gases de protección para soldadura de estructuras metálicas, columnas y vigas.",
      },
      {
        title: "Oxicorte en Obra",
        description:
          "Equipos portátiles y gases para corte de perfiles, chapas y demolición controlada.",
      },
      {
        title: "Instalaciones de Gas",
        description:
          "Gases de prueba y purga para instalaciones de gas natural y redes de distribución.",
      },
      {
        title: "Servicio en Obra",
        description:
          "Entrega programada en sitios de construcción con servicio de recambio de cilindros.",
      },
    ],
  },
];
