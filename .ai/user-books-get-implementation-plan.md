# API Endpoint Implementation Plan: GET /api/user-books

## 1. Przegląd punktu końcowego
Endpoint ten służy do pobierania listy książek bieżącego użytkownika z opcjonalnym filtrowaniem według statusu i pochodzenia rekomendacji oraz paginacją wyników. Zwraca szczegółowe informacje o książkach użytkownika, w tym dane o autorach, statusie czytania i powiązaniach z rekomendacjami.

## 2. Szczegóły żądania
- **Metoda HTTP**: GET
- **Struktura URL**: `/api/user-books`
- **Parametry**:
  - **Opcjonalne**:
    - `status` (query): Filtrowanie po statusie książki ('read', 'to_read', 'rejected')
    - `is_recommended` (query): Filtrowanie czy książka pochodzi z rekomendacji (true/false)
    - `page` (query, default=1): Numer strony do pobrania
    - `limit` (query, default=20): Ilość elementów na stronę

## 3. Wykorzystywane typy
Endpoint wykorzysta następujące typy z pliku `types.ts`:
- `UserBookResponseDto` - Format pojedynczej książki użytkownika w odpowiedzi
- `UserBookPaginatedResponseDto` - Format paginowanej odpowiedzi z książkami
- `PaginationInfo` - Informacje o paginacji
- `UserBookStatus` (enum) - Dozwolone wartości statusu książki

Dodatkowo, należy stworzyć schemat walidacji parametrów wejściowych używając Zod:
- `UserBooksQuerySchema` - Walidacja parametrów zapytania

## 4. Szczegóły odpowiedzi
- **Kody odpowiedzi**:
  - 200 OK: Pomyślne pobranie książek
  - 401 Unauthorized: Użytkownik niezalogowany
  - 400 Bad Request: Nieprawidłowe parametry zapytania
- **Format odpowiedzi**:
```json
{
  "data": [
    {
      "id": "uuid",
      "book_id": "uuid",
      "title": "string",
      "language": "string",
      "authors": [
        {
          "id": "uuid",
          "name": "string"
        }
      ],
      "status": "string",
      "is_recommended": "boolean",
      "rating": "boolean",
      "recommendation_id": "uuid",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ],
  "pagination": {
    "total": "number",
    "page": "number",
    "limit": "number",
    "total_pages": "number"
  }
}
```

## 5. Przepływ danych
1. Walidacja parametrów zapytania za pomocą Zod
2. Pobranie identyfikatora użytkownika z sesji Supabase
3. Budowa zapytania SQL z wykorzystaniem Supabase:
   - Złączenie tabeli `user_books` z `books` i dalej z `book_authors` oraz `authors`
   - Filtrowanie po identyfikatorze użytkownika
   - Dodatkowe filtry na podstawie parametrów zapytania (status, is_recommended)
   - Obliczenie całkowitej liczby rekordów (dla paginacji)
   - Dodanie limitów i przesunięcia na podstawie parametrów paginacji
4. Transformacja danych do formatu odpowiedzi:
   - Grupowanie autorów dla każdej książki
   - Mapowanie do struktury UserBookResponseDto
5. Konstrukcja odpowiedzi paginowanej z informacjami o paginacji

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie**: Endpint wymaga zalogowanego użytkownika. Sprawdzenie sesji użytkownika za pomocą Supabase Auth.
- **Autoryzacja**: Użytkownik może pobierać tylko swoje własne książki (filtrowanie po user_id).
- **Walidacja danych wejściowych**: Wszystkie parametry zapytania muszą być walidowane pod kątem poprawności typów i dopuszczalnych wartości.
- **SQL Injection**: Wykorzystujemy API Supabase, które zabezpiecza przed SQL Injection.

## 7. Obsługa błędów
- **Nieautoryzowany dostęp**: Zwrócenie 401 Unauthorized, gdy użytkownik nie jest zalogowany
- **Nieprawidłowe parametry zapytania**: Zwrócenie 400 Bad Request z informacją o błędzie
- **Błędy bazy danych**: Przechwycenie błędów Supabase i zwrócenie 500 Internal Server Error z odpowiednim komunikatem
- **Pusta kolekcja**: Zwrócenie pustej tablicy `data` z odpowiednimi informacjami o paginacji (nie traktujemy tego jako błąd)

## 8. Rozważania dotyczące wydajności
- **Indeksy bazy danych**: Upewnić się, że tabela `user_books` ma indeks na kolumnie `user_id`, `status` i `is_recommended`
- **Paginacja**: Ograniczenie ilości zwracanych danych poprzez paginację
- **Selektywne pobieranie kolumn**: Pobieranie tylko niezbędnych kolumn z bazy danych
- **Efektywne łączenie**: Optymalizacja zapytań JOIN między tabelami
- **Cache**: Rozważyć cache'owanie odpowiedzi dla często używanych parametrów

