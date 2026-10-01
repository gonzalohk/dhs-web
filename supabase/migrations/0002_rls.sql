-- Row Level Security.
-- Also required in the Supabase dashboard: Authentication > Sign In / Providers >
-- disable "Allow new users to sign up". Staff accounts are created by the company
-- in Authentication > Users.

alter table settings enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table faqs enable row level security;
alter table testimonials enable row level security;
alter table inquiries enable row level security;

-- Public content: anyone can read published rows.
create policy "public read settings" on settings for select using (true);
create policy "public read categories" on categories for select using (published);
create policy "public read products" on products for select using (published);
create policy "public read faqs" on faqs for select using (published);
create policy "public read testimonials" on testimonials for select using (published);

-- Inquiries: no anonymous access. Inserts happen server-side with the service role key,
-- which bypasses RLS. Signed-in staff can read all inquiries and change only their status.
create policy "staff read inquiries" on inquiries for select to authenticated using (true);
create policy "staff update inquiries" on inquiries for update to authenticated using (true) with check (true);

revoke all on inquiries from anon;
revoke update on inquiries from authenticated;
grant select on inquiries to authenticated;
grant update (status, handled_at, handled_by) on inquiries to authenticated;
