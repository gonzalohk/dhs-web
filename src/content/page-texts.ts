// Registry of the page texts staff can edit. The public pages and the editor share this list.
// Texts may use company-data tokens such as {companyName} (see src/lib/tokens.ts).

export type PageTextPage = "home" | "about" | "delivery" | "products" | "faq" | "contact";

export type PageTextDef = {
  key: string;
  page: PageTextPage;
  label: string; // shown to staff
  default: string;
  maxLength: number;
};

const def = (
  key: string,
  page: PageTextPage,
  label: string,
  defaultText: string,
  maxLength = 200,
): PageTextDef => ({ key, page, label, default: defaultText, maxLength });

export const PAGE_TEXT_PAGES: { id: PageTextPage; label: string }[] = [
  { id: "home", label: "Inicio" },
  { id: "about", label: "Nosotros" },
  { id: "products", label: "Productos" },
  { id: "delivery", label: "Entregas y pedidos" },
  { id: "faq", label: "Preguntas frecuentes" },
  { id: "contact", label: "Contacto" },
];

export const PAGE_TEXTS: PageTextDef[] = [
  def("home.eyebrow", "home", "Inicio: texto sobre el título", "Distribuidora de alimentos", 80),
  def("home.title", "home", "Inicio: título principal", "{companyName}", 120),
  def(
    "home.categoriesIntro",
    "home",
    "Inicio: introducción de productos",
    "Todo lo que su cocina o tienda necesita, de un solo proveedor.",
    200,
  ),
  def("home.benefit1Title", "home", "Inicio: ventaja 1 (título)", "Entregas puntuales", 60),
  def(
    "home.benefit1Text",
    "home",
    "Inicio: ventaja 1 (texto)",
    "Llegamos en el horario acordado.",
    160,
  ),
  def("home.benefit2Title", "home", "Inicio: ventaja 2 (título)", "Frescura y calidad", 60),
  def(
    "home.benefit2Text",
    "home",
    "Inicio: ventaja 2 (texto)",
    "Seleccionamos y cuidamos cada producto.",
    160,
  ),
  def("home.benefit3Title", "home", "Inicio: ventaja 3 (título)", "Amplia cobertura", 60),
  def(
    "home.benefit3Text",
    "home",
    "Inicio: ventaja 3 (texto)",
    "Entregamos en {city} y alrededores.",
    160,
  ),
  def("home.benefit4Title", "home", "Inicio: ventaja 4 (título)", "Precios por volumen", 60),
  def(
    "home.benefit4Text",
    "home",
    "Inicio: ventaja 4 (texto)",
    "Cotizaciones a la medida de su negocio.",
    160,
  ),
  def(
    "home.ctaTitle",
    "home",
    "Inicio: llamada final (título)",
    "¿Listo para abastecer su negocio?",
    100,
  ),
  def(
    "home.ctaText",
    "home",
    "Inicio: llamada final (texto)",
    "Escríbanos y reciba su cotización hoy mismo.",
    160,
  ),
  def(
    "about.qualityTitle",
    "about",
    "Nosotros: calidad (título)",
    "Calidad e inocuidad alimentaria",
    80,
  ),
  def(
    "about.qualityText",
    "about",
    "Nosotros: calidad (texto)",
    "Cuidamos la calidad y la higiene de los alimentos que distribuimos en cada etapa, hasta la entrega en su negocio.",
    400,
  ),
  def(
    "products.intro",
    "products",
    "Productos: introducción",
    "Elija una categoría para ver los productos que distribuimos. Pida precios por volumen por WhatsApp.",
    240,
  ),
  def(
    "delivery.intro",
    "delivery",
    "Entregas: introducción",
    "Todo lo que necesita saber para recibir nuestros productos en su negocio.",
    240,
  ),
  def(
    "faq.intro",
    "faq",
    "Preguntas frecuentes: introducción",
    "Si no encuentra su respuesta, escríbanos por WhatsApp.",
    240,
  ),
  def(
    "contact.intro",
    "contact",
    "Contacto: introducción",
    "La forma más rápida de hablar con nosotros es WhatsApp. También puede llamarnos o dejarnos un mensaje.",
    240,
  ),
];

export const PAGE_TEXT_BY_KEY = new Map(PAGE_TEXTS.map((t) => [t.key, t]));
