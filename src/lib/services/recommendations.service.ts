import type { SupabaseClient } from "../../db/supabase.client";
import { RecommendationStatus } from "../../types";
import type {
  RecommendationResponseDto,
  RecommendationPaginatedResponseDto,
  BookWithAuthorsDto,
  AuthorDto,
} from "../../types";
import { logger } from "../utils/logger";
import { OpenRouterService } from "./openrouter.service";

// Define book-author relationship interface for typed access
interface BookAuthorRelation {
  authors: {
    id: string;
    name: string;
  };
}

// For query results from Supabase
interface BookDetailsResult {
  id: string;
  title: string;
  language: string;
  created_at: string;
  authors: BookAuthorRelation[];
}

interface BookAuthor {
  author: {
    id: string;
    name: string;
  };
}

export class RecommendationsService {
  private openRouterService: OpenRouterService;

  constructor(private readonly supabase: SupabaseClient) {
    this.openRouterService = new OpenRouterService(supabase);
  }

  /**
   * Generates a new book recommendation for the user
   * @param userId - The ID of the user to generate a recommendation for
   * @returns The generated recommendation
   */
  public async generateRecommendation(userId: string): Promise<RecommendationResponseDto> {
    try {
      logger.info("Starting recommendation generation");

      // Get user preferences
      logger.info("Fetching user preferences");
      const { data: preferences } = await this.supabase
        .from("user_preferences")
        .select()
        .eq("user_id", userId)
        .single();

      if (!preferences) {
        logger.error("User preferences not found", { userId });
        throw new Error("User preferences not found");
      }
      logger.info("User preferences found", { preferences });

      // Get user's read books
      logger.info("Fetching user's read books");
      const { data: readBooksIds } = await this.supabase
        .from("user_books")
        .select("book_id, rating")
        .eq("user_id", userId)
        .eq("status", "read");
      logger.info("Read books found", { count: readBooksIds?.length || 0 });

      // Get user's rejected books
      logger.info("Fetching user's rejected books");
      const { data: rejectedBooksIds } = await this.supabase
        .from("user_books")
        .select("book_id")
        .eq("user_id", userId)
        .eq("status", "rejected");
      logger.info("Rejected books found", { count: rejectedBooksIds?.length || 0 });

      // Get user's to-read books
      logger.info("Fetching user's to-read books");
      const { data: toReadBooksIds } = await this.supabase
        .from("user_books")
        .select("book_id")
        .eq("user_id", userId)
        .eq("status", "to_read");
      logger.info("To-read books found", { count: toReadBooksIds?.length || 0 });

      // Fetch full book details with authors for read books
      const readBookIds = readBooksIds?.map((b) => b.book_id) || [];
      const readBooks: BookWithAuthorsDto[] = [];

      if (readBookIds.length > 0) {
        logger.info("Fetching read books details");
        const { data: readBooksDetails } = await this.supabase
          .from("books")
          .select(
            `
            id, 
            title, 
            language,
            created_at,
            authors:book_authors(
              authors:authors(
                id,
                name
              )
            )
          `
          )
          .in("id", readBookIds);

        if (readBooksDetails) {
          (readBooksDetails as BookDetailsResult[]).forEach((book) => {
            const bookAuthors: AuthorDto[] = [];

            // Extract authors from the nested structure
            book.authors.forEach((relation: BookAuthorRelation) => {
              if (relation.authors) {
                bookAuthors.push({
                  id: relation.authors.id,
                  name: relation.authors.name,
                });
              }
            });

            // Find the corresponding user_book record to get the rating
            const userBook = readBooksIds?.find((b) => b.book_id === book.id);

            readBooks.push({
              id: book.id,
              title: book.title,
              language: book.language,
              created_at: book.created_at,
              authors: bookAuthors,
              rating: userBook?.rating,
            });
          });
        }
        logger.info("Read books details fetched", { count: readBooks.length });
      }

      // Fetch full book details with authors for rejected books
      const rejectedBookIds = rejectedBooksIds?.map((b) => b.book_id) || [];
      const rejectedBooks: BookWithAuthorsDto[] = [];

      if (rejectedBookIds.length > 0) {
        logger.info("Fetching rejected books details");
        const { data: rejectedBooksDetails } = await this.supabase
          .from("books")
          .select(
            `
            id, 
            title, 
            language,
            created_at,
            authors:book_authors(
              authors:authors(
                id,
                name
              )
            )
          `
          )
          .in("id", rejectedBookIds);

        if (rejectedBooksDetails) {
          (rejectedBooksDetails as BookDetailsResult[]).forEach((book) => {
            const bookAuthors: AuthorDto[] = [];

            // Extract authors from the nested structure
            book.authors.forEach((relation: BookAuthorRelation) => {
              if (relation.authors) {
                bookAuthors.push({
                  id: relation.authors.id,
                  name: relation.authors.name,
                });
              }
            });

            rejectedBooks.push({
              id: book.id,
              title: book.title,
              language: book.language,
              created_at: book.created_at,
              authors: bookAuthors,
            });
          });
        }
        logger.info("Rejected books details fetched", { count: rejectedBooks.length });
      }

      // Fetch full book details with authors for to-read books
      const toReadBookIds = toReadBooksIds?.map((b) => b.book_id) || [];
      const toReadBooks: BookWithAuthorsDto[] = [];

      if (toReadBookIds.length > 0) {
        logger.info("Fetching to-read books details");
        const { data: toReadBooksDetails } = await this.supabase
          .from("books")
          .select(
            `
            id, 
            title, 
            language,
            created_at,
            authors:book_authors(
              authors:authors(
                id,
                name
              )
            )
          `
          )
          .in("id", toReadBookIds);

        if (toReadBooksDetails) {
          (toReadBooksDetails as BookDetailsResult[]).forEach((book) => {
            const bookAuthors: AuthorDto[] = [];

            // Extract authors from the nested structure
            book.authors.forEach((relation: BookAuthorRelation) => {
              if (relation.authors) {
                bookAuthors.push({
                  id: relation.authors.id,
                  name: relation.authors.name,
                });
              }
            });

            toReadBooks.push({
              id: book.id,
              title: book.title,
              language: book.language,
              created_at: book.created_at,
              authors: bookAuthors,
            });
          });
        }
        logger.info("To-read books details fetched", { count: toReadBooks.length });
      }

      // Generate recommendation using OpenRouter API
      logger.info("Generating OpenRouter recommendation");
      const { result, executionTime, model } = await this.openRouterService.generateRecommendation(
        preferences.reading_preferences,
        readBooks,
        rejectedBooks,
        toReadBooks,
        preferences.preferred_language
      );
      logger.info("OpenRouter recommendation generated", { executionTime, model });

      // Create or get authors
      logger.info("Processing authors", { authorCount: result.book.authors.length });

      // Process authors sequentially to avoid race conditions
      const bookAuthorIds: string[] = [];
      for (const author of result.book.authors) {
        logger.info("Processing author", { authorName: author.name });

        // Check if author already exists
        const { data: existingAuthor } = await this.supabase
          .from("authors")
          .select("id")
          .ilike("name", author.name)
          .maybeSingle();

        if (existingAuthor) {
          logger.info("Author already exists", { authorId: existingAuthor.id, name: author.name });
          bookAuthorIds.push(existingAuthor.id);
        } else {
          // Create new author
          logger.info("Creating new author", { name: author.name });
          const { data: newAuthor, error } = await this.supabase
            .from("authors")
            .insert({ name: author.name })
            .select("id")
            .single();

          if (error) {
            logger.error("Failed to create author", { error, name: author.name });
            throw new Error(`Failed to create author: ${error.message}`);
          }

          logger.info("New author created", { authorId: newAuthor.id, name: author.name });
          bookAuthorIds.push(newAuthor.id);
        }
      }

      // Create book
      logger.info("Creating book", { title: result.book.title });
      const { data: newBook, error: bookError } = await this.supabase
        .from("books")
        .insert({
          title: result.book.title,
          language: result.book.language,
        })
        .select("id")
        .single();

      if (bookError) {
        logger.error("Failed to create book", { error: bookError, title: result.book.title });
        throw new Error(`Failed to create book: ${bookError.message}`);
      }

      logger.info("New book created", { bookId: newBook.id, title: result.book.title });

      // Create book-author relationships
      logger.info("Creating book-author relationships");
      const bookAuthorRelations = bookAuthorIds.map((authorId) => ({
        book_id: newBook.id,
        author_id: authorId,
      }));

      const { error: relationError } = await this.supabase.from("book_authors").insert(bookAuthorRelations);

      if (relationError) {
        logger.error("Failed to create book-author relationships", { error: relationError, bookId: newBook.id });
        throw new Error(`Failed to create book-author relationships: ${relationError.message}`);
      }

      logger.info("Book-author relationships created", { count: bookAuthorIds.length });

      // Create recommendation
      logger.info("Creating recommendation");
      const { data: newRecommendation, error: recommendationError } = await this.supabase
        .from("recommendations")
        .insert({
          user_id: userId,
          book_id: newBook.id,
          plot_summary: result.plot_summary,
          rationale: result.rationale,
          ai_model: model,
          execution_time: executionTime,
          status: RecommendationStatus.PENDING,
        })
        .select("id")
        .single();

      if (recommendationError) {
        logger.error("Failed to create recommendation", { error: recommendationError, bookId: newBook.id });
        throw new Error(`Failed to create recommendation: ${recommendationError.message}`);
      }

      logger.info("New recommendation created", { recommendationId: newRecommendation.id });

      // Build and return response DTO
      return {
        id: newRecommendation.id,
        book: {
          id: newBook.id,
          title: result.book.title,
          language: result.book.language,
          authors: result.book.authors.map((author, index) => ({
            id: bookAuthorIds[index],
            name: author.name,
          })),
        },
        plot_summary: result.plot_summary,
        rationale: result.rationale,
        ai_model: model,
        execution_time: executionTime,
        status: RecommendationStatus.PENDING,
        created_at: new Date().toISOString(),
      };
    } catch (error) {
      logger.error("Failed to generate recommendation", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  /**
   * Fetches paginated recommendations for a user with optional status filtering
   * @param userId - The ID of the user to fetch recommendations for
   * @param status - Optional status to filter recommendations by
   * @param page - Page number for pagination (default: 1)
   * @param limit - Number of items per page (default: 10)
   * @returns Promise with paginated recommendations
   */
  public async getRecommendations(
    userId: string,
    status?: RecommendationStatus,
    page = 1,
    limit = 10
  ): Promise<RecommendationPaginatedResponseDto> {
    try {
      logger.info("Fetching recommendations", { userId, status, page, limit });

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Build base query
      let query = this.supabase
        .from("recommendations")
        .select(
          `
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
        `,
          { count: "exact" }
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      // Add status filter if provided
      if (status) {
        query = query.eq("status", status);
      }

      // Add pagination
      query = query.range(offset, offset + limit - 1);

      // Execute query
      const { data, error, count } = await query;

      if (error) {
        logger.error("Error fetching recommendations", {
          error: error.message,
          details: error.details,
          hint: error.hint,
          userId,
          status,
          page,
          limit,
        });
        throw new Error(`Failed to fetch recommendations: ${error.message}`);
      }

      // Return empty response if no data
      if (!data || data.length === 0) {
        logger.info("No recommendations found", { userId, status, page, limit });
        return {
          data: [],
          pagination: {
            total: 0,
            page,
            limit,
            total_pages: 0,
          },
        };
      }

      // Calculate pagination info
      const total = count || 0;
      const total_pages = Math.ceil(total / limit);

      // Transform data to DTO format
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
        execution_time: rec.execution_time,
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
        count: recommendations.length,
      });

      // Return paginated response
      return {
        data: recommendations,
        pagination: {
          total,
          page,
          limit,
          total_pages,
        },
      };
    } catch (error) {
      logger.error("Error in getRecommendations", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        userId,
        status,
        page,
        limit,
      });
      throw error;
    }
  }

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
          id,
        });
        throw new Error(`Failed to find recommendation: ${findError.message}`);
      }

      if (recommendation.user_id !== userId) {
        logger.error("User does not own this recommendation", {
          recommendationId: id,
          ownerId: recommendation.user_id,
          requestUserId: userId,
        });
        throw new Error("User does not own this recommendation");
      }

      // Update recommendation status and get updated data
      const { data: updatedRecommendation, error: updateError } = await this.supabase
        .from("recommendations")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select(
          `
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
        `
        )
        .single();

      if (updateError) {
        logger.error("Error updating recommendation status", {
          error: updateError.message,
          details: updateError.details,
          hint: updateError.hint,
          id,
          status,
        });
        throw new Error(`Failed to update recommendation status: ${updateError.message}`);
      }

      if (!updatedRecommendation) {
        logger.error("Failed to update recommendation - no data returned", { id, status });
        throw new Error("Failed to update recommendation - no data returned");
      }

      // Transform data to match DTO structure
      const response: RecommendationResponseDto = {
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
        execution_time: updatedRecommendation.execution_time,
        status: updatedRecommendation.status,
        created_at: updatedRecommendation.created_at,
        updated_at: updatedRecommendation.updated_at,
      };

      logger.info("Recommendation status updated successfully", { id, status });
      return response;
    } catch (error) {
      logger.error("Error in updateRecommendationStatus", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        id,
        userId,
        status,
      });
      throw error;
    }
  }
}
