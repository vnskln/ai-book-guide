import type { AuthorDto } from "../../types";

interface MockRecommendationResult {
  book: {
    title: string;
    language: string;
    authors: AuthorDto[];
  };
  plot_summary: string;
  rationale: string;
}

export class AIService {
  private static readonly MOCK_RECOMMENDATIONS: MockRecommendationResult[] = [
    {
      book: {
        title: "The Shadow of the Wind",
        language: "en",
        authors: [{ id: "a1b2c3d4", name: "Carlos Ruiz Zafón" }],
      },
      plot_summary: "In post-war Barcelona, young Daniel discovers a mysterious book that changes his life forever...",
      rationale: "Based on your interest in atmospheric literary fiction and historical mysteries...",
    },
    {
      book: {
        title: "Project Hail Mary",
        language: "en",
        authors: [{ id: "e5f6g7h8", name: "Andy Weir" }],
      },
      plot_summary: "A lone astronaut must save humanity from extinction while dealing with memory loss...",
      rationale: "Given your preference for science fiction with detailed scientific accuracy...",
    },
  ];

  private static readonly MOCK_EXECUTION_TIME = 2.5; // seconds
  private static readonly MOCK_AI_MODEL = "gpt-4-turbo-preview";

  /**
   * Generates a book recommendation based on user preferences and reading history
   * @param userPreferences User's reading preferences
   * @param readBooks List of books the user has read
   * @param rejectedBooks List of books the user has rejected
   * @returns Mock recommendation result
   */
  public async generateRecommendation(
    userPreferences: string,
    readBooks: string[],
    rejectedBooks: string[]
  ): Promise<{
    result: MockRecommendationResult;
    executionTime: number;
    model: string;
  }> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Randomly select a mock recommendation
    const randomIndex = Math.floor(Math.random() * AIService.MOCK_RECOMMENDATIONS.length);
    const mockRecommendation = AIService.MOCK_RECOMMENDATIONS[randomIndex];

    return {
      result: mockRecommendation,
      executionTime: AIService.MOCK_EXECUTION_TIME,
      model: AIService.MOCK_AI_MODEL,
    };
  }
}
