# API Endpoint Implementation Plan: POST /api/preferences

## 1. Przegląd punktu końcowego
Endpoint służy do tworzenia preferencji czytelniczych dla nowego użytkownika. Każdy użytkownik może mieć tylko jeden zestaw preferencji. Endpoint wymaga uwierzytelnienia i zwraca utworzone preferencje wraz z metadanymi.

## 2. Szczegóły żądania
- Metoda HTTP: POST
- Struktura URL: `/api/preferences`
- Headers:
  - `Authorization`: Bearer token (Supabase)
  - `Content-Type`: application/json
- Request Body:
  ```typescript
  {
    reading_preferences: string;   // max 1000 znaków
    preferred_language: string;    // kod języka
  }
  ```

## 3. Wykorzystywane typy
```typescript
// src/types.ts - już zdefiniowane
interface CreateUserPreferencesDto {
  reading_preferences: string;
  preferred_language: string;
}

type UserPreferencesResponseDto = Tables<"user_preferences">;

// Nowe typy do zdefiniowania
// src/lib/schemas/preferences.schema.ts
const createPreferencesSchema = z.object({
  reading_preferences: z.string().max(1000),
  preferred_language: z.string().min(2)
});
```

## 4. Szczegóły odpowiedzi
Sukces (201 Created):
```typescript
{
  id: string;              // UUID
  user_id: string;         // UUID
  reading_preferences: string;
  preferred_language: string;
  created_at: string;      // ISO timestamp
  updated_at: string;      // ISO timestamp
}
```

Błędy:
- 400: Nieprawidłowe dane wejściowe
- 401: Brak uwierzytelnienia
- 409: Preferencje już istnieją
- 500: Błąd serwera

## 5. Przepływ danych
1. Walidacja żądania HTTP i uwierzytelnienia
2. Parsowanie i walidacja body żądania przez Zod
3. Pobranie user_id z kontekstu Supabase
4. Sprawdzenie czy użytkownik ma już preferencje
5. Utworzenie nowych preferencji w bazie
6. Zwrócenie utworzonych preferencji

## 6. Względy bezpieczeństwa
1. Uwierzytelnianie:
   - Wykorzystanie Supabase Auth
   - Weryfikacja tokena w middleware
   - Dostęp tylko do własnych preferencji

2. Walidacja danych:
   - Sanityzacja inputu
   - Ścisła walidacja typów przez Zod
   - Ograniczenie długości pól

3. Bezpieczeństwo bazy danych:
   - Wykorzystanie Row Level Security (RLS)
   - Prepared statements przez Supabase SDK
   - Walidacja foreign keys

## 7. Obsługa błędów
1. Walidacja wejścia:
   ```typescript
   if (!createPreferencesSchema.safeParse(input).success) {
     throw new BadRequestError('Invalid input data');
   }
   ```

2. Konflikt preferencji:
   ```typescript
   if (await preferencesExist(userId)) {
     throw new ConflictError('Preferences already exist');
   }
   ```

3. Błędy bazy danych:
   - Obsługa duplikatów
   - Obsługa błędów połączenia
   - Obsługa błędów transakcji

## 8. Rozważania dotyczące wydajności
1. Indeksy bazy danych:
   - Indeks na user_id w tabeli user_preferences
   - Unique constraint na user_id

2. Cachowanie:
   - Możliwość cachowania preferencji na poziomie aplikacji
   - Invalidacja cache przy aktualizacji

3. Optymalizacja zapytań:
   - Pojedyncze zapytanie do bazy
   - Wykorzystanie transakcji gdzie potrzebne

## 9. Etapy wdrożenia

### 1. Przygotowanie struktury
```typescript
// src/lib/services/preferences.service.ts
export class PreferencesService {
  constructor(private supabase: SupabaseClient) {}
  
  async createPreferences(userId: string, data: CreateUserPreferencesDto): Promise<UserPreferencesResponseDto>;
  async getPreferences(userId: string): Promise<UserPreferencesResponseDto | null>;
}

// src/lib/schemas/preferences.schema.ts
export const createPreferencesSchema = z.object({...});
```

### 2. Implementacja endpointu
```typescript
// src/pages/api/preferences.ts
export const POST: APIRoute = async ({ request, locals }) => {
  const supabase = locals.supabase;
  const preferencesService = new PreferencesService(supabase);
  
  // Implementation...
};
```

### 3. Implementacja walidacji
1. Utworzenie schematów Zod
2. Dodanie middleware walidacji
3. Implementacja obsługi błędów

### 4. Implementacja serwisu
1. Metoda sprawdzania istniejących preferencji
2. Metoda tworzenia preferencji
3. Obsługa błędów i wyjątków