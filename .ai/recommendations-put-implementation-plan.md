# API Endpoint Implementation Plan: PUT /api/recommendations/:id

## 1. Przegląd punktu końcowego
Ten endpoint pozwala użytkownikowi zaktualizować status rekomendacji książkowej, zmieniając go na "accepted" lub "rejected". Po udanej aktualizacji, endpoint zwraca kompletne dane rekomendacji wraz z powiązanymi danymi książki i autorów.

## 2. Szczegóły żądania
- Metoda HTTP: PUT
- Struktura URL: `/api/recommendations/:id`
- Parametry:
  - Wymagane: `id` (UUID rekomendacji w ścieżce URL)
  - Opcjonalne: brak
- Request Body:
  ```json
  {
    "status": "string" // Wymagane: "accepted" lub "rejected"
  }
  ```

## 3. Wykorzystywane typy
- **RecommendationResponseDto** - Istniejący typ dla odpowiedzi rekomendacji (src/types.ts)
- **RecommendationStatus** - Istniejący enum dla statusów rekomendacji (src/types.ts)
- **UpdateRecommendationStatusDto** - Nowy typ DTO dla aktualizacji statusu rekomendacji
  ```typescript
  // Do dodania w src/types.ts
  export interface UpdateRecommendationStatusDto {
    status: RecommendationStatus;
  }
  ```
- **updateRecommendationStatusSchema** - Nowy schemat Zod dla walidacji danych wejściowych
  ```typescript
  // Do dodania w src/lib/schemas/recommendations.schema.ts
  export const updateRecommendationStatusSchema = z.object({
    status: z.enum([RecommendationStatus.ACCEPTED, RecommendationStatus.REJECTED])
  });
  ```

