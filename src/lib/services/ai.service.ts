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
    {
      book: {
        title: "The Seven Husbands of Evelyn Hugo",
        language: "en",
        authors: [{ id: "i9j0k1l2", name: "Taylor Jenkins Reid" }],
      },
      plot_summary:
        "An aging Hollywood starlet reveals her life story to an unknown journalist, unraveling decades of secrets...",
      rationale:
        "Based on your interest in character-driven narratives and historical fiction with strong female protagonists...",
    },
    {
      book: {
        title: "Klara and the Sun",
        language: "en",
        authors: [{ id: "m3n4o5p6", name: "Kazuo Ishiguro" }],
      },
      plot_summary: "An Artificial Friend observes the human world while exploring what it means to love...",
      rationale: "Given your appreciation for literary science fiction that explores philosophical themes...",
    },
    {
      book: {
        title: "The Invisible Life of Addie LaRue",
        language: "en",
        authors: [{ id: "q7r8s9t0", name: "V.E. Schwab" }],
      },
      plot_summary:
        "A woman makes a Faustian bargain to live forever but is cursed to be forgotten by everyone she meets...",
      rationale: "Based on your interest in fantasy with historical elements and complex character development...",
    },
    {
      book: {
        title: "Tomorrow, and Tomorrow, and Tomorrow",
        language: "en",
        authors: [{ id: "u1v2w3x4", name: "Gabrielle Zevin" }],
      },
      plot_summary:
        "A decades-spanning story about friendship, love, and creativity through the lens of video game development...",
      rationale: "Given your interest in contemporary fiction that explores technology and creative partnerships...",
    },
    {
      book: {
        title: "Mexican Gothic",
        language: "en",
        authors: [{ id: "y5z6a7b8", name: "Silvia Moreno-Garcia" }],
      },
      plot_summary: "A young woman investigates mysterious happenings at a remote mansion in 1950s Mexico...",
      rationale: "Based on your enjoyment of atmospheric horror and gothic literature with cultural elements...",
    },
    {
      book: {
        title: "A Gentleman in Moscow",
        language: "en",
        authors: [{ id: "c9d0e1f2", name: "Amor Towles" }],
      },
      plot_summary: "A Russian aristocrat is sentenced to house arrest in a luxury hotel across from the Kremlin...",
      rationale: "Given your appreciation for historical fiction with wit and elegant prose...",
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
