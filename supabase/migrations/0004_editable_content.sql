-- Feature 002: editable content. See specs/002-editable-content-company-data/data-model.md.
-- Apply this migration BEFORE deploying the code that reads `image_path`.

-- updated_at on every editable table; it is the optimistic-locking token.
alter table settings add column updated_at timestamptz not null default now();
alter table categories add column updated_at timestamptz not null default now();
alter table products add column updated_at timestamptz not null default now();
alter table faqs add column updated_at timestamptz not null default now();
alter table testimonials add column updated_at timestamptz not null default now();

-- A save that changes nothing keeps the same updated_at (and is not written to the change log).
create function set_updated_at() returns trigger
language plpgsql as $$
begin
  if (to_jsonb(new) - 'updated_at') = (to_jsonb(old) - 'updated_at') then
    new.updated_at = old.updated_at;
  else
    new.updated_at = now();
  end if;
  return new;
end;
$$;

create trigger settings_updated_at before update on settings for each row execute function set_updated_at();
create trigger categories_updated_at before update on categories for each row execute function set_updated_at();
create trigger products_updated_at before update on products for each row execute function set_updated_at();
create trigger faqs_updated_at before update on faqs for each row execute function set_updated_at();
create trigger testimonials_updated_at before update on testimonials for each row execute function set_updated_at();

-- Images now live in Supabase Storage (bucket "site-images"); the column stores the object path.
alter table categories rename column image_public_id to image_path;
alter table products rename column image_public_id to image_path;

-- Editable page texts (keys are defined in src/content/page-texts.ts).
create table page_texts (
  key text primary key,
  value text not null check (char_length(value) > 0),
  updated_at timestamptz not null default now()
);
create trigger page_texts_updated_at before update on page_texts for each row execute function set_updated_at();

-- Change log, written by triggers so edits made in the Supabase dashboard are recorded too.
create table content_changes (
  id uuid primary key default gen_random_uuid(),
  changed_at timestamptz not null default now(),
  table_name text not null,
  row_id text not null,
  op text not null check (op in ('insert', 'update', 'delete')),
  previous jsonb,
  new jsonb,
  changed_by uuid
);
create index content_changes_item_idx on content_changes (table_name, row_id, changed_at desc);

-- SECURITY DEFINER: staff users have no insert permission on content_changes, only the trigger writes.
create function log_content_change() returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    insert into content_changes (table_name, row_id, op, previous, new, changed_by)
    values (tg_table_name, coalesce(to_jsonb(old) ->> 'id', to_jsonb(old) ->> 'key'), 'delete', to_jsonb(old), null, auth.uid());
    return old;
  elsif tg_op = 'UPDATE' then
    if to_jsonb(old) = to_jsonb(new) then
      return new;
    end if;
    insert into content_changes (table_name, row_id, op, previous, new, changed_by)
    values (tg_table_name, coalesce(to_jsonb(new) ->> 'id', to_jsonb(new) ->> 'key'), 'update', to_jsonb(old), to_jsonb(new), auth.uid());
    return new;
  else
    insert into content_changes (table_name, row_id, op, previous, new, changed_by)
    values (tg_table_name, coalesce(to_jsonb(new) ->> 'id', to_jsonb(new) ->> 'key'), 'insert', null, to_jsonb(new), auth.uid());
    return new;
  end if;
end;
$$;

create trigger settings_log after insert or update or delete on settings for each row execute function log_content_change();
create trigger page_texts_log after insert or update or delete on page_texts for each row execute function log_content_change();
create trigger categories_log after insert or update or delete on categories for each row execute function log_content_change();
create trigger products_log after insert or update or delete on products for each row execute function log_content_change();
create trigger faqs_log after insert or update or delete on faqs for each row execute function log_content_change();
create trigger testimonials_log after insert or update or delete on testimonials for each row execute function log_content_change();
