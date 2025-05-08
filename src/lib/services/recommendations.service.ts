import type { SupabaseClient } from "@supabase/supabase-js";
import { AIService } from "./ai.service";
import { RecommendationStatus, type RecommendationResponseDto } from "../../types";
import { DEFAULT_USER_ID } from "../../db/supabase.client";
import { logger } from "../../lib/utils/logger";

interface BookAuthor {
  author: {
    id: string;
    name: string;
  };
}

interface RecommendationResponse {
  id: string;
  book: {
    id: string;
    title: string;
    language: string;
    authors: BookAuthor[];
  };
  plot_summary: string;
  rationale: string;
  ai_model: string;
  execution_time: number;
  status: RecommendationStatus;
  created_at: string;
  updated_at: string;
}

/**
 * Parse execution time from various formats
 * @param value The execution time value from database
 * @returns The execution time in milliseconds
 */
function parseExecutionTime(value: unknown): number {
  logger.info("Parsing execution time", { value });
  if (value === null || value === undefined) {
    return 1; // Default to 1 ms for null/undefined values
  }

  if (typeof value === "number") {
    return isNaN(value) ? 1 : Math.max(1, value); // Ensure positive value
  }

  if (typeof value === "string") {
    // Try to parse as number first
    const numberValue = Number(value);
    if (!isNaN(numberValue)) {
      return Math.max(1, numberValue); // Ensure it's at least 1 to pass Zod validation
    }

    // Handle PostgreSQL interval format HH:MM:SS.MS like "00:00:02.5"
    const pgIntervalMatch = value.match(/(\d+):(\d+):(\d+\.\d+|\d+)/);
    if (pgIntervalMatch) {
      const hours = parseInt(pgIntervalMatch[1], 10);
      const minutes = parseInt(pgIntervalMatch[2], 10);
      const seconds = parseFloat(pgIntervalMatch[3]);
      const totalMs = (hours * 3600 + minutes * 60 + seconds) * 1000;
      return Math.max(1, Math.round(totalMs)); // Ensure it's at least 1
    }

    // Handle PostgreSQL interval format like "2.5 seconds" or "2500 milliseconds"
    const secondsMatch = value.match(/(\d+\.?\d*)\s*seconds?/i);
    if (secondsMatch && secondsMatch[1]) {
      return Math.max(1, Math.round(parseFloat(secondsMatch[1]) * 1000));
    }

    const msMatch = value.match(/(\d+\.?\d*)\s*milliseconds?/i);
    if (msMatch && msMatch[1]) {
      return Math.max(1, Math.round(parseFloat(msMatch[1])));
    }
  }

  // Default to 1 if unparseable to pass Zod validation
  return 1;
}

export class RecommendationsService {
  private aiService: AIService;

  constructor(private readonly supabase: SupabaseClient) {
    this.aiService = new AIService();
  }

