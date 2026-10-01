// Placeholder content used when Supabase is not configured (local development and tests).
// Mirrors supabase/migrations/0003_seed.sql. Replace with the company's real content in Supabase.
import type { Category, Faq, Product, Settings, Testimonial } from "@/lib/types";

export const settings: Settings = {
  companyName: "Distribuidora Andina",
  tagline: "Alimentos frescos y abarrotes para su negocio, a tiempo y en todo Santa Cruz.",
  story:
    "Nacimos como un pequeño distribuidor familiar en Santa Cruz de la Sierra y hoy abastecemos a restaurantes, tiendas, hoteles e instituciones en varios departamentos de Bolivia. Trabajamos directamente con productores nacionales para ofrecer productos frescos a precios justos.",
  mission:
    "Abastecer a los negocios de alimentos de Bolivia con productos de calidad, entregas puntuales y un trato cercano.",
  values: [
    "Frescura garantizada",
    "Puntualidad en cada entrega",
    "Precios justos",
    "Trato cercano",
  ],
  certifications: [
    "Registro sanitario SENASAG",
    "Cadena de frío controlada",
    "Buenas prácticas de manufactura",
  ],
  clientTypes: ["Restaurantes", "Tiendas y minimercados", "Hoteles", "Catering", "Instituciones"],
  phone: "+59133000000",
  email: "contacto@example.com",
  whatsappNumber: "+59170000000",
  address: "Av. Ejemplo 123, Parque Industrial",
  city: "Santa Cruz de la Sierra",
  mapUrl:
    "https://www.openstreetmap.org/export/embed.html?bbox=-63.22%2C-17.82%2C-63.14%2C-17.76&layer=mapnik",
  businessHours: "Lunes a viernes de 7:00 a 18:00; sábados de 7:00 a 13:00",
  serviceAreas: ["Santa Cruz de la Sierra", "Montero", "Warnes", "Cochabamba", "La Paz y El Alto"],
  deliverySchedule:
    "Santa Cruz: entregas de lunes a sábado, al día siguiente del pedido. Otras ciudades: dos veces por semana.",
  minimumOrder: "Pedido mínimo de Bs 500 para entregas sin costo en Santa Cruz.",
  orderingSteps: [
    "Escríbanos por WhatsApp o llene el formulario de contacto.",
    "Le enviamos una cotización según su volumen.",
    "Abrimos su cuenta de cliente y coordinamos la primera entrega.",
    "Haga sus pedidos por WhatsApp; los entregamos en su horario.",
  ],
};

export const categories: Category[] = [
  {
    id: "c1",
    slug: "frutas-y-verduras",
    name: "Frutas y verduras",
    description: "Productos frescos seleccionados cada día de productores nacionales.",
    imagePublicId: "/images/categories/frutas-y-verduras.svg",
    imageAlt: "Cajas de frutas y verduras frescas",
  },
  {
    id: "c2",
    slug: "lacteos",
    name: "Lácteos y huevos",
    description: "Leche, quesos, yogur y huevos con cadena de frío.",
    imagePublicId: "/images/categories/lacteos.svg",
    imageAlt: "Quesos, leche y huevos",
  },
  {
    id: "c3",
    slug: "carnes-y-aves",
    name: "Carnes y aves",
    description: "Cortes de res, cerdo y pollo para cocinas profesionales.",
    imagePublicId: "/images/categories/carnes-y-aves.svg",
    imageAlt: "Cortes de carne y pollo",
  },
  {
    id: "c4",
    slug: "abarrotes",
    name: "Abarrotes",
    description: "Arroz, azúcar, aceite, harinas y productos secos al por mayor.",
    imagePublicId: "/images/categories/abarrotes.svg",
    imageAlt: "Sacos de arroz y productos secos",
  },
  {
    id: "c5",
    slug: "bebidas",
    name: "Bebidas",
    description: "Aguas, jugos y refrescos para tiendas y restaurantes.",
    imagePublicId: "/images/categories/bebidas.svg",
    imageAlt: "Botellas de agua y jugos",
  },
  {
    id: "c6",
    slug: "congelados",
    name: "Congelados",
    description: "Vegetales, papas y productos congelados listos para cocinar.",
    imagePublicId: "/images/categories/congelados.svg",
    imageAlt: "Productos congelados",
  },
];