## 9. Etapy wdrożenia
1. **Utworzenie schematu walidacji**: Zdefiniowanie schematu Zod do walidacji parametrów zapytania
```typescript
// src/lib/schemas/user-books.schema.ts
import { z } from "zod";
import { UserBookStatus } from "../../types";

export const getUserBooksQuerySchema = z.object({
  status: z.enum([UserBookStatus.READ, UserBookStatus.TO_READ, UserBookStatus.REJECTED]).optional(),
  is_recommended: z.boolean().optional().transform(val => val === "true" ? true : val === "false" ? false : val),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20)
});

export type GetUserBooksQuery = z.infer<typeof getUserBooksQuerySchema>;
```

2. **Utworzenie serwisu do obsługi logiki biznesowej**:
```typescript
// src/lib/services/user-books.service.ts
import type { SupabaseClient } from "../../db/supabase.client";
import type { UserBookResponseDto, UserBookPaginatedResponseDto, PaginationInfo } from "../../types";
import type { GetUserBooksQuery } from "../schemas/user-books.schema";
import { NotFoundError, UnauthorizedError } from "../errors";

export async function getUserBooks(
  supabase: SupabaseClient,
  userId: string,
  query: GetUserBooksQuery
): Promise<UserBookPaginatedResponseDto> {
  const { status, is_recommended, page, limit } = query;
  
  // Przygotowanie zapytania bazowego
  let baseQuery = supabase
    .from("user_books")
    .select(`
      id,
      book_id,
      status,
      is_recommended,
      rating,
      recommendation_id,
      created_at,
      updated_at,
      books:book_id (
        id,
        title,
        language,
        book_authors:book_authors (
          authors:author_id (
            id,
            name
          )
        )
      )
    `)
    .eq("user_id", userId);
  
  // Dodanie filtrów opcjonalnych
  if (status) {
    baseQuery = baseQuery.eq("status", status);
  }
  
  if (is_recommended !== undefined) {
    baseQuery = baseQuery.eq("is_recommended", is_recommended);
  }
  
  // Obliczenie całkowitej liczby rekordów (dla paginacji)
  const { count, error: countError } = await baseQuery.count();
  
  if (countError) {
    throw new Error(`Error fetching user books count: ${countError.message}`);
  }
  
  // Dodanie paginacji
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  // Pobranie danych z paginacją
  const { data, error } = await baseQuery
    .range(from, to)
    .order("created_at", { ascending: false });
  
  if (error) {
    throw new Error(`Error fetching user books: ${error.message}`);
  }
  
  // Transformacja danych do formatu odpowiedzi
  const userBooks: UserBookResponseDto[] = data.map(item => {
    return {
      id: item.id,
      book_id: item.book_id,
      title: item.books.title,
      language: item.books.language,
      authors: item.books.book_authors.map(ba => ba.authors),
      status: item.status,
      is_recommended: item.is_recommended,
      rating: item.rating,
      recommendation_id: item.recommendation_id,
      created_at: item.created_at,
      updated_at: item.updated_at
    };
  });
  
  // Przygotowanie informacji o paginacji
  const pagination: PaginationInfo = {
    total: count || 0,
    page,
    limit,
    total_pages: Math.ceil((count || 0) / limit)
  };
  
  return {
    data: userBooks,
    pagination
  };
}
```

3. **Implementacja handlera endpoint'u**:
```typescript
// src/pages/api/user-books.ts
import type { APIRoute } from "astro";
import { getUserBooksQuerySchema } from "../../lib/schemas/user-books.schema";
import { getUserBooks } from "../../lib/services/user-books.service";
import { BadRequestError, UnauthorizedError } from "../../lib/errors";

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    // Sprawdzenie sesji użytkownika
    const { data: { session }, error: sessionError } = await locals.supabase.auth.getSession();
    
    if (sessionError || !session) {
      throw new UnauthorizedError("User not authenticated");
    }
    
    const userId = session.user.id;
    
    // Walidacja parametrów zapytania
    const url = new URL(request.url);
    const queryParams = {
      status: url.searchParams.get("status") || undefined,
      is_recommended: url.searchParams.get("is_recommended") || undefined,
      page: url.searchParams.get("page") || undefined,
      limit: url.searchParams.get("limit") || undefined
    };
    
    const validationResult = getUserBooksQuerySchema.safeParse(queryParams);
    
    if (!validationResult.success) {
      throw new BadRequestError(validationResult.error.message);
    }
    
    // Pobranie danych z serwisu
    const userBooks = await getUserBooks(
      locals.supabase,
      userId,
      validationResult.data
    );
    
    // Zwrócenie odpowiedzi
    return new Response(JSON.stringify(userBooks), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    if (error instanceof BadRequestError || error instanceof UnauthorizedError) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: error.statusCode,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
    
    console.error("Error in GET /api/user-books:", error);
    
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }
};
```

4. **Dokumentacja API**: Aktualizacja dokumentacji API o nowy endpoint
5. **Wdrożenie**: Deployment zmian i monitorowanie działania endpointu 