## 4. Szczegóły odpowiedzi
- Status 200 OK:
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
    "status": "string", // "accepted" lub "rejected"
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
  ```
- Status 400 Bad Request: Nieprawidłowy status lub format danych
- Status 401 Unauthorized: Użytkownik nie jest zalogowany
- Status 403 Forbidden: Użytkownik nie jest właścicielem rekomendacji
- Status 404 Not Found: Rekomendacja nie istnieje

## 5. Przepływ danych
1. Żądanie trafia do endpointu `/api/recommendations/:id`.
2. Middleware Astro weryfikuje autentykację użytkownika (za pomocą sesji Supabase).
3. Endpoint wyodrębnia `id` rekomendacji z parametrów URL.
4. Request body jest walidowany przy użyciu schematu Zod (`updateRecommendationStatusSchema`).
5. Service `RecommendationsService` jest wykorzystywany do:
   - Weryfikacji istnienia rekomendacji.
   - Sprawdzenia, czy użytkownik jest właścicielem rekomendacji.
   - Aktualizacji statusu rekomendacji w bazie danych.
   - Pobrania zaktualizowanych danych rekomendacji.
6. Jeśli status to `accepted`, można dodatkowo utworzyć wpis w `user_books` za pomocą `UserBooksService`.
7. Odpowiedź jest walidowana przy użyciu istniejącego `recommendationResponseSchema`.
8. Zwracana jest odpowiedź z aktualizowanymi danymi rekomendacji.

## 6. Względy bezpieczeństwa
- **Autentykacja**: Endpoint musi być zabezpieczony poprzez weryfikację tokenu sesji użytkownika.
- **Autoryzacja**: Należy zweryfikować, czy zalogowany użytkownik jest właścicielem rekomendacji.
- **Walidacja danych wejściowych**: Wszystkie dane wejściowe muszą być walidowane przy użyciu Zod.
- **Sanityzacja danych**: Zapobieganie atakom SQL Injection dzięki użyciu ORM Supabase.
- **Obsługa błędów**: Błędy muszą być odpowiednio logowane i obsługiwane, bez ujawniania szczegółów implementacji.

## 7. Obsługa błędów
- **400 Bad Request**:
  - Nieprawidłowy format JSON.
  - Brak wymaganego pola `status`.
  - Wartość `status` inna niż "accepted" lub "rejected".
- **401 Unauthorized**:
  - Brak tokenu sesji użytkownika.
  - Nieważny token sesji.
- **403 Forbidden**:
  - Użytkownik próbuje zaktualizować rekomendację należącą do innego użytkownika.
- **404 Not Found**:
  - Rekomendacja o podanym ID nie istnieje.
- **500 Internal Server Error**:
  - Błąd podczas komunikacji z bazą danych.
  - Nieoczekiwany wyjątek podczas przetwarzania żądania.

## 8. Rozważania dotyczące wydajności
- Zminimalizowanie liczby zapytań do bazy danych poprzez użycie jednego zapytania do aktualizacji i pobrania zaktualizowanych danych.
- Wykorzystanie indeksów bazy danych dla szybszego wyszukiwania po `id` i `user_id`.
- Możliwość cachowania popularnych rekomendacji lub rekomendacji użytkownika w celu zmniejszenia obciążenia bazy danych.

## 9. Etapy wdrożenia
1. **Aktualizacja pliku `src/lib/schemas/recommendations.schema.ts`**:
   ```typescript
   // Dodaj schemat walidacyjny dla żądania aktualizacji statusu
   export const updateRecommendationStatusSchema = z.object({
     status: z.enum([RecommendationStatus.ACCEPTED, RecommendationStatus.REJECTED])
   });
   
   // Eksportuj typ dla updateRecommendationStatusSchema
   export type UpdateRecommendationStatus = z.infer<typeof updateRecommendationStatusSchema>;
   ```

2. **Dodanie metody do `src/lib/services/recommendations.service.ts`**:
   ```typescript
   /**
    * Updates the status of a recommendation
    * @param id - Recommendation ID
    * @param userId - User ID
    * @param status - New status (accepted or rejected)
    * @returns Updated recommendation data
    * @throws Error if recommendation not found or user doesn't own it
    */
   public async updateRecommendationStatus(
     id: string,
     userId: string,
     status: RecommendationStatus
   ): Promise<RecommendationResponseDto> {
     try {
       logger.info("Updating recommendation status", { id, userId, status });
   
       // First check if recommendation exists and belongs to the user
       const { data: recommendation, error: findError } = await this.supabase
         .from("recommendations")
         .select("id, user_id")
         .eq("id", id)
         .single();
   
       if (findError) {
         if (findError.code === "PGRST116") {
           logger.error("Recommendation not found", { id });
           throw new Error("Recommendation not found");
         }
         
         logger.error("Error finding recommendation", {
           error: findError.message,
           details: findError.details,
           hint: findError.hint,
           id
         });
         throw new Error(`Failed to find recommendation: ${findError.message}`);
       }
   
       if (recommendation.user_id !== userId) {
         logger.error("User does not own this recommendation", { 
           recommendationId: id, 
           ownerId: recommendation.user_id, 
           requestUserId: userId 
         });
         throw new Error("User does not own this recommendation");
       }
   
       // Update recommendation status and get updated data
       const { data: updatedRecommendation, error: updateError } = await this.supabase
         .from("recommendations")
         .update({ 
           status, 
           updated_at: new Date().toISOString() 
         })
         .eq("id", id)
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
           updated_at
         `)
         .single();
   
       if (updateError) {
         logger.error("Error updating recommendation status", {
           error: updateError.message,
           details: updateError.details,
           hint: updateError.hint,
           id,
           status
         });
         throw new Error(`Failed to update recommendation status: ${updateError.message}`);
       }
   
       if (!updatedRecommendation) {
         logger.error("Failed to update recommendation - no data returned", { id, status });
         throw new Error("Failed to update recommendation - no data returned");
       }
   
       // Transform data to match DTO structure
       const response = {
         id: updatedRecommendation.id,
         book: {
           id: updatedRecommendation.book.id,
           title: updatedRecommendation.book.title,
           language: updatedRecommendation.book.language,
           authors: updatedRecommendation.book.authors.map((ba: BookAuthor) => ({
             id: ba.author.id,
             name: ba.author.name,
           })),
         },
         plot_summary: updatedRecommendation.plot_summary,
         rationale: updatedRecommendation.rationale,
         ai_model: updatedRecommendation.ai_model,
         execution_time: parseExecutionTime(updatedRecommendation.execution_time),
         status: updatedRecommendation.status,
         created_at: new Date(updatedRecommendation.created_at).toISOString(),
         updated_at: updatedRecommendation.updated_at 
           ? new Date(updatedRecommendation.updated_at).toISOString() 
           : undefined,
       };
   
       logger.info("Recommendation status updated successfully", { id, status });
       return response;
     } catch (error) {
       logger.error("Error in updateRecommendationStatus", {
         error: error instanceof Error ? error.message : "Unknown error",
         stack: error instanceof Error ? error.stack : undefined,
         id,
         userId,
         status
       });
       throw error;
     }
   }
   ```

3. **Aktualizacja `src/lib/services/user-books.service.ts` (opcjonalnie)**:
   ```typescript
   /**
    * Creates a user book entry from an accepted recommendation
    * @param userId - User ID
    * @param recommendationId - ID of the accepted recommendation
    * @returns Created user book data
    */
   public async createUserBookFromRecommendation(
     userId: string,
     recommendationId: string
   ): Promise<UserBookResponseDto> {
     try {
       logger.info("Creating user book from recommendation", { userId, recommendationId });
       
       // Fetch recommendation data with book info
       const { data: recommendation, error: recError } = await this.supabase
         .from("recommendations")
         .select(`
           id,
           book_id,
           status,
           book:books!inner (
             id,
             title,
             language
           )
         `)
         .eq("id", recommendationId)
         .eq("user_id", userId)
         .single();
         
       if (recError) {
         logger.error("Error fetching recommendation", {
           error: recError.message,
           details: recError.details,
           hint: recError.hint,
           recommendationId
         });
         throw new Error(`Failed to fetch recommendation: ${recError.message}`);
       }
       
       if (recommendation.status !== RecommendationStatus.ACCEPTED) {
         logger.error("Cannot create user book from non-accepted recommendation", {
           recommendationId,
           status: recommendation.status
         });
         throw new Error("Recommendation is not accepted");
       }
       
       // Check if user book already exists for this recommendation
       const { data: existingBook } = await this.supabase
         .from("user_books")
         .select("id")
         .eq("user_id", userId)
         .eq("recommendation_id", recommendationId)
         .single();
         
       if (existingBook) {
         logger.info("User book already exists for this recommendation", {
           userBookId: existingBook.id,
           recommendationId
         });
         
         // Fetch and return existing user book data
         return await this.getUserBook(existingBook.id, userId);
       }
       
       // Create new user book entry
       const newUserBook = {
         user_id: userId,
         book_id: recommendation.book_id,
         status: "to_read",
         is_recommended: true,
         recommendation_id: recommendationId
       };
       
       const { data: createdBook, error: createError } = await this.supabase
         .from("user_books")
         .insert(newUserBook)
         .select()
         .single();
         
       if (createError) {
         logger.error("Error creating user book from recommendation", {
           error: createError.message,
           details: createError.details,
           hint: createError.hint,
           recommendationId
         });
         throw new Error(`Failed to create user book: ${createError.message}`);
       }
       
       // Return complete user book data
       return await this.getUserBook(createdBook.id, userId);
     } catch (error) {
       logger.error("Error in createUserBookFromRecommendation", {
         error: error instanceof Error ? error.message : "Unknown error",
         stack: error instanceof Error ? error.stack : undefined,
         userId,
         recommendationId
       });
       throw error;
     }
   }
   ```

4. **Implementacja endpointu `PUT` w `src/pages/api/recommendations/[id].ts`**:
   ```typescript
   import type { APIRoute } from "astro";
   import { RecommendationsService } from "../../../lib/services/recommendations.service";
   import { UserBooksService } from "../../../lib/services/user-books.service";
   import { updateRecommendationStatusSchema, recommendationResponseSchema } from "../../../lib/schemas/recommendations.schema";
   import { RecommendationStatus } from "../../../types";
   import { logger } from "../../../lib/utils/logger";

   export const prerender = false;
   
   export const PUT: APIRoute = async ({ request, params, locals }) => {
     try {
       // Check if user is authenticated
       const { session } = locals;
       if (!session) {
         return new Response(
           JSON.stringify({
             error: "Unauthorized",
             details: "You must be logged in to update a recommendation"
           }),
           {
             status: 401,
             headers: {
               "Content-Type": "application/json"
             }
           }
         );
       }
       
       const userId = session.user.id;
       
       // Extract recommendation ID from URL params
       const { id } = params;
       if (!id) {
         return new Response(
           JSON.stringify({
             error: "Bad Request",
             details: "Recommendation ID is required"
           }),
           {
             status: 400,
             headers: {
               "Content-Type": "application/json"
             }
           }
         );
       }
       
       // Parse and validate request body
       let requestBody;
       try {
         requestBody = await request.json();
       } catch (error) {
         logger.warn("Invalid JSON in request body", {
           error: error instanceof Error ? error.message : "Unknown error"
         });
         
         return new Response(
           JSON.stringify({
             error: "Bad Request",
             details: "Invalid JSON in request body"
           }),
           {
             status: 400,
             headers: {
               "Content-Type": "application/json"
             }
           }
         );
       }
       
       // Validate request body against schema
       const result = updateRecommendationStatusSchema.safeParse(requestBody);
       if (!result.success) {
         logger.warn("Invalid request body", {
           errors: result.error.format(),
           body: requestBody
         });
         
         return new Response(
           JSON.stringify({
             error: "Bad Request",
             details: "Invalid request body",
             validationErrors: result.error.format()
           }),
           {
             status: 400,
             headers: {
               "Content-Type": "application/json"
             }
           }
         );
       }
       
       const { status } = result.data;
       
       // Initialize services
       const recommendationsService = new RecommendationsService(locals.supabase);
       
       try {
         // Update recommendation status
         const updatedRecommendation = await recommendationsService.updateRecommendationStatus(
           id,
           userId,
           status
         );
         
         // If recommendation is accepted, create user book entry (optional)
         if (status === RecommendationStatus.ACCEPTED) {
           try {
             const userBooksService = new UserBooksService(locals.supabase);
             await userBooksService.createUserBookFromRecommendation(userId, id);
           } catch (error) {
             // Log error but don't fail the request if user book creation fails
             logger.error("Failed to create user book from recommendation", {
               error: error instanceof Error ? error.message : "Unknown error",
               stack: error instanceof Error ? error.stack : undefined,
               recommendationId: id,
               userId
             });
           }
         }
         
         // Validate response data
         const validatedResponse = recommendationResponseSchema.parse(updatedRecommendation);
         
         // Return successful response
         return new Response(JSON.stringify(validatedResponse), {
           status: 200,
           headers: {
             "Content-Type": "application/json"
           }
         });
       } catch (error) {
         if (error instanceof Error) {
           if (error.message === "Recommendation not found") {
             return new Response(
               JSON.stringify({
                 error: "Not Found",
                 details: "Recommendation not found"
               }),
               {
                 status: 404,
                 headers: {
                   "Content-Type": "application/json"
                 }
               }
             );
           }
           
           if (error.message === "User does not own this recommendation") {
             return new Response(
               JSON.stringify({
                 error: "Forbidden",
                 details: "You do not have permission to update this recommendation"
               }),
               {
                 status: 403,
                 headers: {
                   "Content-Type": "application/json"
                 }
               }
             );
           }
         }
         
         // Log any other errors
         logger.error("Error updating recommendation status", {
           error: error instanceof Error ? error.message : "Unknown error",
           stack: error instanceof Error ? error.stack : undefined,
           id,
           userId,
           status
         });
         
         // Return generic server error
         return new Response(
           JSON.stringify({
             error: "Internal Server Error",
             details: "An unexpected error occurred while processing your request"
           }),
           {
             status: 500,
             headers: {
               "Content-Type": "application/json"
             }
           }
         );
       }
     } catch (error) {
       // Catch any unexpected errors
       logger.error("Unexpected error in recommendation status update endpoint", {
         error: error instanceof Error ? error.message : "Unknown error",
         stack: error instanceof Error ? error.stack : undefined,
         params
       });
       
       return new Response(
         JSON.stringify({
           error: "Internal Server Error",
           details: "An unexpected error occurred while processing your request"
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
   ```

5. **Testy**:
   - Napisanie testów jednostkowych dla nowej metody serwisowej.
   - Napisanie testów integracyjnych dla endpointu.
   - Ręczne testy z wykorzystaniem narzędzi typu Postman lub interfejsu użytkownika.

6. **Dokumentacja**:
   - Aktualizacja dokumentacji API z opisem nowego endpointu.
   - Aktualizacja dokumentacji wewnętrznej opisującej interakcje między komponentami. 