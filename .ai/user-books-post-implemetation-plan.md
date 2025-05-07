# API Endpoint Implementation Plan: POST /api/user-books

## 1. Przegląd punktu końcowego
Endpoint POST /api/user-books umożliwia dodanie książki do kolekcji użytkownika. Może to być nowa książka wprowadzona przez użytkownika lub książka pochodząca z wcześniejszej rekomendacji. Endpoint obsługuje zarówno utworzenie nowego rekordu książki w bazie danych (jeśli książka nie istnieje), jak i dodanie istniejącej książki do kolekcji użytkownika.

## 2. Szczegóły żądania
- Metoda HTTP: POST
- Struktura URL: /api/user-books
- Parametry zapytania: brak
- Request Body:
  ```json
  {
    "book": {
      "title": "string",
      "language": "string",
      "authors": [
        {
          "name": "string"
        }
      ]
    },
    "status": "string", // "read", "to_read", lub "rejected"
    "rating": "boolean", // Wymagane tylko gdy status to "read"
    "recommendation_id": "uuid" // Opcjonalne, jeśli dodawanie z rekomendacji
  }
  ```

## 3. Wykorzystywane typy
```typescript
// DTO dla walidacji żądania
export const createUserBookSchema = z.object({
  book: z.object({
    title: z.string().min(1).max(255),
    language: z.string().min(2).max(50),
    authors: z.array(
      z.object({
        name: z.string().min(1).max(255),
      })
    ).min(1),
  }),
  status: z.enum([UserBookStatus.READ, UserBookStatus.TO_READ, UserBookStatus.REJECTED]),
  rating: z.boolean().nullable().optional(),
  recommendation_id: z.string().uuid().nullable().optional(),
}).refine(
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

export type CreateUserBookDto = z.infer<typeof createUserBookSchema>;

// Typ zwracany przez service
export interface UserBookResponseDto {
  id: string;
  book_id: string;
  title: string;
  language: string;
  authors: AuthorDto[];
  status: UserBookStatus;
  is_recommended: boolean;
  rating: boolean | null;
  recommendation_id: string | null;
  created_at: string;
  updated_at: string;
}
```

## 4. Szczegóły odpowiedzi
- Status 201 Created (sukces):
  ```json
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
  ```
- Status 400 Bad Request: Nieprawidłowe dane wejściowe lub brakujące wymagane pola
- Status 401 Unauthorized: Użytkownik niezalogowany
- Status 409 Conflict: Książka już istnieje w kolekcji użytkownika

## 5. Przepływ danych
1. **Walidacja żądania**:
   - Sprawdzenie czy wszystkie wymagane pola są obecne
   - Walidacja formatu UUID dla recommendation_id (jeśli podane)
   - Walidacja czy rating jest podany, gdy status to "read"

2. **Sprawdzenie istnienia książki**:
   - Sprawdzenie czy książka o podanym tytule i autorach już istnieje w bazie danych
   - Jeśli istnieje, użyj jej ID dla tworzenia user_book
   - Jeśli nie istnieje, utwórz nową książkę

3. **Sprawdzenie istnienia autorów**:
   - Dla każdego autora sprawdź czy istnieje w bazie danych
   - Jeśli istnieje, użyj jego ID
   - Jeśli nie istnieje, utwórz nowego autora

4. **Sprawdzenie unikalności w kolekcji użytkownika**:
   - Sprawdzenie czy użytkownik nie ma już tej książki w swojej kolekcji
   - Jeśli ma, zwróć błąd 409 Conflict

5. **Sprawdzenie istnienia rekomendacji (opcjonalne)**:
   - Jeśli podano recommendation_id, sprawdź czy taka rekomendacja istnieje
   - Jeśli istnieje, ustaw is_recommended na true
   - Jeśli nie istnieje, zwróć błąd 400 Bad Request

6. **Utworzenie rekordu user_book**:
   - Wykorzystanie transakcji SQL dla zapewnienia atomowości operacji
   - Utworzenie rekordu w tabeli user_books
   - Ustawienie is_recommended na podstawie podanego recommendation_id

7. **Przygotowanie odpowiedzi**:
   - Pobranie utworzonego rekordu wraz z relacjami
   - Transformacja danych do formatu UserBookResponseDto

## 6. Względy bezpieczeństwa
1. **Uwierzytelnianie**:
   - Wykorzystanie middleware Supabase do sprawdzania sesji użytkownika
   - Odrzucenie żądań od niezalogowanych użytkowników (401 Unauthorized)

