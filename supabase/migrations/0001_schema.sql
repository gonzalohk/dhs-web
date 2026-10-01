-- Schema for the food distribution website. See specs/001-food-distribution-website/data-model.md.

create table settings (
  id int primary key default 1 check (id = 1),
  company_name text not null,
  tagline text not null,
  story text not null,
  mission text not null,
  "values" text[] not null default '{}',
  certifications text[] not null default '{}',
  client_types text[] not null default '{}',
  phone text not null,
  email text not null,
  whatsapp_number text not null,          -- E.164, +591
  address text not null,
  city text not null,
  map_url text,
  business_hours text not null,
  service_areas text[] not null default '{}',
  delivery_schedule text not null,
  minimum_order text not null,
  ordering_steps text[] not null default '{}'
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  image_public_id text,
  image_alt text not null default '',
  sort_order int not null default 0,
  published boolean not null default true
);

create table products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories (id) on delete cascade,
  name text not null,
  description text not null,
  price_bob numeric(10, 2) check (price_bob is null or price_bob > 0),
  unit text,
  image_public_id text,
  image_alt text not null default '',
  sort_order int not null default 0,
  published boolean not null default true,
  -- unit is required when a price is set
  constraint unit_required_with_price check (price_bob is null or unit is not null)
);

create table faqs (
  id uuid primary key default gen_random_uuid(),
  topic text not null check (topic in ('ordering', 'payment', 'delivery', 'returns', 'other')),
  question text not null,
  answer text not null,
  sort_order int not null default 0,
  published boolean not null default true
);

create table testimonials (
  id uuid primary key default gen_random_uuid(),
  author text not null,
  quote text not null,
  published boolean not null default true
);

create table inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 100),
  email text,
  phone text,
  business_name text check (business_name is null or char_length(business_name) <= 120),
  message text not null check (char_length(message) between 10 and 2000),
  ip_hash text not null,
  email_sent boolean not null default false,
  status text not null default 'new' check (status in ('new', 'handled')),
  handled_at timestamptz,
  handled_by uuid,
  constraint email_or_phone check (email is not null or phone is not null)
);

create index inquiries_created_at_idx on inquiries (created_at desc);
create index inquiries_ip_hash_idx on inquiries (ip_hash, created_at);