export const products: Product[] = [
  {
    id: "p1",
    categoryId: "c1",
    name: "Tomate",
    description: "Tomate de primera, caja de 20 kg.",
    priceBob: 120,
    unit: "caja 20 kg",
    imagePublicId: null,
    imageAlt: "Tomates rojos",
  },
  {
    id: "p2",
    categoryId: "c1",
    name: "Papa holandesa",
    description: "Papa lavada, ideal para freír.",
    priceBob: 95,
    unit: "arroba",
    imagePublicId: null,
    imageAlt: "Papas",
  },
  {
    id: "p3",
    categoryId: "c1",
    name: "Frutas de temporada",
    description: "Plátano, papaya, piña y cítricos según temporada.",
    priceBob: null,
    unit: null,
    imagePublicId: null,
    imageAlt: "Frutas tropicales",
  },
  {
    id: "p4",
    categoryId: "c2",
    name: "Leche entera",
    description: "Leche pasteurizada en bolsa de 1 litro.",
    priceBob: null,
    unit: null,
    imagePublicId: null,
    imageAlt: "Leche en bolsa",
  },
  {
    id: "p5",
    categoryId: "c2",
    name: "Queso menonita",
    description: "Queso semiduro en bloque.",
    priceBob: 48,
    unit: "kg",
    imagePublicId: null,
    imageAlt: "Bloque de queso",
  },
  {
    id: "p6",
    categoryId: "c2",
    name: "Huevos",
    description: "Huevos frescos, maple de 30 unidades.",
    priceBob: 32,
    unit: "maple 30 u",
    imagePublicId: null,
    imageAlt: "Maple de huevos",
  },
  {
    id: "p7",
    categoryId: "c3",
    name: "Pollo entero",
    description: "Pollo fresco refrigerado.",
    priceBob: null,
    unit: null,
    imagePublicId: null,
    imageAlt: "Pollo entero",
  },
  {
    id: "p8",
    categoryId: "c3",
    name: "Carne de res",
    description: "Cortes para parrilla y guisos.",
    priceBob: null,
    unit: null,
    imagePublicId: null,
    imageAlt: "Cortes de carne de res",
  },
  {
    id: "p9",
    categoryId: "c4",
    name: "Arroz grano de oro",
    description: "Arroz nacional, quintal de 46 kg.",
    priceBob: 310,
    unit: "quintal",
    imagePublicId: null,
    imageAlt: "Saco de arroz",
  },
  {
    id: "p10",
    categoryId: "c4",
    name: "Aceite vegetal",
    description: "Aceite de soya, bidón de 5 litros.",
    priceBob: null,
    unit: null,
    imagePublicId: null,
    imageAlt: "Bidón de aceite",
  },
  {
    id: "p11",
    categoryId: "c4",
    name: "Azúcar",
    description: "Azúcar blanca, quintal de 46 kg.",
    priceBob: null,
    unit: null,
    imagePublicId: null,
    imageAlt: "Saco de azúcar",
  },
  {
    id: "p12",
    categoryId: "c5",
    name: "Agua de mesa",
    description: "Botellas de 2 litros, paquete de 6.",
    priceBob: 30,
    unit: "paquete",
    imagePublicId: null,
    imageAlt: "Botellas de agua",
  },
  {
    id: "p13",
    categoryId: "c5",
    name: "Jugos naturales",
    description: "Jugos de frutas en envase de 1 litro.",
    priceBob: null,
    unit: null,
    imagePublicId: null,
    imageAlt: "Jugos en envase",
  },
  {
    id: "p14",
    categoryId: "c6",
    name: "Papas prefritas",
    description: "Papas bastón congeladas, bolsa de 2,5 kg.",
    priceBob: null,
    unit: null,
    imagePublicId: null,
    imageAlt: "Papas prefritas congeladas",
  },
];

export const faqs: Faq[] = [
  {
    id: "f1",
    topic: "ordering",
    question: "¿Cómo hago mi primer pedido?",
    answer:
      "Escríbanos por WhatsApp o llene el formulario de contacto. Le enviamos una cotización, abrimos su cuenta y coordinamos la entrega.",
  },
  {
    id: "f2",
    topic: "ordering",
    question: "¿Venden a personas particulares?",
    answer:
      "Trabajamos principalmente con negocios, pero atendemos pedidos grandes de particulares para eventos.",
  },
  {
    id: "f3",
    topic: "payment",
    question: "¿Qué formas de pago aceptan?",
    answer:
      "Transferencia bancaria, pago QR y efectivo contra entrega. Clientes frecuentes pueden solicitar crédito.",
  },
  {
    id: "f4",
    topic: "payment",
    question: "¿Emiten factura?",
    answer: "Sí, emitimos factura en todas las ventas.",
  },
  {
    id: "f5",
    topic: "delivery",
    question: "¿A qué zonas entregan?",
    answer:
      "Santa Cruz de la Sierra y alrededores todos los días hábiles, y otras ciudades dos veces por semana.",
  },
  {
    id: "f6",
    topic: "delivery",
    question: "¿Tiene costo la entrega?",
    answer:
      "Es gratuita en Santa Cruz desde el pedido mínimo. Para otras ciudades le indicamos el costo en la cotización.",
  },
  {
    id: "f7",
    topic: "returns",
    question: "¿Qué pasa si un producto llega en mal estado?",
    answer:
      "Avísenos dentro de las 24 horas y lo reponemos en la siguiente entrega o le devolvemos el importe.",
  },
];

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    author: "Restaurante en Equipetrol",
    quote: "Siempre llegan a tiempo y la verdura es fresca. Nos simplificaron las compras.",
  },
  {
    id: "t2",
    author: "Minimercado en Montero",
    quote: "Buenos precios por volumen y atención rápida por WhatsApp.",
  },
  {
    id: "t3",
    author: "Servicio de catering",
    quote: "Nos resuelven pedidos grandes con poca anticipación.",
  },
];
