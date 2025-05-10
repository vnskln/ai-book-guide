# API Endpoint Implementation Plan: GET /api/recommendations

## 1. Przegląd punktu końcowego

Endpoint GET /api/recommendations służy do pobierania historii rekomendacji książek dla zalogowanego użytkownika. Pozwala na przeglądanie wygenerowanych przez AI rekomendacji, z możliwością filtrowania według statusu oraz paginacji wyników.

## 2. Szczegóły żądania

- **Metoda HTTP**: GET
- **Struktura URL**: `/api/recommendations`
- **Parametry**:
  - **Opcjonalne**:
    - `status` (string): Filtrowanie według statusu rekomendacji ('pending', 'accepted', 'rejected')
    - `page` (number, domyślnie 1): Numer strony do pobrania
    - `limit` (number, domyślnie 20): Limit wyników na stronę

## 3. Wykorzystywane typy

- **Z modułu `types.ts`**:
  - `RecommendationResponseDto`: Typ reprezentujący pojedynczą rekomendację w odpowiedzi
  - `RecommendationPaginatedResponseDto`: Typ reprezentujący paginowaną odpowiedź z rekomendacjami
  - `PaginationInfo`: Informacje o paginacji
  - `RecommendationStatus`: Enum z dostępnymi statusami rekomendacji

- **Schemat walidacji**:
  - `recommendationQuerySchema`: Nowy schemat Zod do walidacji parametrów zapytania
  - `recommendationResponseSchema`: Istniejący schemat dla pojedynczej rekomendacji
  - `paginatedRecommendationResponseSchema`: Nowy schemat dla paginowanej odpowiedzi

## 4. Szczegóły odpowiedzi

- **Kod statusu**: 200 OK (sukces)
- **Format**: JSON
- **Struktura**:
  ```json
  {
    "data": [
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

- **Kody błędów**:
  - 400 Bad Request: Nieprawidłowe parametry zapytania
  - 401 Unauthorized: Użytkownik nie jest zalogowany

## 5. Przepływ danych

1. Przychodzące żądanie GET na `/api/recommendations` trafia do handlera w `src/pages/api/recommendations.ts`
2. Parametry zapytania są ekstrahowane i walidowane za pomocą schematu Zod
3. Żądanie jest przekazywane do `RecommendationsService.getRecommendations()` z odpowiednimi parametrami
4. Serwis wykonuje zapytanie do bazy danych poprzez Supabase, pobierając rekomendacje dla aktualnego użytkownika
5. Wyniki są transformowane do formatu DTO i zwracane jako odpowiedź
6. Błędy są przechwytywane i odpowiednio obsługiwane

## 6. Względy bezpieczeństwa

- **Autentykacja**: Endpoint wymaga zalogowanego użytkownika (obsługa przez middleware Supabase)
- **Autoryzacja**: Dostęp tylko do rekomendacji przypisanych do zalogowanego użytkownika
- **Walidacja danych**: Parametry zapytania są walidowane przez schemat Zod przed przetwarzaniem
- **Sanityzacja danych**: Dane z bazy danych są przekształcane do bezpiecznego formatu DTO przed zwróceniem

## 7. Obsługa błędów

- **Błędy walidacji**: Zwraca kod 400 z opisem błędu
- **Błędy autentykacji**: Zwraca kod 401
- **Błędy serwera/bazy danych**: Zwraca kod 500 z ogólną informacją o błędzie
- **Rejestrowanie błędów**: Wszystkie błędy są logowane z użyciem istniejącego systemu logowania

## 8. Rozważania dotyczące wydajności

- **Paginacja**: Implementacja paginacji po stronie bazy danych dla efektywnego pobierania dużych zbiorów danych
- **Indeksy bazy danych**: Upewnienie się, że kolumny używane do filtrowania (`status`) oraz klucz obcy (`user_id`) są zindeksowane
- **Optymalizacja zapytań**: Używanie select z dokładnie tymi kolumnami, które są potrzebne
- **Cachowanie**: Możliwość dodania cachowania dla częstych zapytań w przyszłości

## 9. Etapy wdrożenia

1. **Rozszerzenie schematu walidacji**
   - Utworzenie `recommendationQuerySchema` w `src/lib/schemas/recommendations.schema.ts`
   - Utworzenie `paginatedRecommendationResponseSchema` dla walidacji odpowiedzi

2. **Implementacja metody serwisowej**
   - Dodanie metody `getRecommendations()` do klasy `RecommendationsService` w `src/lib/services/recommendations.service.ts`
   - Implementacja logiki pobierania danych z odpowiednią paginacją i filtrowaniem

3. **Implementacja endpointu API**
   - Dodanie handlera GET do istniejącego pliku `src/pages/api/recommendations.ts`
   - Implementacja walidacji parametrów zapytania
   - Integracja z serwisem rekomendacji

4. **Testowanie**
   - Napisanie testów jednostkowych dla nowej metody serwisowej
   - Napisanie testów integracyjnych dla endpointu API
   - Manualne testowanie z różnymi parametrami zapytania

5. **Dokumentacja**
   - Aktualizacja dokumentacji API
   - Dodanie komentarzy do kodu dla lepszej czytelności

## 10. Przykładowa implementacja

### Schemat walidacji (recommendations.schema.ts)

```typescript
// Dodać do istniejącego pliku src/lib/schemas/recommendations.schema.ts
import { z } from "zod";

export const recommendationQuerySchema = z.object({
  status: z.nativeEnum(RecommendationStatus).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().min(1).max(50).optional().default(20)
});

