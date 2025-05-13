import type { SupabaseClient } from "../../db/supabase.client";
import { logger } from "../utils/logger";
import type { RecommendationResult, BookWithAuthorsDto, AuthorDto } from "../../types";

export class OpenRouterService {
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly defaultModel: string;

  // Public configuration options
  public maxTokens = 1000;
  public temperature = 0.7;

  constructor(private readonly supabase: SupabaseClient) {
    // Debug: Check if environment variables are loaded
    console.log("Env check:", {
      apiKeyExists: !!import.meta.env.OPENROUTER_API_KEY,
      apiKeyLength: import.meta.env.OPENROUTER_API_KEY ? import.meta.env.OPENROUTER_API_KEY.length : 0,
      apiKeyPrefix: import.meta.env.OPENROUTER_API_KEY
        ? import.meta.env.OPENROUTER_API_KEY.substring(0, 4) + "..."
        : "none",
    });

    // Validate that required environment variables are present
    if (!import.meta.env.OPENROUTER_API_KEY) {
      logger.error("Missing OPENROUTER_API_KEY environment variable");
      throw new Error("OpenRouter API key is required");
    }

    this.apiKey = import.meta.env.OPENROUTER_API_KEY;
    // Ensure correct API URL - no trailing slash
    this.apiUrl = (import.meta.env.OPENROUTER_API_URL || "https://openrouter.ai/api/v1").replace(/\/$/, "");
    this.defaultModel = import.meta.env.OPENROUTER_DEFAULT_MODEL || "openai/gpt-4o";

    console.log("OpenRouter service initialized with:", {
      apiUrl: this.apiUrl,
      model: this.defaultModel,
    });
  }

