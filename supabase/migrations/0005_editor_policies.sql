-- Feature 002: permissions for the staff editors and the image bucket.
-- Public sign-up must stay disabled (Authentication > Sign In / Providers).

alter table page_texts enable row level security;
alter table content_changes enable row level security;

-- Anyone can read page texts.
create policy "public read page_texts" on page_texts for select using (true);

-- Signed-in staff can read everything (including unpublished rows) and change content.
create policy "staff update settings" on settings for update to authenticated using (true) with check (true);

create policy "staff all page_texts" on page_texts for all to authenticated using (true) with check (true);

create policy "staff read categories" on categories for select to authenticated using (true);
create policy "staff write categories" on categories for all to authenticated using (true) with check (true);

create policy "staff read products" on products for select to authenticated using (true);
create policy "staff write products" on products for all to authenticated using (true) with check (true);

create policy "staff read faqs" on faqs for select to authenticated using (true);
create policy "staff write faqs" on faqs for all to authenticated using (true) with check (true);

create policy "staff read testimonials" on testimonials for select to authenticated using (true);
create policy "staff write testimonials" on testimonials for all to authenticated using (true) with check (true);

-- The change log is read-only for staff (the trigger writes it) and invisible to anonymous visitors.
create policy "staff read content_changes" on content_changes for select to authenticated using (true);
revoke all on content_changes from anon;
revoke insert, update, delete on content_changes from authenticated;

-- Image bucket: public files, only staff can upload, replace, or delete.
insert into storage.buckets (id, name, public) values ('site-images', 'site-images', true)
on conflict (id) do nothing;

create policy "staff read site-images" on storage.objects for select to authenticated using (bucket_id = 'site-images');
create policy "staff insert site-images" on storage.objects for insert to authenticated with check (bucket_id = 'site-images');
create policy "staff update site-images" on storage.objects for update to authenticated using (bucket_id = 'site-images') with check (bucket_id = 'site-images');
create policy "staff delete site-images" on storage.objects for delete to authenticated using (bucket_id = 'site-images');
