update public.blog_comments as comments
set author_name = 'yu'
from auth.users as users
where comments.created_by = users.id
  and lower(users.email) in ('yucai2027@gmail.com', 'akach66666@gmail.com')
  and comments.author_name is distinct from 'yu';