  /**
   * Generates a new book recommendation for the user
   * @returns The generated recommendation
   */
  public async generateRecommendation(): Promise<RecommendationResponseDto> {
    try {
      logger.info("Starting recommendation generation");

      // Get user preferences
      logger.info("Fetching user preferences");
      const { data: preferences } = await this.supabase.from("user_preferences").select().single();

      if (!preferences) {
        logger.error("User preferences not found", { userId: DEFAULT_USER_ID });
        throw new Error("User preferences not found");
      }
      logger.info("User preferences found", { preferences });

      // Get user's read books
      logger.info("Fetching user's read books");
      const { data: readBooks } = await this.supabase.from("user_books").select("book_id").eq("status", "read");
      logger.info("Read books found", { count: readBooks?.length || 0 });

      // Get user's rejected books
      logger.info("Fetching user's rejected books");
      const { data: rejectedBooks } = await this.supabase.from("user_books").select("book_id").eq("status", "rejected");
      logger.info("Rejected books found", { count: rejectedBooks?.length || 0 });

      // Generate recommendation using AI
      logger.info("Generating AI recommendation");
      const { result, executionTime, model } = await this.aiService.generateRecommendation(
        preferences.reading_preferences,
        readBooks?.map((b) => b.book_id) || [],
        rejectedBooks?.map((b) => b.book_id) || []
      );
      logger.info("AI recommendation generated", { executionTime, model });

      // Create or get authors
      logger.info("Processing authors", { authorCount: result.book.authors.length });
      const authorIds = await Promise.all(
        result.book.authors.map(async (author) => {
          logger.info("Processing author", { authorName: author.name });
          const { data: existingAuthor } = await this.supabase
            .from("authors")
            .select()
            .eq("name", author.name)
            .single();

          if (existingAuthor) {
            logger.info("Found existing author", { authorId: existingAuthor.id, authorName: author.name });
            return existingAuthor.id;
          }

          logger.info("Creating new author", { authorName: author.name });
          const { data: newAuthor } = await this.supabase
            .from("authors")
            .insert({ name: author.name })
            .select()
            .single();

          if (!newAuthor) {
            logger.error("Failed to create author", { authorName: author.name });
            throw new Error(`Failed to create author: ${author.name}`);
          }

          logger.info("Created new author", { authorId: newAuthor.id, authorName: author.name });
          return newAuthor.id;
        })
      );
      logger.info("Authors processed", { authorIds });

      // Create or get book
      logger.info("Processing book", { bookTitle: result.book.title });
      const { data: existingBook } = await this.supabase.from("books").select().eq("title", result.book.title).single();

      let bookId: string;

      if (existingBook) {
        logger.info("Found existing book", { bookId: existingBook.id, bookTitle: result.book.title });
        bookId = existingBook.id;
      } else {
        logger.info("Creating new book", { bookTitle: result.book.title });
        const { data: newBook, error: newBookError } = await this.supabase
          .from("books")
          .insert({
            title: result.book.title,
            language: result.book.language,
          })
          .select()
          .single();

        if (newBookError) {
          logger.error("Failed to create book", {
            error: newBookError.message,
            details: newBookError.details,
            hint: newBookError.hint,
            bookTitle: result.book.title,
          });
          throw new Error(`Failed to create book: ${newBookError.message}`);
        }

        if (!newBook) {
          logger.error("Failed to create book - no data returned", { bookTitle: result.book.title });
          throw new Error("Failed to create book - no data returned");
        }

        bookId = newBook.id;
        logger.info("Created new book", { bookId, bookTitle: result.book.title });

        // Create book-author relationships
        logger.info("Creating book-author relationships", { bookId, authorIds });
        const { error: relationshipError } = await this.supabase.from("book_authors").insert(
          authorIds.map((authorId) => ({
            book_id: bookId,
            author_id: authorId,
          }))
        );

        if (relationshipError) {
          logger.error("Failed to create book-author relationships", {
            error: relationshipError.message,
            details: relationshipError.details,
            hint: relationshipError.hint,
            bookId,
            authorIds,
          });
          throw new Error(`Failed to create book-author relationships: ${relationshipError.message}`);
        }
        logger.info("Book-author relationships created successfully");
      }

      // Create recommendation
      logger.info("Creating recommendation", { bookId });
      const { data: recommendation, error: recommendationError } = await this.supabase
        .from("recommendations")
        .insert({
          user_id: DEFAULT_USER_ID,
          book_id: bookId,
          plot_summary: result.plot_summary,
          rationale: result.rationale,
          ai_model: model,
          execution_time: executionTime,
          status: RecommendationStatus.PENDING,
        })
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

      if (recommendationError) {
        logger.error("Failed to create recommendation", {
          error: recommendationError.message,
          details: recommendationError.details,
          hint: recommendationError.hint,
          bookId,
        });
        throw new Error(`Failed to create recommendation: ${recommendationError.message}`);
      }

      if (!recommendation) {
        logger.error("Failed to create recommendation - no data returned", { bookId });
        throw new Error("Failed to create recommendation - no data returned");
      }

      logger.info("Recommendation created successfully", { recommendationId: recommendation.id });

      // Transform the response to match DTO structure
      const response = {
        id: recommendation.id,
        book: {
          id: recommendation.book.id,
          title: recommendation.book.title,
          language: recommendation.book.language,
          authors: recommendation.book.authors.map((ba: BookAuthor) => ({
            id: ba.author.id,
            name: ba.author.name,
          })),
        },
        plot_summary: recommendation.plot_summary,
        rationale: recommendation.rationale,
        ai_model: recommendation.ai_model,
        execution_time: parseExecutionTime(recommendation.execution_time),
        status: recommendation.status,
        created_at: new Date(recommendation.created_at).toISOString(),
        updated_at: recommendation.updated_at ? new Date(recommendation.updated_at).toISOString() : undefined,
      };

      logger.info("Recommendation generation completed successfully", { recommendationId: response.id });
      return response;
    } catch (error) {
      logger.error("Error in recommendation generation", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }
}
