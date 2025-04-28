-- Migration: initial_schema
-- Description: Creates the initial database schema for AI Book Guide
-- Created at: 2025-04-28 21:46:00 UTC
-- Author: AI Assistant

-- Enable Row Level Security for all tables
alter database postgres set row_security = on;

-- Create extensions
create extension if not exists "pg_trgm";
create extension if not exists "uuid-ossp";

-- User preferences table
create table if not exists "user_preferences" (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  reading_preferences text not null,
  preferred_language text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reading_preferences_length check (length(reading_preferences) <= 1000)
);

comment on table "user_preferences" is 'Stores user preferences for book recommendations';

-- Authors table
create table if not exists "authors" (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_at timestamptz not null default now()
);

comment on table "authors" is 'Stores book authors';

-- Books table
create table if not exists "books" (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  language text not null,
  created_at timestamptz not null default now()
);

comment on table "books" is 'Stores book information';

-- Book authors join table
create table if not exists "book_authors" (
  id uuid primary key default uuid_generate_v4(),
  book_id uuid references books(id) on delete cascade not null,
  author_id uuid references authors(id) on delete cascade not null,
  constraint unique_book_author unique (book_id, author_id)
);

comment on table "book_authors" is 'Join table connecting books with their authors';

-- Recommendations table
create table if not exists "recommendations" (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  book_id uuid references books(id) on delete cascade not null,
  ai_model text not null,
  execution_time interval not null,
  status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint valid_recommendation_status check (status in ('pending', 'accepted', 'rejected'))
);

comment on table "recommendations" is 'Stores AI-generated book recommendations for users';

-- User books table
create table if not exists "user_books" (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  book_id uuid references books(id) on delete cascade not null,
  status text not null,
  is_recommended boolean not null default false,
  rating boolean null,
  recommendation_id uuid references recommendations(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint unique_user_book unique (user_id, book_id),
  constraint valid_status check (status in ('read', 'to_read', 'rejected'))
);

comment on table "user_books" is 'Tracks books added by users with their reading status';

-- Create indexes
create index user_preferences_user_id_idx on user_preferences(user_id);
create index book_authors_book_id_idx on book_authors(book_id);
create index book_authors_author_id_idx on book_authors(author_id);
create index user_books_user_id_idx on user_books(user_id);
create index user_books_book_id_idx on user_books(book_id);
create index user_books_status_idx on user_books(status);
create index recommendations_user_id_idx on recommendations(user_id);
create index recommendations_status_idx on recommendations(status);
create index books_title_idx on books using gin(title gin_trgm_ops);
create index authors_name_idx on authors using gin(name gin_trgm_ops);

-- Create functions for timestamps and status updates
create or replace function update_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create or replace function update_recommendation_status()
returns trigger as $$
begin
  if new.status = 'read' or new.status = 'to_read' then
    update recommendations set status = 'accepted' 
    where id = new.recommendation_id;
  elsif new.status = 'rejected' then
    update recommendations set status = 'rejected' 
    where id = new.recommendation_id;
  end if;
  return new;
end;
$$ language plpgsql;

-- Create triggers
create trigger update_user_preferences_timestamp
before update on user_preferences
for each row
execute function update_timestamp();

create trigger update_user_books_timestamp
before update on user_books
for each row
execute function update_timestamp();

create trigger update_recommendations_timestamp
before update on recommendations
for each row
execute function update_timestamp();

create trigger after_user_book_update
after update on user_books
for each row
when (old.status is distinct from new.status)
execute function update_recommendation_status();

-- Create views
create or replace view user_read_books as
select 
  ub.id, 
  ub.user_id,
  b.id as book_id,
  b.title,
  b.language,
  string_agg(a.name, ', ') as authors,
  ub.rating,
  ub.is_recommended,
  ub.created_at
from 
  user_books ub
join books b on b.id = ub.book_id
left join book_authors ba on ba.book_id = b.id
left join authors a on a.id = ba.author_id
where 
  ub.status = 'read'
group by 
  ub.id, ub.user_id, b.id, b.title, b.language, ub.rating, ub.is_recommended, ub.created_at;

create or replace view user_to_read_books as
select 
  ub.id, 
  ub.user_id,
  b.id as book_id,
  b.title,
  b.language,
  string_agg(a.name, ', ') as authors,
  ub.is_recommended,
  ub.created_at
from 
  user_books ub
join books b on b.id = ub.book_id
left join book_authors ba on ba.book_id = b.id
left join authors a on a.id = ba.author_id
where 
  ub.status = 'to_read'
group by 
  ub.id, ub.user_id, b.id, b.title, b.language, ub.is_recommended, ub.created_at;

create or replace view user_rejected_books as
select 
  ub.id, 
  ub.user_id,
  b.id as book_id,
  b.title,
  b.language,
  string_agg(a.name, ', ') as authors,
  ub.is_recommended,
  ub.created_at
from 
  user_books ub
join books b on b.id = ub.book_id
left join book_authors ba on ba.book_id = b.id
left join authors a on a.id = ba.author_id
where 
  ub.status = 'rejected'
group by 
  ub.id, ub.user_id, b.id, b.title, b.language, ub.is_recommended, ub.created_at;

-- Enable Row Level Security on tables
alter table user_preferences enable row level security;
alter table user_books enable row level security;
alter table recommendations enable row level security;
alter table authors enable row level security;
alter table books enable row level security;
alter table book_authors enable row level security;

-- Create RLS policies
-- User Preferences policies
create policy "Users can view their own preferences"
  on user_preferences for select
  using (auth.uid() = user_id);

create policy "Users can insert their own preferences"
  on user_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own preferences"
  on user_preferences for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own preferences"
  on user_preferences for delete
  using (auth.uid() = user_id);

-- User Books policies
create policy "Users can view their own books"
  on user_books for select
  using (auth.uid() = user_id);

create policy "Users can insert their own books"
  on user_books for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own books"
  on user_books for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own books"
  on user_books for delete
  using (auth.uid() = user_id);

-- Recommendations policies
create policy "Users can view their own recommendations"
  on recommendations for select
  using (auth.uid() = user_id);

create policy "Users can insert their own recommendations"
  on recommendations for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own recommendations"
  on recommendations for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own recommendations"
  on recommendations for delete
  using (auth.uid() = user_id);

-- Books, Authors, and BookAuthors are public read-only data for authenticated users
create policy "Public books data is viewable by all users"
  on books for select
  to authenticated
  using (true);

create policy "Public authors data is viewable by all users"
  on authors for select
  to authenticated
  using (true);

create policy "Public book_authors data is viewable by all users"
  on book_authors for select
  to authenticated
  using (true);

-- Anon users can view books, authors, and book_authors
create policy "Public books data is viewable by anon users"
  on books for select
  to anon
  using (true);

create policy "Public authors data is viewable by anon users"
  on authors for select
  to anon
  using (true);

create policy "Public book_authors data is viewable by anon users"
  on book_authors for select
  to anon
  using (true); 