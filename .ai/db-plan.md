# Schemat bazy danych PostgreSQL dla AI Book Guide

## 1. Tabele

### `users` (rozszerzenie wbudowanej tabeli Supabase `auth.users`, tabel zarządzana przez Supabase Auth)
| Kolumna           | Typ             | Ograniczenia    | Opis                               |
|-------------------|-----------------|-----------------|-----------------------------------|
| id                | uuid            | PK, NOT NULL    | Identyfikator użytkownika          |
| created_at        | timestamptz     | NOT NULL        | Data utworzenia konta              |
| email             | text            | UNIQUE, NOT NULL| Email użytkownika                  |
| ... (pozostałe kolumny z auth.users)

### `user_preferences`
| Kolumna           | Typ             | Ograniczenia    | Opis                               |
|-------------------|-----------------|-----------------|-----------------------------------|
| id                | uuid            | PK, NOT NULL    | Identyfikator preferencji          |
| user_id           | uuid            | FK, NOT NULL    | Referencja do użytkownika          |
| reading_preferences | text          | NOT NULL        | Preferencje czytelnicze (max 1000 znaków) |
| preferred_language | text           | NOT NULL        | Preferowany język książek          |
| created_at        | timestamptz     | NOT NULL        | Data utworzenia                    |
| updated_at        | timestamptz     | NOT NULL        | Data ostatniej aktualizacji        |

### `authors`
| Kolumna           | Typ             | Ograniczenia    | Opis                               |
|-------------------|-----------------|-----------------|-----------------------------------|
| id                | uuid            | PK, NOT NULL    | Identyfikator autora               |
| name              | text            | NOT NULL        | Imię i nazwisko autora             |
| created_at        | timestamptz     | NOT NULL        | Data dodania                       |

### `books`
| Kolumna           | Typ             | Ograniczenia    | Opis                               |
|-------------------|-----------------|-----------------|-----------------------------------|
| id                | uuid            | PK, NOT NULL    | Identyfikator książki              |
| title             | text            | NOT NULL        | Tytuł książki                      |
| language          | text            | NOT NULL        | Język książki                      |
| created_at        | timestamptz     | NOT NULL        | Data dodania                       |

### `book_authors` (tabela pośrednia dla relacji wiele-do-wielu)
| Kolumna           | Typ             | Ograniczenia    | Opis                               |
|-------------------|-----------------|-----------------|-----------------------------------|
| id                | uuid            | PK, NOT NULL    | Identyfikator relacji              |
| book_id           | uuid            | FK, NOT NULL    | Referencja do książki              |
| author_id         | uuid            | FK, NOT NULL    | Referencja do autora               |

### `user_books`
| Kolumna           | Typ             | Ograniczenia    | Opis                               |
|-------------------|-----------------|-----------------|-----------------------------------|
| id                | uuid            | PK, NOT NULL    | Identyfikator relacji              |
| user_id           | uuid            | FK, NOT NULL    | Referencja do użytkownika          |
| book_id           | uuid            | FK, NOT NULL    | Referencja do książki              |
| status            | text            | NOT NULL        | Status książki: 'read', 'to_read', 'rejected' |
| is_recommended    | boolean         | NOT NULL        | Czy książka pochodzi z rekomendacji |
| rating            | boolean         | NULL            | Ocena książki (kciuk w górę/dół), tylko dla przeczytanych |
| recommendation_id | uuid            | FK, NULL        | Referencja do rekomendacji (jeśli pochodzi z rekomendacji) |
| created_at        | timestamptz     | NOT NULL        | Data dodania                       |
| updated_at        | timestamptz     | NOT NULL        | Data aktualizacji                  |

