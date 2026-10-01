-- DHS company data. Values the owner has not provided yet are marked "[Pendiente]"; the public site
-- hides any section that still contains that marker, and the staff dashboard lists them.
-- No claim about DHS is made that the owner did not give.

update settings set
  company_name = 'DHS',
  phone = '+59157734924',
  whatsapp_number = '+59157734924',
  email = 'distribuidoradhs2026@gmail.com',
  tagline = '[Pendiente] Frase que resume a la empresa',
  story = '[Pendiente] Historia de la empresa',
  mission = '[Pendiente] Misión de la empresa',
  "values" = array['[Pendiente] Valores de la empresa']::text[],
  certifications = array[]::text[],
  client_types = array[]::text[],
  address = '[Pendiente] Dirección',
  city = '[Pendiente] Ciudad',
  map_url = null,
  business_hours = '[Pendiente] Horario de atención',
  service_areas = array[]::text[],
  delivery_schedule = '[Pendiente] Días y horarios de entrega',
  minimum_order = '[Pendiente] Pedido mínimo',
  ordering_steps = array[]::text[]
where id = 1;

-- Demo testimonials, policy answers, and prices were invented placeholders; keep them out of the public site.
update testimonials set published = false;
update faqs set published = false;
update products set price_bob = null, unit = null;
