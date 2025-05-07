# API Endpoint Implementation Plan: PUT /api/preferences

## 1. Przegląd punktu końcowego
Endpoint służy do aktualizacji preferencji czytelniczych bieżącego użytkownika. Umożliwia zmianę preferowanego języka i preferencji dotyczących czytania. Dane są walidowane, a następnie zapisywane w tabeli `user_preferences` w bazie danych Supabase.

## 2. Szczegóły żądania
- Metoda HTTP: PUT
- Struktura URL: `/api/preferences`
- Parametry URL: brak
- Request Body:
  ```json
  {
    "reading_preferences": "string", // Max 1000 znaków
    "preferred_language": "string"   // Min 2 znaki
  }
  ```

## 3. Wykorzystywane typy
```typescript
// Istniejące typy z src/types.ts
import type { UpdateUserPreferencesDto, UserPreferencesResponseDto } from "../../types";

// Schemat walidacji Zod
import { z } from "zod";
export const updatePreferencesSchema = z.object({
  reading_preferences: z.string().max(1000, "Reading preferences cannot exceed 1000 characters"),
  preferred_language: z.string().min(2, "Language code must be at least 2 characters"),
});
```

## 4. Szczegóły odpowiedzi
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "reading_preferences": "string",
  "preferred_language": "string",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

**Kody statusu:**
- 200 OK: Preferencje zaktualizowane pomyślnie
- 400 Bad Request: Nieprawidłowe dane wejściowe
- 401 Unauthorized: Użytkownik niezalogowany
- 404 Not Found: Preferencje nie znalezione dla tego użytkownika
- 500 Internal Server Error: Błąd serwera lub bazy danych

## 5. Przepływ danych
1. Żądanie PUT przychodzi na `/api/preferences`
2. Middleware uwierzytelniania weryfikuje sesję użytkownika
3. Middleware walidacji weryfikuje format danych wejściowych
4. Dane są przekazywane do `PreferencesService`
5. Serwis sprawdza, czy preferencje istnieją dla danego użytkownika
6. Jeśli istnieją, aktualizuje je w bazie danych
7. Jeśli nie istnieją, zwraca błąd 404
8. Zaktualizowane preferencje są zwracane jako odpowiedź

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie**: Wymaga aktywnej sesji użytkownika
- **Autoryzacja**: Użytkownik może aktualizować tylko własne preferencje
- **Walidacja danych**: Dane wejściowe są walidowane przy użyciu Zod:
  - `reading_preferences`: Maksymalna długość 1000 znaków
  - `preferred_language`: Minimalna długość 2 znaki
- **Sanityzacja danych**: Dane są bezpiecznie przesyłane do bazy Supabase

## 7. Obsługa błędów
- **400 Bad Request**: 
  - Nieprawidłowy format JSON
  - Brakujące wymagane pola
  - Nieprawidłowa długość pól
- **401 Unauthorized**:
  - Brak tokenu sesji
  - Nieważny token sesji
- **404 Not Found**:
  - Preferencje nie zostały wcześniej utworzone dla tego użytkownika
- **500 Internal Server Error**:
  - Błąd połączenia z bazą danych
  - Nieoczekiwany błąd serwera

## 8. Rozważania dotyczące wydajności
- Reużycie istniejących schematów walidacji
- Ograniczenie rozmiarów pól wejściowych
- Optymalizacja zapytań do bazy danych (jeden upsert zamiast select + update)
- Wykorzystanie cache w przypadku częstych odczytów preferencji użytkownika

## 9. Etapy wdrożenia
1. **Dodanie schematu walidacji**: Rozszerzenie istniejącego schematu preferencji o aktualizację
   ```typescript
   // src/lib/schemas/preferences.schema.ts
   export const updatePreferencesSchema = z.object({
     reading_preferences: z.string().max(1000, "Reading preferences cannot exceed 1000 characters"),
     preferred_language: z.string().min(2, "Language code must be at least 2 characters"),
   });
   ```

