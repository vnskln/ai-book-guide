# API Endpoint Implementation Plan: GET /api/preferences

## 1. Przegląd punktu końcowego
Endpoint GET /api/preferences służy do pobierania preferencji czytelniczych zalogowanego użytkownika. Zwraca on informacje o preferencjach, takie jak preferowany język książek i ogólne preferencje czytelnicze.

## 2. Szczegóły żądania
- Metoda HTTP: GET
- Struktura URL: `/api/preferences`
- Parametry: Brak
- Headers:
  - Wymagane: Authorization (automatycznie obsługiwane przez middleware Supabase)

## 3. Wykorzystywane typy
```typescript
// Wykorzystamy istniejący typ z types.ts:
import type { UserPreferencesResponseDto } from '../../types';
```

## 4. Szczegóły odpowiedzi
- Kod 200 OK
  ```typescript
  {
    "id": "uuid",
    "user_id": "uuid",
    "reading_preferences": "string",
    "preferred_language": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
  ```
- Kod 401 Unauthorized: Użytkownik nie jest zalogowany
- Kod 404 Not Found: Preferencje nie zostały znalezione dla tego użytkownika
- Kod 500 Internal Server Error: Błąd serwera

## 5. Przepływ danych
1. Żądanie trafia do handlera endpointu `/api/preferences.ts`
2. Middleware Astro weryfikuje token JWT użytkownika
3. Handler pobiera ID użytkownika z kontekstu lokalnego Astro
4. Wywołanie serwisu `PreferencesService.getUserPreferences(userId)`
5. Zapytanie do bazy danych Supabase (tabela `user_preferences`)
6. Zwrócenie danych preferencji użytkownika lub odpowiedniego kodu błędu

## 6. Względy bezpieczeństwa
- Autentykacja: Middleware Supabase weryfikuje token JWT
- Autoryzacja: Endpoint zwraca tylko preferencje zalogowanego użytkownika
- Dane muszą być filtrowane po `user_id` aby zapewnić, że użytkownik ma dostęp tylko do swoich preferencji

## 7. Obsługa błędów
- 401 Unauthorized: Brak tokena JWT lub token wygasł
  ```typescript
  return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  ```
- 404 Not Found: Nie znaleziono preferencji dla użytkownika
  ```typescript
  return new Response(JSON.stringify({ error: 'Preferences not found' }), { status: 404 });
  ```
- 500 Internal Server Error: Błąd podczas zapytania do bazy danych
  ```typescript
  console.error('Error fetching user preferences:', error);
  return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  ```

## 8. Rozważania dotyczące wydajności
- Indeks na kolumnie `user_id` w tabeli `user_preferences` dla szybkiego wyszukiwania
- Zapytanie pobiera tylko niezbędne dane i nie wykonuje złożonych operacji JOIN

## 9. Etapy wdrożenia

### 1. Utworzenie serwisu dla preferencji użytkownika
Utwórz plik `src/lib/services/preferences.service.ts`:

```typescript
import type { SupabaseClient } from '../../db/supabase.client';
import type { UserPreferencesResponseDto } from '../../types';

export class PreferencesService {
  static async getUserPreferences(
    supabase: SupabaseClient, 
    userId: string
  ): Promise<UserPreferencesResponseDto | null> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user preferences:', error);
      throw error;
    }

    return data;
  }
}
```

### 2. Utworzenie endpointu

Utwórz plik `src/pages/api/preferences.ts`:

```typescript
import type { APIRoute } from 'astro';
import { PreferencesService } from '../../lib/services/preferences.service';

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
  // Check if user is authenticated
  const supabase = locals.supabase;
  const session = await locals.getSession();
  
  if (!session) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
      status: 401,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  try {
    const userId = session.user.id;
    const preferences = await PreferencesService.getUserPreferences(supabase, userId);
    
    if (!preferences) {
      return new Response(JSON.stringify({ error: 'Preferences not found' }), { 
        status: 404,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    return new Response(JSON.stringify(preferences), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in preferences endpoint:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
```

### 3. Dodanie testów jednostkowych

Utwórz testy dla serwisu preferencji użytkownika oraz dla endpointu.

### 4. Testowanie manualne endpointu

1. Utwórz konto użytkownika i zaloguj się
2. Utwórz preferencje dla użytkownika
3. Wywołaj endpoint GET /api/preferences
4. Sprawdź, czy odpowiedź zawiera poprawne dane

### 5. Dokumentacja API

Zaktualizuj dokumentację API, aby uwzględnić nowy endpoint. 