### `recommendations`
| Kolumna           | Typ             | Ograniczenia    | Opis                               |
|-------------------|-----------------|-----------------|-----------------------------------|
| id                | uuid            | PK, NOT NULL    | Identyfikator rekomendacji         |
| user_id           | uuid            | FK, NOT NULL    | Referencja do użytkownika          |
| book_id           | uuid            | FK, NOT NULL    | Referencja do książki              |
| ai_model          | text            | NOT NULL        | Użyty model AI                     |
| execution_time    | interval        | NOT NULL        | Czas wykonania rekomendacji        |
| status            | text            | NOT NULL        | Status: 'pending', 'accepted', 'rejected' |
| plot_summary      | text            | NOT NULL        | AI-wygenerowane podsumowanie fabuły książki |
| rationale         | text            | NOT NULL        | AI-wygenerowane wyjaśnienie, dlaczego ta książka została polecona |
| created_at        | timestamptz     | NOT NULL        | Data wygenerowania                 |
| updated_at        | timestamptz     | NOT NULL        | Data aktualizacji statusu          |

## 2. Relacje

1. `user_preferences.user_id` → `users.id` (jeden-do-jednego)
   - `ON DELETE CASCADE`

2. `book_authors.book_id` → `books.id` (wiele-do-wielu)
   - `ON DELETE CASCADE`

3. `book_authors.author_id` → `authors.id` (wiele-do-wielu)
   - `ON DELETE CASCADE`

4. `user_books.user_id` → `users.id` (wiele-do-wielu)
   - `ON DELETE CASCADE`

5. `user_books.book_id` → `books.id` (wiele-do-wielu)
   - `ON DELETE CASCADE`

6. `user_books.recommendation_id` → `recommendations.id` (jeden-do-wielu)
   - `ON DELETE SET NULL`

7. `recommendations.user_id` → `users.id` (wiele-do-jednego)
   - `ON DELETE CASCADE`

8. `recommendations.book_id` → `books.id` (wiele-do-jednego)
   - `ON DELETE CASCADE`

## 3. Indeksy

1. `user_preferences_user_id_idx` na `user_preferences.user_id`
2. `book_authors_book_id_idx` na `book_authors.book_id`
3. `book_authors_author_id_idx` na `book_authors.author_id`
4. `user_books_user_id_idx` na `user_books.user_id`
5. `user_books_book_id_idx` na `user_books.book_id`
6. `user_books_status_idx` na `user_books.status`
7. `recommendations_user_id_idx` na `recommendations.user_id`
8. `recommendations_status_idx` na `recommendations.status`
9. `books_title_idx` na `books.title` (indeks tekstowy GIN dla wyszukiwania)
10. `authors_name_idx` na `authors.name` (indeks tekstowy GIN dla wyszukiwania)

## 4. Ograniczenia

1. Unikalność kombinacji użytkownik-książka w tabeli `user_books`
```sql
ALTER TABLE user_books ADD CONSTRAINT unique_user_book UNIQUE (user_id, book_id);
```

2. Walidacja statusu w tabeli `user_books`
```sql
ALTER TABLE user_books ADD CONSTRAINT valid_status
  CHECK (status IN ('read', 'to_read', 'rejected'));
```

3. Walidacja statusu w tabeli `recommendations`
```sql
ALTER TABLE recommendations ADD CONSTRAINT valid_recommendation_status
  CHECK (status IN ('pending', 'accepted', 'rejected'));
```

4. Ograniczenie długości preferencji czytelniczych
```sql
ALTER TABLE user_preferences ADD CONSTRAINT reading_preferences_length
  CHECK (length(reading_preferences) <= 1000);
```

5. Unikalność kombinacji książka-autor w tabeli `book_authors`
```sql
ALTER TABLE book_authors ADD CONSTRAINT unique_book_author 
  UNIQUE (book_id, author_id);
```

6. Ograniczenie długości podsumowania fabuły w rekomendacjach
```sql
ALTER TABLE recommendations ADD CONSTRAINT plot_summary_length
  CHECK (length(plot_summary) <= 2000);
```

7. Ograniczenie długości uzasadnienia rekomendacji
```sql
ALTER TABLE recommendations ADD CONSTRAINT rationale_length
  CHECK (length(rationale) <= 2000);
```

## 5. Row Level Security (RLS)

### Tabela `user_preferences`
```sql
CREATE POLICY user_preferences_policy ON user_preferences
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### Tabela `user_books`
```sql
CREATE POLICY user_books_policy ON user_books
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```