-- Run once, after the Maps schema has created public.is_map_admin().
begin;

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(btrim(title)) > 0),
  body text not null check (length(btrim(body)) > 0),
  entry_date date not null,
  entry_time time not null,
  timezone_name text not null,
  timezone_offset_minutes smallint not null check (timezone_offset_minutes between -840 and 840),
  created_at timestamptz not null default now(),
  created_by uuid not null default auth.uid() references auth.users(id) on delete cascade
);

create index if not exists blog_posts_timeline_idx
  on public.blog_posts (entry_date desc, created_at desc);

create table if not exists public.blog_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.blog_posts(id) on delete cascade,
  body text not null check (length(btrim(body)) > 0),
  author_name text not null default 'Member',
  created_at timestamptz not null default now(),
  created_by uuid not null default auth.uid() references auth.users(id) on delete cascade
);

create index if not exists blog_comments_post_time_idx
  on public.blog_comments (post_id, created_at);

alter table public.blog_posts enable row level security;
alter table public.blog_comments enable row level security;

revoke all on public.blog_posts, public.blog_comments from anon, authenticated;
grant select, insert, delete on public.blog_posts, public.blog_comments to authenticated;

create policy "authenticated blog post reads" on public.blog_posts
  for select to authenticated using (auth.uid() is not null);
create policy "map admin blog post inserts" on public.blog_posts
  for insert to authenticated
  with check (public.is_map_admin() and created_by = auth.uid());
create policy "map admin blog post deletes" on public.blog_posts
  for delete to authenticated using (public.is_map_admin());

create policy "authenticated blog comment reads" on public.blog_comments
  for select to authenticated using (auth.uid() is not null);
create policy "authenticated blog comment inserts" on public.blog_comments
  for insert to authenticated
  with check (auth.uid() is not null and created_by = auth.uid());
create policy "map admin blog comment deletes" on public.blog_comments
  for delete to authenticated using (public.is_map_admin());

commit;
