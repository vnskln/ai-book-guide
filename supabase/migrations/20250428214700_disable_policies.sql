-- Migration: disable_policies
-- Description: Disables all row level security policies created in the initial schema
-- Created at: 2025-04-28 21:47:00 UTC
-- Author: AI Assistant

-- Disable User Preferences policies
drop policy if exists "Users can view their own preferences" on user_preferences;
drop policy if exists "Users can insert their own preferences" on user_preferences;
drop policy if exists "Users can update their own preferences" on user_preferences;
drop policy if exists "Users can delete their own preferences" on user_preferences;

-- Disable User Books policies
drop policy if exists "Users can view their own books" on user_books;
drop policy if exists "Users can insert their own books" on user_books;
drop policy if exists "Users can update their own books" on user_books;
drop policy if exists "Users can delete their own books" on user_books;

-- Disable Recommendations policies
drop policy if exists "Users can view their own recommendations" on recommendations;
drop policy if exists "Users can insert their own recommendations" on recommendations;
drop policy if exists "Users can update their own recommendations" on recommendations;
drop policy if exists "Users can delete their own recommendations" on recommendations;

-- Disable Books, Authors, and BookAuthors policies for authenticated users
drop policy if exists "Public books data is viewable by all users" on books;
drop policy if exists "Public authors data is viewable by all users" on authors;
drop policy if exists "Public book_authors data is viewable by all users" on book_authors;

-- Disable Books, Authors, and BookAuthors policies for anon users
drop policy if exists "Public books data is viewable by anon users" on books;
drop policy if exists "Public authors data is viewable by anon users" on authors;
drop policy if exists "Public book_authors data is viewable by anon users" on book_authors;

-- Note: This migration only disables the RLS policies but keeps RLS enabled on the tables
-- To completely disable RLS on tables, uncomment the following lines:
-- alter table user_preferences disable row level security;
-- alter table user_books disable row level security;
-- alter table recommendations disable row level security;
-- alter table authors disable row level security;
-- alter table books disable row level security;
-- alter table book_authors disable row level security; 