export const paginationInfoSchema = z.object({
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total_pages: z.number().int().nonnegative()
});

export const paginatedRecommendationResponseSchema = z.object({
  data: z.array(recommendationResponseSchema),
  pagination: paginationInfoSchema
});

export type RecommendationQuery = z.infer<typeof recommendationQuerySchema>;
```

### Metoda serwisowa (recommendations.service.ts)

```typescript
// Dodać do klasy RecommendationsService w src/lib/services/recommendations.service.ts

/**
 * Pobiera historię rekomendacji dla użytkownika z możliwością filtrowania i paginacji
 * @param userId ID użytkownika
 * @param status Opcjonalny status do filtrowania
 * @param page Numer strony (domyślnie 1)
 * @param limit Limit wyników na stronę (domyślnie 20)
 * @returns Paginowana lista rekomendacji
 */
public async getRecommendations(
  userId: string,
  status?: RecommendationStatus,
  page: number = 1,
  limit: number = 20
): Promise<RecommendationPaginatedResponseDto> {
  try {
    logger.info("Fetching recommendations", { userId, status, page, limit });
    
    // Ustalenie offsetu na podstawie strony i limitu
    const offset = (page - 1) * limit;
    
    // Budowa zapytania bazowego
    let query = this.supabase
      .from("recommendations")
      .select(`
        id,
        book:books!inner (
          id,
          title,
          language,
          authors:book_authors!inner (
            author:authors!inner (
              id,
              name
            )
          )
        ),
        plot_summary,
        rationale,
        ai_model,
        execution_time,
        status,
        created_at,
        updated_at,
        count() OVER() as total_count
      `, { count: 'exact' })
      .eq("user_id", userId)
      .order('created_at', { ascending: false });
    
    // Dodanie filtrowania po statusie, jeśli podano
    if (status) {
      query = query.eq("status", status);
    }
    
    // Dodanie paginacji
    query = query.range(offset, offset + limit - 1);
    
    // Wykonanie zapytania
    const { data, error, count } = await query;
    
    if (error) {
      logger.error("Error fetching recommendations", {
        error: error.message,
        details: error.details,
        hint: error.hint,
        userId,
        status,
        page,
        limit
      });
      throw new Error(`Failed to fetch recommendations: ${error.message}`);
    }
    
    // Jeśli brak danych, zwróć pustą listę
    if (!data || data.length === 0) {
      logger.info("No recommendations found", { userId, status, page, limit });
      return {
        data: [],
        pagination: {
          total: 0,
          page,
          limit,
          total_pages: 0
        }
      };
    }
    
    // Obliczenie liczby stron
    const total = count || 0;
    const total_pages = Math.ceil(total / limit);
    
    // Transformacja danych do odpowiedniego formatu DTO
    const recommendations = data.map((rec) => ({
      id: rec.id,
      book: {
        id: rec.book.id,
        title: rec.book.title,
        language: rec.book.language,
        authors: rec.book.authors.map((ba: BookAuthor) => ({
          id: ba.author.id,
          name: ba.author.name,
        })),
      },
      plot_summary: rec.plot_summary,
      rationale: rec.rationale,
      ai_model: rec.ai_model,
      execution_time: parseExecutionTime(rec.execution_time),
      status: rec.status,
      created_at: new Date(rec.created_at).toISOString(),
      updated_at: rec.updated_at ? new Date(rec.updated_at).toISOString() : undefined,
    }));
    
    logger.info("Recommendations fetched successfully", {
      userId,
      status,
      page,
      limit,
      total,
      count: recommendations.length
    });
    
    // Zwrócenie paginowanej odpowiedzi
    return {
      data: recommendations,
      pagination: {
        total,
        page,
        limit,
        total_pages
      }
    };
  } catch (error) {
    logger.error("Error in getRecommendations", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      userId,
      status,
      page,
      limit
    });
    throw error;
  }
}
```

### Endpoint API (recommendations.ts)

```typescript
// Dodać do istniejącego pliku src/pages/api/recommendations.ts

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    // Pobranie i walidacja parametrów zapytania
    const url = new URL(request.url);
    const params = {
      status: url.searchParams.get("status"),
      page: url.searchParams.get("page"),
      limit: url.searchParams.get("limit")
    };
    
    // Walidacja parametrów za pomocą schematu Zod
    const result = recommendationQuerySchema.safeParse({
      status: params.status,
      page: params.page ? parseInt(params.page) : undefined,
      limit: params.limit ? parseInt(params.limit) : undefined
    });
    
    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid query parameters",
          details: result.error.format()
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }
    
    const { status, page, limit } = result.data;
    
    // Pobranie identyfikatora zalogowanego użytkownika
    // W rzeczywistej implementacji, prawdopodobnie użyjemy locals.supabase.auth.getUser()
    // dla uproszczenia, używamy domyślnego użytkownika w wersji demonstracyjnej
    const userId = DEFAULT_USER_ID;
    
    // Inicjalizacja serwisu i pobranie rekomendacji
    const recommendationsService = new RecommendationsService(locals.supabase);
    const recommendations = await recommendationsService.getRecommendations(
      userId,
      status,
      page,
      limit
    );
    
    // Walidacja odpowiedzi (opcjonalnie)
    const validatedResponse = paginatedRecommendationResponseSchema.parse(recommendations);
    
    // Zwrócenie odpowiedzi
    return new Response(JSON.stringify(validatedResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    
    return new Response(
      JSON.stringify({
        error: "Failed to fetch recommendations",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  }
}; 