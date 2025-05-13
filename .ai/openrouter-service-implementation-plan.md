# OpenRouter Service Implementation Plan

## 1. Description of Service

The OpenRouter service will provide a unified interface to interact with the OpenRouter API for AI-powered chat completions. This service will replace the current mock implementation in `ai.service.ts` with a production-ready service that connects to OpenRouter's API to generate high-quality AI responses based on user preferences and inputs.

## 2. Constructor

The service constructor should:

- Accept a Supabase client instance for database operations
- Initialize configuration from environment variables
- Set up error handling and logging mechanisms
- Establish default parameters for API calls

```typescript
constructor(private readonly supabase: SupabaseClient) {
  // Validate that required environment variables are present
  if (!import.meta.env.OPENROUTER_API_KEY) {
    logger.error("Missing OPENROUTER_API_KEY environment variable");
    throw new Error("OpenRouter API key is required");
  }
  
  this.apiKey = import.meta.env.OPENROUTER_API_KEY;
  this.apiUrl = import.meta.env.OPENROUTER_API_URL || "https://openrouter.ai/api/v1";
  this.defaultModel = import.meta.env.OPENROUTER_DEFAULT_MODEL || "openai/gpt-4o";
}
```

## 3. Public Methods and Fields

### 3.1 generateRecommendation Method

```typescript
/**
 * Generates a book recommendation based on user preferences and reading history
 * @param userPreferences User's reading preferences
 * @param readBooks List of books the user has read
 * @param rejectedBooks List of books the user has rejected
 * @returns Recommendation result with book details, execution time, and model information
 */
public async generateRecommendation(
  userPreferences: string,
  readBooks: string[],
  rejectedBooks: string[]
): Promise<{
  result: RecommendationResult;
  executionTime: number;
  model: string;
}> {
  // Implementation details in section 4
}
```

### 3.2 Public Fields

```typescript
// Public configuration options that can be overridden
public maxTokens: number = 1000;
public temperature: number = 0.7;
```

## 4. Private Methods and Fields

### 4.1 Private Fields

```typescript
private readonly apiKey: string;
private readonly apiUrl: string;
private readonly defaultModel: string;
```

### 4.2 createSystemMessage Method

```typescript
/**
 * Creates a system message with instructions for the AI model
 * @param userPreferences User's reading preferences
 * @returns System message for OpenRouter API
 */
private createSystemMessage(userPreferences: string): string {
  return `You are a book recommendation expert. Your task is to recommend a single book based on the user's reading preferences and history.
  
User preferences: ${userPreferences}

Provide recommendations that align with these preferences while avoiding books the user has already read or rejected.
Your recommendation should be thoughtful and include a compelling rationale.`;
}
```

### 4.3 createUserMessage Method

```typescript
/**
 * Creates a user message with context about read and rejected books
 * @param readBooks List of books the user has read
 * @param rejectedBooks List of books the user has rejected
 * @returns User message for OpenRouter API
 */
private createUserMessage(readBooks: string[], rejectedBooks: string[]): string {
  let message = "Please recommend a book for me based on my preferences.";
  
  if (readBooks.length > 0) {
    message += `\n\nBooks I've already read: ${readBooks.join(", ")}`;
  }
  
  if (rejectedBooks.length > 0) {
    message += `\n\nBooks I'm not interested in: ${rejectedBooks.join(", ")}`;
  }
  
  return message;
}
```

### 4.4 createResponseFormat Method

```typescript
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
                description: "The title of the recommended book"
              },
              language: {
                type: "string",
                description: "The language of the book (ISO code, e.g., 'en')"
              },
              authors: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: {
                      type: "string",
                      description: "Full name of the author"
                    }
                  },
                  required: ["name"]
                },
                description: "List of authors of the book"
              }
            },
            required: ["title", "language", "authors"],
            description: "Details about the recommended book"
          },
          plot_summary: {
            type: "string",
            description: "A concise summary of the book's plot without spoilers"
          },
          rationale: {
            type: "string",
            description: "Explanation of why this book matches the user's preferences"
          }
        },
        required: ["book", "plot_summary", "rationale"],
        additionalProperties: false
      }
    }
  };
}
```

### 4.5 callOpenRouterAPI Method

```typescript
/**
 * Makes a request to the OpenRouter API
 * @param systemMessage System message for the AI
 * @param userMessage User message for the AI
 * @returns API response with recommendation data
 */
