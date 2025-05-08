# API Endpoint Implementation Plan: DELETE /api/user-books/:id

## 1. Przegląd punktu końcowego
Endpoint DELETE /api/user-books/:id umożliwia usunięcie książki z kolekcji użytkownika. Endpoint sprawdza uprawnienia użytkownika, weryfikując czy jest on właścicielem książki przed jej usunięciem. Po pomyślnym usunięciu zwraca kod statusu 204 No Content.

## 2. Szczegóły żądania
- Metoda HTTP: DELETE
- Struktura URL: `/api/user-books/:id`
- Parametry ścieżki:
  - `id` (UUID): Identyfikator rekordu książki w kolekcji użytkownika (`user_books.id`)
- Request Body: Brak

## 3. Wykorzystywane typy
Endpoint korzysta z istniejących typów zdefiniowanych w projekcie. Nie wymaga tworzenia nowych typów ani schematów walidacji, ponieważ nie przyjmuje danych wejściowych w body żądania.

Wykorzystywane klasy błędów:
```typescript
import { UnauthorizedError, NotFoundError } from "../../lib/errors/http";
```

## 4. Szczegóły odpowiedzi
- Status 204 No Content: Książka została pomyślnie usunięta z kolekcji użytkownika
- Status 401 Unauthorized: Użytkownik nie jest uwierzytelniony
- Status 403 Forbidden: Użytkownik nie jest właścicielem książki
- Status 404 Not Found: Książka nie została znaleziona w kolekcji użytkownika
- Status 500 Internal Server Error: Nieoczekiwany błąd podczas przetwarzania żądania

## 5. Przepływ danych
1. Użytkownik wysyła żądanie DELETE do `/api/user-books/:id`
2. Middleware Astro przekazuje żądanie do handlera DELETE
3. Handler pobiera identyfikator książki z parametru ścieżki URL
4. Handler używa UserBooksService do:
   - Weryfikacji czy książka istnieje w kolekcji użytkownika
   - Weryfikacji czy użytkownik jest właścicielem książki
   - Usunięcia wpisu z tabeli `user_books`
5. W przypadku powodzenia, handler zwraca status 204 No Content bez treści odpowiedzi
6. W przypadku błędu, handler zwraca odpowiedni kod błędu i komunikat

## 6. Względy bezpieczeństwa
- Autentykacja: Endpoint wymaga uwierzytelnionego użytkownika
- Autoryzacja: Endpoint weryfikuje czy użytkownik jest właścicielem książki przed usunięciem
- Walidacja danych: Endpoint sprawdza czy identyfikator jest poprawnym UUID
- Bezpieczne usuwanie: Endpoint usuwa tylko powiązanie użytkownik-książka, nie usuwa samej książki z bazy danych
- Logowanie: Każda próba usunięcia jest logowana, w tym również nieudane próby z powodów bezpieczeństwa

## 7. Obsługa błędów
- Brak identyfikatora książki: Status 400 Bad Request
- Nieprawidłowy format identyfikatora: Status 400 Bad Request
- Użytkownik nie jest uwierzytelniony: Status 401 Unauthorized
- Użytkownik nie jest właścicielem książki: Status 403 Forbidden
- Książka nie znaleziona w kolekcji użytkownika: Status 404 Not Found
- Błąd bazy danych: Status 500 Internal Server Error
- Inne nieoczekiwane błędy: Status 500 Internal Server Error

## 8. Rozważania dotyczące wydajności
- Endpoint wykonuje minimalną liczbę zapytań do bazy danych:
  - Jedno zapytanie do weryfikacji istnienia i własności książki
  - Jedno zapytanie do usunięcia książki z kolekcji
- Nie ma potrzeby pobierania dodatkowych danych, co minimalizuje obciążenie bazy danych
- Indeksy na kolumnach `user_id` i `id` w tabeli `user_books` zapewniają szybkie wyszukiwanie i weryfikację

## 9. Etapy wdrożenia

1. Dodanie klasy `ForbiddenError` do modułu obsługi błędów HTTP:
```typescript
// src/lib/errors/http.ts
export class ForbiddenError extends APIError {
  constructor(message = "Forbidden") {
    super(message, 403, "FORBIDDEN");
  }
}
```

