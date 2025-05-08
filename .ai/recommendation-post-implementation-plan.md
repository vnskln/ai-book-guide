# API Endpoint Implementation Plan: POST /api/recommendations

## 1. Przegląd punktu końcowego
Endpoint `/api/recommendations` służy do generowania nowych rekomendacji książek z wykorzystaniem sztucznej inteligencji. Po wysłaniu żądania POST system analizuje preferencje czytelnicze użytkownika, generuje rekomendację książki i zwraca szczegółowe informacje o zalecanej książce, w tym podsumowanie fabuły i uzasadnienie rekomendacji.

## 2. Szczegóły żądania
- Metoda HTTP: POST
- Struktura URL: `/api/recommendations`
- Parametry: Brak parametrów URL
- Request Body: Brak dodatkowego ciała żądania, ponieważ system wykorzystuje istniejące preferencje i listy przeczytanych książek użytkownika

## 3. Wykorzystywane typy
```typescript
// Recommendation DTO dla odpowiedzi
export interface RecommendationResponseDto {
  id: string;
  book: {
    id: string;
    title: string;
    language: string;
    authors: AuthorDto[];
  };
  plot_summary: string;
  rationale: string;
  ai_model: string;
  execution_time: number;
  status: RecommendationStatus;
  created_at: string;
  updated_at?: string;
}

// Schemat walidacji dla odpowiedzi
export const recommendationResponseSchema = z.object({
  id: z.string().uuid(),
  book: z.object({
    id: z.string().uuid(),
    title: z.string(),
    language: z.string(),
    authors: z.array(
      z.object({
        id: z.string().uuid(),
        name: z.string(),
      })
    ),
  }),
  plot_summary: z.string(),
  rationale: z.string(),
  ai_model: z.string(),
  execution_time: z.number(),
  status: z.enum([
    RecommendationStatus.PENDING,
    RecommendationStatus.ACCEPTED,
    RecommendationStatus.REJECTED,
  ]),
  created_at: z.string(),
  updated_at: z.string().optional(),
});

// TooManyRequestsError - nowy typ błędu
export class TooManyRequestsError extends APIError {
  constructor(message = "Too Many Requests") {
    super(message, 429, "TOO_MANY_REQUESTS");
  }
}
```

## 4. Szczegóły odpowiedzi
- Format: JSON
- Status 201 Created:
  ```json
  {
    "id": "uuid",
    "book": {
      "id": "uuid",
      "title": "string",
      "language": "string",
      "authors": [
        {
          "id": "uuid",
          "name": "string"
        }
      ]
    },
    "plot_summary": "string",
    "rationale": "string",
    "ai_model": "string",
    "execution_time": "number",
    "status": "string",
    "created_at": "timestamp"
  }
  ```
- Kody błędów:
  - 401 Unauthorized: User not authenticated
  - 500 Internal Server Error: Nieoczekiwany błąd serwera

## 5. Przepływ danych
1. Endpoint odbiera żądanie POST.
2. Sprawdza uwierzytelnienie użytkownika.
3. Pobiera preferencje użytkownika z bazy danych.
4. Pobiera listę przeczytanych książek użytkownika z bazy.
5. Tworzy listę książek przeczytanych.
6. Tworzy listę książek odrzuconych.
7. Generuje rekomendację książki za pomocą AI:
   - Tworzy prompt na podstawie preferencji użytkownika, listy książek przeczytanych i listy książek odrzuconych.
   - Wywołuje zewnętrzne API AI (OpenRouter.ai).
   - Parsuje odpowiedź z modelu AI.
8. Zapisuje nową książkę i autorów w bazie danych (jeśli nie istnieją).
9. Tworzy nowy wpis rekomendacji w tabeli `recommendations`.
10. Zwraca kompletną odpowiedź z danymi rekomendacji.

## 6. Względy bezpieczeństwa
1. **Uwierzytelnianie**:
   - Użyj middleware Supabase do weryfikacji tokenu sesji.
   - Sprawdź, czy użytkownik jest zalogowany przed generowaniem rekomendacji.

2. **Walidacja danych**:
   - Waliduj dane wyjściowe z modelu AI przed zapisaniem do bazy danych.
   - Ogranicz długość tekstów generowanych przez AI (podsumowanie fabuły, uzasadnienie).

3. **Klucze API**:
   - Bezpieczne przechowywanie kluczy API do usług zewnętrznych (OpenRouter.ai).
   - Użyj zmiennych środowiskowych i nie ujawniaj kluczy w kodzie.

## 7. Obsługa błędów
1. **Błędy uwierzytelniania**:
   - Status 401 Unauthorized - użytkownik nie jest uwierzytelniony.

2. **Błędy zewnętrznych API**:
   - Obsługa timeout'ów i błędów modelu AI.
   - Zapewnienie odpowiednich komunikatów błędów.

3. **Błędy bazy danych**:
   - Obsługa błędów podczas zapisu do bazy danych.
   - Spójne logowanie błędów dla późniejszej analizy.

4. **Nieoczekiwane błędy**:
   - Status 500 Internal Server Error dla wszystkich nieobsłużonych wyjątków.
   - Szczegółowe logowanie błędów bez ujawniania szczegółów technicznych użytkownikowi.

## 8. Etapy wdrożenia
1. **Stworzenie nowych plików**:
   - `src/lib/schemas/recommendations.schema.ts` - schematy walidacji
   - `src/lib/services/recommendations.service.ts` - warstwa usług
   - `src/lib/services/ai.service.ts` - usługa integracji z AI
   - `src/pages/api/recommendations.ts` - endpoint API

2. **Implementacja schematu walidacji**:
   - Implementacja schematów walidacji w `recommendations.schema.ts`

3. **Implementacja usługi AI**:
   - Implementacja integracji z OpenRouter.ai
   - Obsługa tworzenia promptów, parsowania odpowiedzi i obsługi błędów

4. **Implementacja usługi rekomendacji**:
   - Logika biznesowa do obsługi rekomendacji
   - Interakcja z bazą danych i usługą AI

5. **Implementacja endpointu API**:
   - Obsługa żądania POST
   - Uwierzytelnianie użytkownika
   - Wywołanie usługi rekomendacji
   - Obsługa odpowiedzi i błędów