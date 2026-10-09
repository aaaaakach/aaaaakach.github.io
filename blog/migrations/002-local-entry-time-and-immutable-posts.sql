-- Existing posts keep their entry_date; the new local-time fields stay NULL for them.
-- Run once after the initial Blog schema has been applied.
begin;

alter table public.blog_posts
  add column entry_time time,
  add column timezone_name text,
  add column timezone_offset_minutes smallint,
  add constraint blog_posts_timezone_fields_check check (
    (entry_time is null and timezone_name is null and timezone_offset_minutes is null)
    or
    (entry_time is not null and timezone_name is not null and length(btrim(timezone_name)) > 0
      and timezone_offset_minutes is not null
      and timezone_offset_minutes between -840 and 840)
  );

revoke update on public.blog_posts from authenticated;
alter policy "map admin blog post updates" on public.blog_posts
  using (false) with check (false);

commit;