private async callOpenRouterAPI(systemMessage: string, userMessage: string): Promise<any> {
  const startTime = performance.now();
  
  try {
    const response = await fetch(`${this.apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': import.meta.env.SITE_URL || 'https://yourapplication.com',
        'X-Title': import.meta.env.SITE_TITLE || 'Book Recommendation App'
      },
      body: JSON.stringify({
        model: this.defaultModel,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        response_format: this.createResponseFormat(),
        max_tokens: this.maxTokens,
        temperature: this.temperature
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      logger.error("OpenRouter API error", { 
        status: response.status, 
        error: errorData 
      });
      throw new Error(`OpenRouter API error: ${response.status} ${errorData.error || 'Unknown error'}`);
    }

    const data = await response.json();
    const executionTime = (performance.now() - startTime) / 1000; // Convert to seconds
    
    return {
      result: JSON.parse(data.choices[0].message.content),
      executionTime,
      model: data.model
    };
  } catch (error) {
    logger.error("Error calling OpenRouter API", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    });
    throw new Error(`Failed to get recommendation: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
```

## 5. Error Handling

The service should implement comprehensive error handling:

1. **API Request Errors**:
   - Network connectivity issues
   - Authentication failures
   - Rate limiting
   - Malformed requests

2. **Response Parsing Errors**:
   - Invalid JSON responses
   - Missing required fields
   - Schema validation failures

3. **Configuration Errors**:
   - Missing API keys
   - Invalid environment variables

4. **Timeout Handling**:
   - Implement request timeouts
   - Graceful degradation on slow responses

Error handling implementation:

```typescript
/**
 * Handles errors from the OpenRouter API
 * @param error The error object
 * @returns A standardized error object
 */
private handleError(error: unknown): Error {
  if (error instanceof Error) {
    logger.error("OpenRouter service error", {
      message: error.message,
      stack: error.stack
    });
    return error;
  }
  
  const genericError = new Error("Unknown error in OpenRouter service");
  logger.error("Unknown OpenRouter service error", { error });
  return genericError;
}
```

## 6. Security Considerations

1. **API Key Management**:
   - Store API keys in environment variables
   - Never expose keys in client-side code
   - Implement key rotation policies

2. **Data Privacy**:
   - Minimize personal data sent to the API
   - Implement data retention policies
   - Follow GDPR and other privacy regulations

3. **Input Validation**:
   - Sanitize all inputs before sending to API
   - Validate responses against expected schemas
   - Implement rate limiting for API requests

4. **Error Exposure**:
   - Sanitize error messages before returning to clients
   - Log detailed errors internally but return generic messages externally

## 7. Implementation Plan

### Step 1: Environment Setup

1. Add required environment variables to `.env` file:
   ```
   OPENROUTER_API_KEY=your_api_key_here
   OPENROUTER_API_URL=https://openrouter.ai/api/v1
   OPENROUTER_DEFAULT_MODEL=openai/gpt-4o
   SITE_URL=https://yourapplication.com
   SITE_TITLE=Book Recommendation App
   ```

2. Update environment type definitions in `src/env.d.ts`:
   ```typescript
   interface ImportMetaEnv {
     // Existing variables
     OPENROUTER_API_KEY: string;
     OPENROUTER_API_URL?: string;
     OPENROUTER_DEFAULT_MODEL?: string;
     SITE_URL?: string;
     SITE_TITLE?: string;
   }
   ```

### Step 2: Create OpenRouter Service

1. Create the service implementation in `src/lib/services/openrouter.service.ts`:

```typescript
import type { SupabaseClient } from "../../db/supabase.client";
import { logger } from "../utils/logger";
import type { AuthorDto } from "../../types";

interface RecommendationResult {
  book: {
    title: string;
    language: string;
    authors: AuthorDto[];
  };
  plot_summary: string;
  rationale: string;
}

export class OpenRouterService {
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly defaultModel: string;
  
  // Public configuration options
  public maxTokens: number = 1000;
  public temperature: number = 0.7;

  constructor(private readonly supabase: SupabaseClient) {
    // Validate that required environment variables are present
    if (!import.meta.env.OPENROUTER_API_KEY) {
      logger.error("Missing OPENROUTER_API_KEY environment variable");
      throw new Error("OpenRouter API key is required");
    }
    
    this.apiKey = import.meta.env.OPENROUTER_API_KEY;
    this.apiUrl = import.meta.env.OPENROUTER_API_URL || "https://openrouter.ai/api/v1";
    this.defaultModel = import.meta.env.OPENROUTER_DEFAULT_MODEL || "openai/gpt-4o";
  }

  /**
   * Generates a book recommendation based on user preferences and reading history
   * @param userPreferences User's reading preferences
   * @param readBooks List of books the user has read
   * @param rejectedBooks List of books the user has rejected
   * @returns Recommendation result with book details, execution time, and model information
   */
  public async generateRecommendation(
    userPreferences: string,
    readBooks: string[],
    rejectedBooks: string[]
  ): Promise<{
    result: RecommendationResult;
    executionTime: number;
    model: string;
  }> {
    try {
      logger.info("Starting OpenRouter recommendation generation");
      
      const systemMessage = this.createSystemMessage(userPreferences);
      const userMessage = this.createUserMessage(readBooks, rejectedBooks);
      
      logger.info("Calling OpenRouter API");
      const result = await this.callOpenRouterAPI(systemMessage, userMessage);
      
      logger.info("OpenRouter recommendation generated successfully", {
        executionTime: result.executionTime,
        model: result.model
      });
      
      return result;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Creates a system message with instructions for the AI model
   * @param userPreferences User's reading preferences
   * @returns System message for OpenRouter API
   */
  private createSystemMessage(userPreferences: string): string {
    return `You are a book recommendation expert. Your task is to recommend a single book based on the user's reading preferences and history.
    
User preferences: ${userPreferences}

Provide recommendations that align with these preferences while avoiding books the user has already read or rejected.
Your recommendation should be thoughtful and include a compelling rationale.`;
  }

  /**
   * Creates a user message with context about read and rejected books
   * @param readBooks List of books the user has read
   * @param rejectedBooks List of books the user has rejected
   * @returns User message for OpenRouter API
   */
  private createUserMessage(readBooks: string[], rejectedBooks: string[]): string {
    let message = "Please recommend a book for me based on my preferences.";
    
    if (readBooks.length > 0) {
      message += `\n\nBooks I've already read: ${readBooks.join(", ")}`;
    }
    
    if (rejectedBooks.length > 0) {
      message += `\n\nBooks I'm not interested in: ${rejectedBooks.join(", ")}`;
    }
    
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
                  description: "The title of the recommended book"
                },
                language: {
                  type: "string",
                  description: "The language of the book (ISO code, e.g., 'en')"
                },
                authors: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: {
                        type: "string",
                        description: "Full name of the author"
                      }
                    },
                    required: ["name"]
                  },
                  description: "List of authors of the book"
                }
              },
              required: ["title", "language", "authors"],
              description: "Details about the recommended book"
            },
            plot_summary: {
              type: "string",
              description: "A concise summary of the book's plot without spoilers"
            },
            rationale: {
              type: "string",
              description: "Explanation of why this book matches the user's preferences"
            }
          },
          required: ["book", "plot_summary", "rationale"],
          additionalProperties: false
        }
      }
    };
  }

  /**
   * Makes a request to the OpenRouter API
   * @param systemMessage System message for the AI
   * @param userMessage User message for the AI
   * @returns API response with recommendation data
   */
  private async callOpenRouterAPI(systemMessage: string, userMessage: string): Promise<any> {
    const startTime = performance.now();
    
    try {
      const response = await fetch(`${this.apiUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': import.meta.env.SITE_URL || 'https://yourapplication.com',
          'X-Title': import.meta.env.SITE_TITLE || 'Book Recommendation App'
        },
        body: JSON.stringify({
          model: this.defaultModel,
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: userMessage }
          ],
          response_format: this.createResponseFormat(),
          max_tokens: this.maxTokens,
          temperature: this.temperature
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        logger.error("OpenRouter API error", { 
          status: response.status, 
          error: errorData 
        });
        throw new Error(`OpenRouter API error: ${response.status} ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      const executionTime = (performance.now() - startTime) / 1000; // Convert to seconds
      
      return {
        result: JSON.parse(data.choices[0].message.content),
        executionTime,
        model: data.model
      };
    } catch (error) {
      logger.error("Error calling OpenRouter API", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
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
        stack: error.stack
      });
      return error;
    }
    
    const genericError = new Error("Unknown error in OpenRouter service");
    logger.error("Unknown OpenRouter service error", { error });
    return genericError;
  }
}
```

### Step 3: Update RecommendationsService

1. Modify `src/lib/services/recommendations.service.ts` to use the new OpenRouterService:

```typescript
import { OpenRouterService } from "./openrouter.service";

