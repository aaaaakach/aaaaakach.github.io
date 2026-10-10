begin;

alter table public.blog_comments
  add column if not exists author_name text;

update public.blog_comments as comments
set author_name = left(coalesce(
  nullif(btrim(users.raw_user_meta_data ->> 'full_name'), ''),
  nullif(btrim(users.raw_user_meta_data ->> 'name'), ''),
  nullif(split_part(users.email, '@', 1), ''),
  'Member'
), 80)
from auth.users as users
where comments.created_by = users.id
  and (comments.author_name is null or btrim(comments.author_name) = '');

update public.blog_comments
set author_name = 'Member'
where author_name is null or btrim(author_name) = '';

alter table public.blog_comments
  alter column author_name set default 'Member',
  alter column author_name set not null;

commit;
