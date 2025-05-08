# API Endpoint Implementation Plan: PUT /api/user-books/:id

## 1. Przegląd punktu końcowego
Endpoint służy do aktualizacji statusu książki w kolekcji użytkownika, wraz z opcjonalną oceną (rating). Pozwala użytkownikowi na zmianę statusu książki (np. z "to_read" na "read") oraz dodanie/aktualizację oceny książki, jeśli status to "read".

## 2. Szczegóły żądania
- Metoda HTTP: PUT
- Struktura URL: `/api/user-books/:id`
- Parametry ścieżki:
  - `id` (UUID): Identyfikator rekordu książki w kolekcji użytkownika (`user_books.id`)
- Request Body:
  ```typescript
  {
    status: string; // "read", "to_read", lub "rejected"
    rating?: boolean; // Wymagane, jeśli status to "read"
  }
  ```

## 3. Wykorzystywane typy
```typescript
// Schema dla walidacji danych wejściowych
export const updateUserBookSchema = z
  .object({
    status: z.enum([UserBookStatus.READ, UserBookStatus.TO_READ, UserBookStatus.REJECTED]),
    rating: z.boolean().nullable().optional(),
  })
  .refine(
    (data) => {
      if (data.status === UserBookStatus.READ && data.rating === undefined) {
        return false;
      }
      return true;
    },
    {
      message: "Rating is required when status is 'read'",
      path: ["rating"],
    }
  );

export type UpdateUserBookSchemaType = z.infer<typeof updateUserBookSchema>;

// DTO zgodne z typem z types.ts
// Wykorzystanie istniejącego typu UpdateUserBookDto z types.ts
```

## 4. Szczegóły odpowiedzi
- Status 200 OK:
  ```typescript
  {
    id: string;
    book_id: string;
    title: string;
    language: string;
    authors: [
      {
        id: string;
        name: string;
      }
    ];
    status: string;
    is_recommended: boolean;
    rating: boolean | null;
    recommendation_id: string | null;
    created_at: string;
    updated_at: string;
  }
  ```
- Status 400 Bad Request: Nieprawidłowe dane wejściowe
- Status 401 Unauthorized: Użytkownik nie jest uwierzytelniony
- Status 403 Forbidden: Użytkownik nie jest właścicielem tej książki
- Status 404 Not Found: Książka nie została znaleziona w kolekcji użytkownika

## 5. Przepływ danych
1. Przyjęcie żądania PUT z identyfikatorem książki użytkownika i danymi do aktualizacji
2. Walidacja danych wejściowych przy użyciu schematu Zod
3. Weryfikacja istnienia rekordu książki i uprawnień użytkownika
4. Aktualizacja rekordu w tabeli `user_books`
5. Pobranie zaktualizowanych danych z bazy, wraz z powiązanymi autorami
6. Transformacja danych do formatu DTO
7. Zwrócenie odpowiedzi z zaktualizowanymi danymi

## 6. Względy bezpieczeństwa
- Weryfikacja, czy użytkownik jest właścicielem książki (porównanie `user_id` z ID zalogowanego użytkownika)
- Walidacja danych wejściowych przy użyciu schematu Zod
- Obsługa błędów bez ujawniania szczegółów technicznych
- Weryfikacja poprawności UUID identyfikatora książki

## 7. Obsługa błędów
- 400 Bad Request:
  - Nieprawidłowy format danych wejściowych
  - Brak wymaganego pola `rating` dla statusu "read"
  - Nieprawidłowy format UUID
- 401 Unauthorized:
  - Użytkownik nie jest uwierzytelniony
- 403 Forbidden:
  - Użytkownik próbuje zaktualizować książkę należącą do innego użytkownika
- 404 Not Found:
  - Książka o podanym identyfikatorze nie istnieje w kolekcji użytkownika
- 500 Internal Server Error:
  - Nieoczekiwane błędy serwera lub bazy danych

## 8. Rozważania dotyczące wydajności
- Wykorzystanie pojedynczego zapytania do aktualizacji i pobrania danych za pomocą `update().select()`
- Używanie przygotowanych zapytań (query building) dla zwiększenia bezpieczeństwa i wydajności
- Ograniczenie liczby zapytań do bazy danych

## 9. Etapy wdrożenia

### 1. Dodanie schematu walidacji
1. Uzupełnić plik `src/lib/schemas/user-books.schema.ts` o schemat `updateUserBookSchema`

### 2. Rozbudowa UserBooksService
1. Dodać metodę `updateUserBook` w `src/lib/services/user-books.service.ts`, która:
   - Weryfikuje istnienie książki użytkownika
   - Sprawdza uprawnienia użytkownika
   - Aktualizuje rekord w bazie danych
   - Zwraca zaktualizowane dane

```typescript
async updateUserBook(
  userId: string, 
  userBookId: string, 
  data: UpdateUserBookSchemaType
): Promise<UserBookResponseDto> {
  // Implementacja aktualizacji
}
```

### 3. Implementacja API endpoint
1. Utworzyć plik `src/pages/api/user-books/[id].ts` z obsługą metody PUT:
   - Odebranie i parsowanie żądania
   - Walidacja danych wejściowych
   - Wywołanie serwisu
   - Obsługa błędów
   - Zwrócenie odpowiedzi