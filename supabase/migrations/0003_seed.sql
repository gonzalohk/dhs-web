-- Placeholder seed data (Spanish, Bolivia). Mirrors src/content/placeholder.ts.
-- Replace with the company's real content before launch.

insert into settings (id, company_name, tagline, story, mission, "values", certifications, client_types, phone, email, whatsapp_number, address, city, map_url, business_hours, service_areas, delivery_schedule, minimum_order, ordering_steps) values (1, 'Distribuidora Andina', 'Alimentos frescos y abarrotes para su negocio, a tiempo y en todo Santa Cruz.', 'Nacimos como un pequeño distribuidor familiar en Santa Cruz de la Sierra y hoy abastecemos a restaurantes, tiendas, hoteles e instituciones en varios departamentos de Bolivia. Trabajamos directamente con productores nacionales para ofrecer productos frescos a precios justos.', 'Abastecer a los negocios de alimentos de Bolivia con productos de calidad, entregas puntuales y un trato cercano.', array['Frescura garantizada', 'Puntualidad en cada entrega', 'Precios justos', 'Trato cercano']::text[], array['Registro sanitario SENASAG', 'Cadena de frío controlada', 'Buenas prácticas de manufactura']::text[], array['Restaurantes', 'Tiendas y minimercados', 'Hoteles', 'Catering', 'Instituciones']::text[], '+59133000000', 'contacto@example.com', '+59170000000', 'Av. Ejemplo 123, Parque Industrial', 'Santa Cruz de la Sierra', 'https://www.openstreetmap.org/export/embed.html?bbox=-63.22%2C-17.82%2C-63.14%2C-17.76&layer=mapnik', 'Lunes a viernes de 7:00 a 18:00; sábados de 7:00 a 13:00', array['Santa Cruz de la Sierra', 'Montero', 'Warnes', 'Cochabamba', 'La Paz y El Alto']::text[], 'Santa Cruz: entregas de lunes a sábado, al día siguiente del pedido. Otras ciudades: dos veces por semana.', 'Pedido mínimo de Bs 500 para entregas sin costo en Santa Cruz.', array['Escríbanos por WhatsApp o llene el formulario de contacto.', 'Le enviamos una cotización según su volumen.', 'Abrimos su cuenta de cliente y coordinamos la primera entrega.', 'Haga sus pedidos por WhatsApp; los entregamos en su horario.']::text[]);

insert into categories (slug, name, description, image_alt, sort_order) values
  ('frutas-y-verduras', 'Frutas y verduras', 'Productos frescos seleccionados cada día de productores nacionales.', 'Cajas de frutas y verduras frescas', 0),
  ('lacteos', 'Lácteos y huevos', 'Leche, quesos, yogur y huevos con cadena de frío.', 'Quesos, leche y huevos', 1),
  ('carnes-y-aves', 'Carnes y aves', 'Cortes de res, cerdo y pollo para cocinas profesionales.', 'Cortes de carne y pollo', 2),
  ('abarrotes', 'Abarrotes', 'Arroz, azúcar, aceite, harinas y productos secos al por mayor.', 'Sacos de arroz y productos secos', 3),
  ('bebidas', 'Bebidas', 'Aguas, jugos y refrescos para tiendas y restaurantes.', 'Botellas de agua y jugos', 4),
  ('congelados', 'Congelados', 'Vegetales, papas y productos congelados listos para cocinar.', 'Productos congelados', 5);

insert into products (category_id, name, description, price_bob, unit, image_alt, sort_order)
select c.id, v.name, v.description, v.price_bob, v.unit, v.image_alt, v.sort_order from (values
  ('frutas-y-verduras', 'Tomate', 'Tomate de primera, caja de 20 kg.', 120, 'caja 20 kg', 'Tomates rojos', 0),
  ('frutas-y-verduras', 'Papa holandesa', 'Papa lavada, ideal para freír.', 95, 'arroba', 'Papas', 1),
  ('frutas-y-verduras', 'Frutas de temporada', 'Plátano, papaya, piña y cítricos según temporada.', null::numeric, null, 'Frutas tropicales', 2),
  ('lacteos', 'Leche entera', 'Leche pasteurizada en bolsa de 1 litro.', null::numeric, null, 'Leche en bolsa', 3),
  ('lacteos', 'Queso menonita', 'Queso semiduro en bloque.', 48, 'kg', 'Bloque de queso', 4),
  ('lacteos', 'Huevos', 'Huevos frescos, maple de 30 unidades.', 32, 'maple 30 u', 'Maple de huevos', 5),
  ('carnes-y-aves', 'Pollo entero', 'Pollo fresco refrigerado.', null::numeric, null, 'Pollo entero', 6),
  ('carnes-y-aves', 'Carne de res', 'Cortes para parrilla y guisos.', null::numeric, null, 'Cortes de carne de res', 7),
  ('abarrotes', 'Arroz grano de oro', 'Arroz nacional, quintal de 46 kg.', 310, 'quintal', 'Saco de arroz', 8),
  ('abarrotes', 'Aceite vegetal', 'Aceite de soya, bidón de 5 litros.', null::numeric, null, 'Bidón de aceite', 9),
  ('abarrotes', 'Azúcar', 'Azúcar blanca, quintal de 46 kg.', null::numeric, null, 'Saco de azúcar', 10),
  ('bebidas', 'Agua de mesa', 'Botellas de 2 litros, paquete de 6.', 30, 'paquete', 'Botellas de agua', 11),
  ('bebidas', 'Jugos naturales', 'Jugos de frutas en envase de 1 litro.', null::numeric, null, 'Jugos en envase', 12),
  ('congelados', 'Papas prefritas', 'Papas bastón congeladas, bolsa de 2,5 kg.', null::numeric, null, 'Papas prefritas congeladas', 13)
) as v (slug, name, description, price_bob, unit, image_alt, sort_order) join categories c on c.slug = v.slug;

insert into faqs (topic, question, answer, sort_order) values
  ('ordering', '¿Cómo hago mi primer pedido?', 'Escríbanos por WhatsApp o llene el formulario de contacto. Le enviamos una cotización, abrimos su cuenta y coordinamos la entrega.', 0),
  ('ordering', '¿Venden a personas particulares?', 'Trabajamos principalmente con negocios, pero atendemos pedidos grandes de particulares para eventos.', 1),
  ('payment', '¿Qué formas de pago aceptan?', 'Transferencia bancaria, pago QR y efectivo contra entrega. Clientes frecuentes pueden solicitar crédito.', 2),
  ('payment', '¿Emiten factura?', 'Sí, emitimos factura en todas las ventas.', 3),
  ('delivery', '¿A qué zonas entregan?', 'Santa Cruz de la Sierra y alrededores todos los días hábiles, y otras ciudades dos veces por semana.', 4),
  ('delivery', '¿Tiene costo la entrega?', 'Es gratuita en Santa Cruz desde el pedido mínimo. Para otras ciudades le indicamos el costo en la cotización.', 5),
  ('returns', '¿Qué pasa si un producto llega en mal estado?', 'Avísenos dentro de las 24 horas y lo reponemos en la siguiente entrega o le devolvemos el importe.', 6);

insert into testimonials (author, quote) values
  ('Restaurante en Equipetrol', 'Siempre llegan a tiempo y la verdura es fresca. Nos simplificaron las compras.'),
  ('Minimercado en Montero', 'Buenos precios por volumen y atención rápida por WhatsApp.'),
  ('Servicio de catering', 'Nos resuelven pedidos grandes con poca anticipación.');