export class RecommendationsService {
  private openRouterService: OpenRouterService;

  constructor(private readonly supabase: SupabaseClient) {
    this.openRouterService = new OpenRouterService(supabase);
  }

  // Update the generateRecommendation method to use OpenRouterService
  public async generateRecommendation(): Promise<RecommendationResponseDto> {
    // Existing code to fetch user preferences and books...
    
    // Replace AIService call with OpenRouterService
    const { result, executionTime, model } = await this.openRouterService.generateRecommendation(
      preferences.reading_preferences,
      readBooks?.map((b) => b.book_id) || [],
      rejectedBooks?.map((b) => b.book_id) || []
    );
    
    // Rest of the existing code...
  }
}
```

### Step 4: Create Tests

1. Create unit tests in `src/lib/services/__tests__/openrouter.service.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpenRouterService } from '../openrouter.service';

// Mock setup...

describe('OpenRouterService', () => {
  let service: OpenRouterService;
  
  beforeEach(() => {
    // Setup mocks and service instance
  });
  
  it('should generate a recommendation successfully', async () => {
    // Test implementation
  });
  
  it('should handle API errors gracefully', async () => {
    // Test implementation
  });
  
  // Additional tests...
});
```

### Step 5: Documentation

1. Add JSDoc comments to all methods
2. Create usage examples
3. Document environment variables in README.md

### Step 6: Deployment

1. Add environment variables to production environment
2. Deploy updated service
3. Monitor for errors and performance issues

### Step 7: Validation

1. Test the service with various inputs
2. Verify error handling
3. Optimize performance if needed 