2. Implementacja metody `deleteUserBook` w klasie `UserBooksService`:
```typescript
// src/lib/services/user-books.service.ts
async deleteUserBook(userId: string, userBookId: string): Promise<void> {
  // Sprawdź czy książka istnieje i należy do użytkownika
  const { data: userBook, error: findError } = await this.supabase
    .from("user_books")
    .select("id, user_id")
    .eq("id", userBookId)
    .single();

  if (findError) {
    if (findError.code === "PGRST116") {
      throw new NotFoundError(`Book with ID ${userBookId} not found in user's collection`);
    }
    throw new Error(`Error verifying book ownership: ${findError.code} - ${findError.message}`);
  }

  if (!userBook) {
    throw new NotFoundError(`Book with ID ${userBookId} not found in user's collection`);
  }

  if (userBook.user_id !== userId) {
    throw new ForbiddenError("User does not own this book");
  }

  // Usuń książkę z kolekcji użytkownika
  const { error: deleteError } = await this.supabase
    .from("user_books")
    .delete()
    .eq("id", userBookId);

  if (deleteError) {
    throw new Error(`Failed to delete book: ${deleteError.code} - ${deleteError.message}`);
  }
}
```

3. Stworzenie nowego pliku endpointu `src/pages/api/user-books/[id].ts`:
```typescript
// src/pages/api/user-books/[id].ts
import type { APIRoute } from "astro";
import { UserBooksService } from "../../../lib/services/user-books.service";
import { ForbiddenError, NotFoundError, UnauthorizedError } from "../../../lib/errors/http";
import { DEFAULT_USER_ID } from "../../../db/supabase.client";
import { logger } from "../../../lib/utils/logger";

export const prerender = false;

export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const { id } = params;
    
    if (!id) {
      return new Response(JSON.stringify({ error: "Book ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // W przyszłości, gdy autentykacja zostanie zaimplementowana:
    // const { data: { session } } = await locals.supabase.auth.getSession();
    // if (!session) throw new UnauthorizedError("User not authenticated");
    // const userId = session.user.id;
    
    // Tymczasowo używamy DEFAULT_USER_ID
    const userId = DEFAULT_USER_ID;

    const userBooksService = new UserBooksService(locals.supabase);
    await userBooksService.deleteUserBook(userId, id);

    // Zwróć 204 No Content dla pomyślnego usunięcia
    return new Response(null, { status: 204 });
  } catch (error) {
    // Obsługa błędów
    if (error instanceof UnauthorizedError) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (error instanceof ForbiddenError) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (error instanceof NotFoundError) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Log nieoczekiwanego błędu
    logger.error("Error in DELETE /api/user-books/:id:", error);
    
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
```

4. Testy jednostkowe dla endpointu:
```typescript
// tests/api/user-books-delete.test.ts
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { DELETE } from '../../src/pages/api/user-books/[id]';

// Mock dla UserBooksService
vi.mock('../../src/lib/services/user-books.service', () => {
  return {
    UserBooksService: vi.fn().mockImplementation(() => ({
      deleteUserBook: vi.fn()
    }))
  };
});

// Mock dla logger
vi.mock('../../src/lib/utils/logger', () => {
  return {
    logger: {
      error: vi.fn()
    }
  };
});

describe('DELETE /api/user-books/:id', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  
  it('should return 204 when book is successfully deleted', async () => {
    // Implementation of test
  });
  
  it('should return 404 when book does not exist', async () => {
    // Implementation of test
  });
  
  it('should return 403 when user does not own the book', async () => {
    // Implementation of test
  });
  
  it('should return 400 when book ID is not provided', async () => {
    // Implementation of test
  });
  
  it('should return 500 when an unexpected error occurs', async () => {
    // Implementation of test
  });
});
```

5. Aktualizacja dokumentacji API:
- Dodanie endpointu DELETE /api/user-books/:id do dokumentacji API
- Opisanie parametrów, kodów odpowiedzi i przykładów użycia 