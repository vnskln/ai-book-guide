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
      plot_summary:
        "In post-war Barcelona, young Daniel Sempere is taken by his father to the Cemetery of Forgotten Books, a labyrinthine library of obscure titles. There, he discovers 'The Shadow of the Wind' by Julián Carax. Entranced by the novel, Daniel sets out to find Carax's other works, only to discover that someone has been systematically destroying every copy of every book the author has ever written. A mysterious figure who calls himself Laín Coubert—the name of a character from Carax's novel who happens to be the Devil—is determined to burn every remaining copy. Daniel's seemingly innocent quest opens a door into one of Barcelona's darkest secrets, an epic story of murder, madness, and doomed love that someone will go to any lengths to keep buried.",
      rationale:
        "Based on your interest in atmospheric literary fiction and historical mysteries, 'The Shadow of the Wind' would be an excellent choice. The novel masterfully combines elements you've enjoyed in your previous readings: intricate plotting, rich historical settings, and a deep love for literature itself. The story's Gothic undertones and the way it weaves together multiple timelines should appeal to your appreciation for complex narratives. The post-Civil War Barcelona setting provides a haunting backdrop that enhances the mystery, while the author's lyrical prose style and attention to architectural detail create an immersive reading experience. The book-within-a-book structure and the theme of literature's power to transform lives align with your stated interest in meta-narratives and stories about the power of storytelling.",
    },
    {
      book: {
        title: "Project Hail Mary",
        language: "en",
        authors: [{ id: "e5f6g7h8", name: "Andy Weir" }],
      },
      plot_summary:
        "Ryland Grace awakens on a small spacecraft with no memory of who he is or why he's there. As his memories gradually return, he realizes he's the sole survivor of a desperate mission to save Earth from an extinction-level threat: a mysterious microorganism consuming the Sun's energy. Alone millions of light years from home, Grace must use his scientific expertise to find a solution. When he discovers another ship orbiting a nearby star, he encounters an alien scientist named Rocky who becomes an unlikely ally. Together, they race against time to solve the mystery of the microorganism and find a way to save not just Earth, but Rocky's home planet as well. Through their collaboration, they must overcome language barriers, biological differences, and the harsh realities of space to unlock the secret of this interstellar threat.",
      rationale:
        "Given your preference for science fiction with detailed scientific accuracy and problem-solving elements, 'Project Hail Mary' is an ideal recommendation. The book combines the hard science approach you enjoyed in previous readings with a deeply human story of survival and cooperation. The author's background in scientific research shines through in the meticulously researched details about physics, biology, and space travel, while maintaining accessibility for general readers. The novel's focus on scientific methodology and creative problem-solving mirrors your interest in works that showcase human ingenuity. The unique alien interaction and communication challenges present fascinating linguistic and cultural elements that align with your appreciation for thoughtful exploration of first contact scenarios.",
    },
    {
      book: {
        title: "The Seven Husbands of Evelyn Hugo",
        language: "en",
        authors: [{ id: "i9j0k1l2", name: "Taylor Jenkins Reid" }],
      },
      plot_summary:
        "Aging Hollywood icon Evelyn Hugo finally breaks her silence and chooses unknown journalist Monique Grant to write her life story. Through a series of intimate interviews, Evelyn recounts her journey from a Cuban immigrant in Hell's Kitchen to one of Hollywood's brightest stars of the 1950s and 60s. The story unfolds through the lens of her seven marriages, each playing a distinct role in her rise to fame. As Evelyn reveals the ambition, unexpected friendships, and great forbidden love that shaped her career, Monique begins to feel a very real connection to the legendary actress. But as Evelyn's story catches up with the present, it becomes clear that her life intersects with Monique's own in tragic and irreversible ways, forcing both women to confront the truth about their past decisions.",
      rationale:
        "Based on your interest in character-driven narratives and historical fiction with strong female protagonists, 'The Seven Husbands of Evelyn Hugo' offers a compelling blend of Old Hollywood glamour and intimate personal drama. The novel's exploration of identity, ambition, and the price of fame aligns with your preference for complex character studies. The dual timeline structure and the way it examines how past decisions echo through generations should appeal to your appreciation for multilayered storytelling. The book's unflinching look at sexuality, race, and gender in mid-century Hollywood, combined with its exploration of the masks we wear in public versus private life, provides the kind of nuanced social commentary you've enjoyed in previous readings.",
    },
    {
      book: {
        title: "Klara and the Sun",
        language: "en",
        authors: [{ id: "m3n4o5p6", name: "Kazuo Ishiguro" }],
      },
      plot_summary:
        "Klara is an Artificial Friend with outstanding observational qualities, who, from her place in the store, watches carefully the behavior of those who come in to browse, and of those who pass on the street outside. She remains hopeful that a customer will soon choose her. When the possibility emerges that her circumstances may change forever, Klara is warned not to invest too much in the promises of humans. As Klara is finally chosen by a family and enters their home as a companion for their sickly daughter Josie, she strives to understand the complex emotions and relationships around her. Through her unique perspective, we see a near-future world where artificial beings serve as companions to humans, while grappling with questions about love, faith, and what it truly means to be human.",
      rationale:
        "Given your appreciation for literary science fiction that explores philosophical themes, 'Klara and the Sun' represents a perfect blend of speculative elements and deep human insight. The novel's gentle yet profound examination of consciousness, faith, and the nature of love aligns with your interest in works that use science fiction as a lens to explore fundamental questions about humanity. Ishiguro's masterful use of an AI narrator to observe and interpret human behavior offers a unique perspective that should appeal to your enjoyment of unconventional storytelling approaches. The book's subtle world-building and focus on emotional resonance rather than technological details matches your preference for character-driven narratives that prioritize philosophical depth over hard science fiction elements.",
    },
    {
      book: {
        title: "The Invisible Life of Addie LaRue",
        language: "en",
        authors: [{ id: "q7r8s9t0", name: "V.E. Schwab" }],
      },
      plot_summary:
        "In 1714 France, a desperate young woman makes a Faustian bargain to live forever but is cursed to be forgotten by everyone she meets. Thus begins the extraordinary life of Addie LaRue, and a dazzling adventure that will play out across centuries and continents, across history and art, as she learns how far she will go to leave her mark on the world. But everything changes when, after nearly 300 years, Addie stumbles across a young man in a hidden bookstore who remembers her name. As the story moves between past and present, following Addie's journey through history and her current life in modern-day New York, we discover how she has influenced art and culture while struggling with her curse, and what happens when the possibility of being remembered finally presents itself.",
      rationale:
        "Based on your interest in fantasy with historical elements and complex character development, 'The Invisible Life of Addie LaRue' offers a unique blend of historical fiction, fantasy, and philosophical exploration. The novel's examination of memory, identity, and the impact we leave on the world aligns perfectly with your appreciation for stories that tackle existential themes. The way the narrative weaves through different historical periods while maintaining intimate character focus should appeal to your enjoyment of both historical detail and personal storytelling. The book's exploration of art, literature, and the nature of legacy, combined with its innovative take on immortality tropes, provides the kind of thoughtful and original fantasy storytelling you've favored in your reading history.",
    },
    {
      book: {
        title: "Tomorrow, and Tomorrow, and Tomorrow",
        language: "en",
        authors: [{ id: "u1v2w3x4", name: "Gabrielle Zevin" }],
      },
      plot_summary:
        "Sam Masur and Sadie Green first meet as children in a hospital gaming room. Years later, they reconnect as college students and begin collaborating on video games, launching their careers with a wildly successful game called 'Ichigo.' Their creative partnership spans three decades, through success and failure, love and loss, as they push the boundaries of what games can be. The story follows their complex relationship as creative partners, friends, and almost-lovers, while exploring themes of identity, disability, creativity, and the blurred lines between virtual and real worlds. As they navigate the competitive gaming industry, personal tragedies, and their own complicated feelings for each other, Sam and Sadie must confront what success really means and what they're willing to sacrifice for their art.",
      rationale:
        "Given your interest in contemporary fiction that explores technology and creative partnerships, 'Tomorrow, and Tomorrow, and Tomorrow' offers a unique perspective on art, friendship, and the gaming industry. The novel's deep dive into the creative process and the intersection of technology with storytelling aligns with your appreciation for works that examine how art is made. The complex, non-linear relationship between the protagonists should appeal to your preference for stories that defy conventional romantic narratives. The book's exploration of virtual worlds, identity, and the ways we connect through technology provides thoughtful commentary on contemporary culture while maintaining strong character development, elements you've enjoyed in previous readings.",
    },
    {
      book: {
        title: "Mexican Gothic",
        language: "en",
        authors: [{ id: "y5z6a7b8", name: "Silvia Moreno-Garcia" }],
      },
      plot_summary:
        "In the 1950s, Noemí Taboada, a young Mexican socialite, receives a frantic letter from her newly-wed cousin begging for someone to save her from a mysterious doom at High Place, a distant house in the Mexican countryside. Noemí heads to High Place, a remote mansion in the mountains of Hidalgo, to investigate her cousin's claims of supernatural horrors. She finds her cousin in a drugged, paranoid state while the family's mysterious English patriarch and his young son exert an increasingly sinister influence. As Noemí delves deeper into the house's dark secrets, she uncovers stories of violence and madness. The walls are filled with fungi and mold, her dreams become increasingly disturbing, and she discovers that the family's past involves a horrifying history of colonialism, eugenics, and ritualistic sacrifice that still haunts the present.",
      rationale:
        "Based on your enjoyment of atmospheric horror and gothic literature with cultural elements, 'Mexican Gothic' offers a fresh take on classic gothic tropes through a postcolonial lens. The novel's rich atmospheric details and slow-building psychological horror align with your preference for sophisticated horror that prioritizes dread over shock value. The way it combines traditional gothic elements with Mexican history and culture should appeal to your interest in works that challenge and reinvent genre conventions. The book's exploration of themes like colonialism, patriarchy, and generational trauma, all while maintaining a gripping supernatural mystery, provides the kind of intellectually engaging horror you've appreciated in your previous reading choices.",
    },
    {
      book: {
        title: "A Gentleman in Moscow",
        language: "en",
        authors: [{ id: "c9d0e1f2", name: "Amor Towles" }],
      },
      plot_summary:
        "In 1922, Count Alexander Rostov is deemed an unrepentant aristocrat by a Bolshevik tribunal and is sentenced to house arrest in the Metropol, a grand hotel across the street from the Kremlin. Once one of the most influential men in Russia, the Count must now live in an attic room while some of the most tumultuous decades in Russian history unfold outside the hotel's doors. Unexpectedly, his reduced circumstances provide him entry into a much larger world of emotional discovery. As he builds a new life within the hotel's walls, he encounters an array of characters: a temperamental chef, a precocious young girl, a famous actress, and many others who change his life in profound ways. Through these relationships and his own philosophical observations, the Count witnesses the transformation of Russian society while never leaving the hotel.",
      rationale:
        "Given your appreciation for historical fiction with wit and elegant prose, 'A Gentleman in Moscow' offers a masterful blend of historical detail and character study. The novel's exploration of how one man creates a rich life within confined circumstances aligns with your interest in stories about human resilience and adaptation. The author's sophisticated writing style and subtle humor should appeal to your preference for literary fiction that balances intellectual depth with entertainment. The book's examination of Russian history through the microcosm of a luxury hotel, combined with its meditation on the nature of purpose and community, provides the kind of thoughtful historical fiction you've enjoyed in your previous readings.",
    },
  ];

  private static readonly MOCK_EXECUTION_TIME = 2.5; // seconds
  private static readonly MOCK_AI_MODEL = "gpt-4-turbo-preview";

  /**
   * Generates a book recommendation based on user preferences and reading history
   * Note: In this mock implementation, the parameters are not used
   * @param userPreferences User's reading preferences
   * @param readBooks List of books the user has read
   * @param rejectedBooks List of books the user has rejected
   * @returns Mock recommendation result
   */
  public async generateRecommendation(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    userPreferences: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    readBooks: string[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    rejectedBooks: string[]
  ): Promise<{
    result: MockRecommendationResult;
    executionTime: number;
    model: string;
  }> {
    // Generate random delay between 3 and 10 seconds
    const delaySeconds = Math.random() * (10 - 3) + 3;
    const delayMs = Math.floor(delaySeconds * 1000);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, delayMs));

    // Randomly select a mock recommendation
    const randomIndex = Math.floor(Math.random() * AIService.MOCK_RECOMMENDATIONS.length);
    const mockRecommendation = AIService.MOCK_RECOMMENDATIONS[randomIndex];

    return {
      result: mockRecommendation,
      executionTime: delaySeconds, // Use the actual delay time as execution time
      model: AIService.MOCK_AI_MODEL,
    };
  }
}