2. **Rozszerzenie serwisu**: Dodanie metody do aktualizacji preferencji w `PreferencesService`
   ```typescript
   // src/lib/services/preferences.service.ts
   async updatePreferences(userId: string, data: UpdateUserPreferencesDto): Promise<UserPreferencesResponseDto> {
     const validationResult = updatePreferencesSchema.safeParse(data);
     if (!validationResult.success) {
       throw new BadRequestError("Invalid input data");
     }

     const existingPrefs = await this.getPreferences(userId);
     if (!existingPrefs) {
       throw new NotFoundError("Preferences not found for this user");
     }

     const { data: updatedPrefs, error } = await this.supabase
       .from("user_preferences")
       .update({ 
         ...data, 
         updated_at: new Date().toISOString() 
       })
       .eq("user_id", userId)
       .select()
       .single();

     if (error) {
       logger.error("Failed to update preferences", { error, userId });
       throw new Error(`Database error: ${error.message}`);
     }
     return updatedPrefs;
   }
   ```

3. **Implementacja endpointu PUT**: Dodanie obsługi metody PUT w pliku `src/pages/api/preferences.ts`
   ```typescript
   // src/pages/api/preferences.ts
   export const PUT: APIRoute = async ({ request, locals }) => {
     try {
       const typedLocals = locals as Locals;
       const supabase = typedLocals.supabase;
       const userId = typedLocals.user?.id || DEFAULT_USER_ID;

       // Validate request body
       const validatedBody = await validateRequest(request, updatePreferencesSchema);
       logger.info("Received valid preferences update request", { userId });

       // Update preferences using service
       const preferencesService = new PreferencesService(supabase);
       const preferences = await preferencesService.updatePreferences(userId, validatedBody);

       logger.info("Preferences updated successfully", { userId, preferencesId: preferences.id });
       return new Response(JSON.stringify(preferences), {
         status: 200,
         headers: {
           "Content-Type": "application/json",
         },
       });
     } catch (error: unknown) {
       if (error instanceof Response) {
         return error;
       }

       // Handle known errors
       if (error instanceof APIError) {
         logger.warn("API error in preferences update", {
           code: error.code,
           message: error.message,
           statusCode: error.statusCode,
         });
         return new Response(
           JSON.stringify({
             error: {
               message: error.message,
               code: error.code,
             },
           }),
           {
             status: error.statusCode,
             headers: {
               "Content-Type": "application/json",
             },
           }
         );
       }

       // Handle unknown errors
       logger.error("Unexpected error in preferences update:", error);
       return new Response(
         JSON.stringify({
           error: {
             message: "Internal server error",
             code: "INTERNAL_SERVER_ERROR",
           },
         }),
         {
           status: 500,
           headers: {
             "Content-Type": "application/json",
           },
         }
       );
     }
   };
   ```

4. **Testy jednostkowe**: Dodanie testów dla nowej funkcjonalności
   ```typescript
   // src/lib/services/__tests__/preferences.service.test.ts
   describe('updatePreferences', () => {
     it('should update existing preferences', async () => {
       // Test implementation
     });

     it('should throw NotFoundError when preferences do not exist', async () => {
       // Test implementation
     });

     it('should throw BadRequestError on invalid input', async () => {
       // Test implementation
     });
   });
   ```

5. **Dokumentacja API**: Aktualizacja dokumentacji API o nowy endpoint
   ```markdown
   ### PUT /api/preferences
   Update user reading preferences.

   **Request Body:**
   ```json
   {
     "reading_preferences": "string",
     "preferred_language": "string"
   }
   ```

   **Response:**
   ```json
   {
     "id": "uuid",
     "user_id": "uuid",
     "reading_preferences": "string",
     "preferred_language": "string",
     "created_at": "timestamp",
     "updated_at": "timestamp"
   }
   ```
   ```

6. **Testy integracyjne**: Stworzenie testów zapewniających poprawną integrację wszystkich komponentów 