  /**
   * Generates a book recommendation based on user preferences and reading history
   * @param userPreferences User's reading preferences
   * @param readBooks List of books the user has read
   * @param rejectedBooks List of books the user has rejected
   * @param toReadBooks List of books the user plans to read
   * @param preferredLanguage User's preferred language for recommendations (ISO code, e.g., 'en', 'es', 'fr')
   * @returns Recommendation result with book details, execution time, and model information
   */
  public async generateRecommendation(
    userPreferences: string,
    readBooks: BookWithAuthorsDto[],
    rejectedBooks: BookWithAuthorsDto[],
    toReadBooks: BookWithAuthorsDto[] = [],
    preferredLanguage = "en"
  ): Promise<{
    result: RecommendationResult;
    executionTime: number;
    model: string;
  }> {
    try {
      logger.info("Starting OpenRouter recommendation generation");

      const systemMessage = this.createSystemMessage(userPreferences, preferredLanguage);
      const userMessage = this.createUserMessage(readBooks, rejectedBooks, toReadBooks, preferredLanguage);

      logger.info("Calling OpenRouter API");
      const result = await this.callOpenRouterAPI(systemMessage, userMessage);

      logger.info("OpenRouter recommendation generated successfully", {
        executionTime: result.executionTime,
        model: result.model,
      });

      return result;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Creates a system message with instructions for the AI model
   * @param userPreferences User's reading preferences
   * @param preferredLanguage User's preferred language for book recommendations
   * @returns System message for OpenRouter API
   */
  private createSystemMessage(userPreferences: string, preferredLanguage: string): string {
    return `You are a book recommendation expert. Your task is to recommend a single book based on the user's reading preferences and history.
    
User preferences: ${userPreferences}
User preferred language for books: ${preferredLanguage}

Provide recommendations that align with these preferences while avoiding books the user has already read, rejected, or added to their to-read list.
Pay special attention to the user's book ratings - books marked as "liked" indicate preferences you should consider, while "disliked" books should guide you away from similar titles or styles.
Your recommendation should be thoughtful and include a compelling rationale.
Do not suggest books that the user has already mentioned in any category.

IMPORTANT LANGUAGE REQUIREMENTS:
- Always provide the book title in the user's preferred language (${preferredLanguage}).
- The plot summary and rationale MUST be written in English, regardless of the book's language.
- Make sure to set the language field in your response to match the user's preferred language.`;
  }

  /**
   * Creates a user message with context about read, rejected, and to-read books
   * @param readBooks List of books the user has read
   * @param rejectedBooks List of books the user has rejected
   * @param toReadBooks List of books the user plans to read
   * @param preferredLanguage User's preferred language for recommendations
   * @returns User message for OpenRouter API
   */
  private createUserMessage(
    readBooks: BookWithAuthorsDto[],
    rejectedBooks: BookWithAuthorsDto[],
    toReadBooks: BookWithAuthorsDto[] = [],
    preferredLanguage = "en"
  ): string {
    let message = `Please recommend a book for me based on my preferences. I prefer books in ${preferredLanguage} language.`;

    if (readBooks.length > 0) {
      message += "\n\nBooks I've already read:";
      readBooks.forEach((book) => {
        const authorNames = book.authors?.map((author: AuthorDto) => author.name).join(", ") || "Unknown author";
        // Add rating information to read books if available
        const ratingInfo = book.hasOwnProperty("rating")
          ? book.rating === true
            ? " (liked)"
            : book.rating === false
              ? " (disliked)"
              : ""
          : "";
        message += `\n- "${book.title}" by ${authorNames}${ratingInfo}`;
      });
    }

    if (rejectedBooks.length > 0) {
      message += "\n\nBooks I'm not interested in:";
      rejectedBooks.forEach((book) => {
        const authorNames = book.authors?.map((author: AuthorDto) => author.name).join(", ") || "Unknown author";
        message += `\n- "${book.title}" by ${authorNames}`;
      });
    }

    if (toReadBooks.length > 0) {
      message += "\n\nBooks already on my to-read list (don't recommend these):";
      toReadBooks.forEach((book) => {
        const authorNames = book.authors?.map((author: AuthorDto) => author.name).join(", ") || "Unknown author";
        message += `\n- "${book.title}" by ${authorNames}`;
      });
    }

    message +=
      "\n\nPlease recommend a book that isn't in any of the lists above. Make sure your recommendation is unique and not a duplicate of anything I've already mentioned.";

    message += `\n\nRemember to provide the book title in ${preferredLanguage} language, but write the plot summary and rationale in English.`;

    return message;
  }

  /**
   * Creates a JSON schema for structured response format
   * @returns Response format configuration for OpenRouter API
   */
  private createResponseFormat() {
    return {
      type: "json_schema",
      json_schema: {
        name: "book_recommendation",
        strict: true,
        schema: {
          type: "object",
          properties: {
            book: {
              type: "object",
              properties: {
                title: {
                  type: "string",
                  description: "The title of the recommended book in the user's preferred language",
                },
                language: {
                  type: "string",
                  description: "The language of the book (ISO code, e.g., 'en', 'es', 'fr')",
                },
                authors: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: {
                        type: "string",
                        description: "Full name of the author",
                      },
                    },
                    required: ["name"],
                    additionalProperties: false,
                  },
                  description: "List of authors of the book",
                },
              },
              required: ["title", "language", "authors"],
              description: "Details about the recommended book",
              additionalProperties: false,
            },
            plot_summary: {
              type: "string",
              description: "A concise summary of the book's plot without spoilers, in English",
            },
            rationale: {
              type: "string",
              description: "Explanation of why this book matches the user's preferences, in English",
            },
          },
          required: ["book", "plot_summary", "rationale"],
          additionalProperties: false,
        },
      },
    };
  }

  /**
   * Makes a request to the OpenRouter API
   * @param systemMessage System message for the AI
   * @param userMessage User message for the AI
   * @returns API response with recommendation data
   */
  private async callOpenRouterAPI(
    systemMessage: string,
    userMessage: string
  ): Promise<{
    result: RecommendationResult;
    executionTime: number;
    model: string;
  }> {
    const startTime = performance.now();

    try {
      // Log the request configuration for debugging
      console.log("OpenRouter API request config:", {
        url: `${this.apiUrl}/chat/completions`,
        hasApiKey: !!this.apiKey,
        apiKeyLength: this.apiKey ? this.apiKey.length : 0,
        headerAuth: `Bearer ${this.apiKey}`.substring(0, 10) + "...",
      });

      // Prepare the request payload
      const payload: {
        model: string;
        messages: { role: string; content: string }[];
        max_tokens: number;
        temperature: number;
        response_format?: {
          type: string;
          json_schema: {
            name: string;
            strict: boolean;
            schema: Record<string, unknown>;
          };
        };
      } = {
        model: this.defaultModel,
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: userMessage },
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature,
      };

      // Add response format if supported by the model
      if (this.defaultModel.includes("gpt") || this.defaultModel.includes("claude")) {
        payload.response_format = this.createResponseFormat();
      }

      console.log("Request payload:", JSON.stringify(payload, null, 2));

      const response = await fetch(`${this.apiUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey.trim()}`,
          "Content-Type": "application/json",
          "HTTP-Referer": import.meta.env.SITE_URL || "https://yourapplication.com",
          "X-Title": import.meta.env.SITE_TITLE || "Book Recommendation App",
        },
        body: JSON.stringify(payload),
      });

      // Check for HTTP error responses
      if (!response.ok) {
        const errorData = await response.json();
        logger.error("OpenRouter API error", {
          status: response.status,
          error: errorData,
        });
        throw new Error(`OpenRouter API error: ${response.status} ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      const executionTime = (performance.now() - startTime) / 1000; // Convert to seconds

      // Log the API response for debugging
      console.log("OpenRouter API response:", {
        hasChoices: !!data.choices,
        choicesLength: data.choices?.length || 0,
        model: data.model,
        responseStructure: Object.keys(data),
      });

      // Check if response has valid structure
      if (!data.choices || !data.choices.length || !data.choices[0].message?.content) {
        logger.error("Invalid OpenRouter API response structure", { data });
        throw new Error(`Invalid OpenRouter API response structure: ${JSON.stringify(data)}`);
      }

      return {
        result: JSON.parse(data.choices[0].message.content),
        executionTime,
        model: data.model,
      };
    } catch (error) {
      logger.error("Error calling OpenRouter API", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new Error(`Failed to get recommendation: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  /**
   * Handles errors from the OpenRouter API
   * @param error The error object
   * @returns A standardized error object
   */
  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      logger.error("OpenRouter service error", {
        message: error.message,
        stack: error.stack,
      });
      return error;
    }

    const genericError = new Error("Unknown error in OpenRouter service");
    logger.error("Unknown OpenRouter service error", { error });
    return genericError;
  }
}