2. **Autoryzacja**:
   - Zapewnienie, że użytkownik może dodawać książki tylko do własnej kolekcji
   - Użycie ID użytkownika z kontekstu sesji (nie z żądania)

3. **Walidacja danych**:
   - Dokładne sprawdzenie typów, długości i wartości pól
   - Oczyszczanie danych wejściowych z potencjalnie niebezpiecznych znaków
   - Weryfikacja czy recommendation_id należy do zalogowanego użytkownika

4. **Limity i zabezpieczenia**:
   - Walidacja maksymalnej długości pól tekstowych zgodnie z ograniczeniami bazy danych

## 7. Obsługa błędów
1. **Błędy walidacji (400 Bad Request)**:
   - Nieprawidłowe formaty danych
   - Brakujące wymagane pola
   - Przekroczenie limitów długości pól
   - Nieprawidłowy recommendation_id
   - Brak ratingu dla przeczytanych książek

2. **Błędy autoryzacji (401 Unauthorized)**:
   - Brak ważnej sesji użytkownika
   - Wygaśnięcie sesji użytkownika

3. **Błędy konfliktu (409 Conflict)**:
   - Książka już istnieje w kolekcji użytkownika

4. **Błędy serwera (500 Internal Server Error)**:
   - Problemy z połączeniem do bazy danych
   - Nieoczekiwane błędy w trakcie przetwarzania
   - Błędy transakcji bazodanowych

## 8. Rozważania dotyczące wydajności
1. **Optymalizacja bazy danych**:
   - Indeksy na book_id, user_id i recommendation_id w tabeli user_books
   - Indeksy na name w tabeli authors dla szybkiego wyszukiwania istniejących autorów
   - Indeksy na title w tabeli books dla szybkiego wyszukiwania istniejących książek

2. **Optymalizacja przetwarzania**:
   - Wykorzystanie transakcji dla operacji na wielu tabelach
   - Wykonanie jednego zapytania do bazy danych zamiast wielu mniejszych, gdy to możliwe
   - Optymalne wykorzystanie relacji w zapytaniach

3. **Obsługa równoległych żądań**:
   - Unikanie deadlocków przy równoległym przetwarzaniu żądań
   - Właściwa izolacja transakcji

## 9. Etapy wdrożenia
1. **Zdefiniowanie schematu walidacji**:
   - Dodanie createUserBookSchema w src/lib/schemas/user-books.schema.ts
   - Implementacja reguł walidacji, w tym uzależnienie wymagalności rating od statusu

2. **Implementacja funkcji serwisowych**:
   - Dodanie funkcji createUserBook w src/lib/services/user-books.service.ts
   - Implementacja logiki transakcyjnej do tworzenia/dodawania książek i autorów
   - Implementacja metody sprawdzającej duplikaty w kolekcji użytkownika

3. **Implementacja handlera endpointu**:
   - Dodanie obsługi metody POST w src/pages/api/user-books.ts
   - Implementacja middleware do uwierzytelniania użytkownika
   - Obsługa walidacji danych wejściowych
   - Obsługa błędów i przygotowanie odpowiedzi

4. **Implementacja pomocniczych funkcji**:
   - Funkcja findOrCreateBook do wyszukiwania lub tworzenia książek
   - Funkcja findOrCreateAuthor do wyszukiwania lub tworzenia autorów
   - Funkcja handleCreateUserBook do zarządzania transakcją

5. **Implementacja zapytań bazodanowych**:
   - Zapytanie sprawdzające czy książka o podanym tytule i autorach już istnieje
   - Zapytanie sprawdzające czy książka już istnieje w kolekcji użytkownika
   - Zapytanie tworzące nowe rekordy książek i autorów w razie potrzeby
   - Zapytanie tworzące relację książka-autor w tabeli book_authors
   - Zapytanie tworzące rekord w tabeli user_books

6. **Testowanie**:
   - Testy jednostkowe dla funkcji serwisowych
   - Testy integracyjne dla całego endpointu
   - Testy wydajnościowe dla operacji bazodanowych
   - Testy bezpieczeństwa (np. próby ataków injection)

7. **Dokumentacja**:
   - Aktualizacja dokumentacji API z przykładami żądań i odpowiedzi
   - Dodanie komentarzy JSDoc do kodu
   - Przygotowanie przykładów użycia dla frontendu

8. **Wdrożenie**:
   - Przegląd kodu przez zespół
   - Testy na środowisku testowym
   - Wdrożenie na produkcję z monitorowaniem logów dla wykrycia potencjalnych problemów 