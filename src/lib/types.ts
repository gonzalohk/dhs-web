export type Settings = {
  companyName: string;
  tagline: string;
  story: string;
  mission: string;
  values: string[];
  certifications: string[];
  clientTypes: string[];
  phone: string; // E.164, +591
  email: string;
  whatsappNumber: string; // E.164, +591
  address: string;
  city: string;
  mapUrl: string | null;
  businessHours: string;
  serviceAreas: string[];
  deliverySchedule: string;
  minimumOrder: string;
  orderingSteps: string[];
  updatedAt?: string; // exact string from the database, used for optimistic locking
};

export type Product = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  priceBob: number | null; // null = "Solicitar cotización"
  unit: string | null;
  imagePath: string | null; // Supabase Storage path, or a local path starting with "/"
  imageSrc: string | null; // resolved URL used for rendering
  imageAlt: string;
  published?: boolean;
  sortOrder?: number;
  updatedAt?: string;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string;
  imagePath: string | null; // Supabase Storage path, or a local path starting with "/"
  imageSrc: string | null; // resolved URL used for rendering
  imageAlt: string;
  published?: boolean;
  sortOrder?: number;
  updatedAt?: string;
};

export type CategoryWithProducts = Category & { products: Product[] };

export type FaqTopic = "ordering" | "payment" | "delivery" | "returns" | "other";

export type Faq = {
  id: string;
  topic: FaqTopic;
  question: string;
  answer: string;
  published?: boolean;
  sortOrder?: number;
  updatedAt?: string;
};

export type Testimonial = {
  id: string;
  author: string;
  quote: string;
  published?: boolean;
  updatedAt?: string;
};

export type InquiryStatus = "new" | "handled";

export type Inquiry = {
  id: string;
  createdAt: string;
  name: string;
  email: string | null;
  phone: string | null;
  businessName: string | null;
  message: string;
  status: InquiryStatus;
};
