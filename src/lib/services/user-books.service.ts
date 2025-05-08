import type { SupabaseClient } from "../../db/supabase.client";
import type { CreateUserBookSchemaType } from "../schemas/user-books.schema";
import type { UserBookResponseDto, UserBookPaginatedResponseDto, PaginationInfo, AuthorDto } from "../../types";
import { UserBookStatus } from "../../types";
import type { GetUserBooksQuery } from "../schemas/user-books.schema";
import { NotFoundError, InternalServerError } from "../errors";

export class UserBooksService {
  constructor(private readonly supabase: SupabaseClient) {}

  async createUserBook(userId: string, data: CreateUserBookSchemaType): Promise<UserBookResponseDto> {
    // First, check if the book already exists
    const { data: existingBooks, error: searchError } = await this.supabase
      .from("books")
      .select("id")
      .eq("title", data.book.title)
      .eq("language", data.book.language)
      .single();

    if (searchError && searchError.code !== "PGRST116") {
      throw new Error(`Error searching for book: ${searchError.message}`);
    }

    let bookId: string;

    if (!existingBooks) {
      // Create new book
      const { data: newBook, error: bookError } = await this.supabase
        .from("books")
        .insert({
          title: data.book.title,
          language: data.book.language,
        })
        .select()
        .single();

      if (bookError) throw new Error(`Error creating book: ${bookError.message}`);
      if (!newBook) throw new Error("No book data returned after creation");

      bookId = newBook.id;

      // Create authors and book_authors relationships
      for (const author of data.book.authors) {
        const { data: newAuthor, error: authorError } = await this.supabase
          .from("authors")
          .insert({ name: author.name })
          .select()
          .single();

        if (authorError) throw new Error(`Error creating author: ${authorError.message}`);
        if (!newAuthor) throw new Error("No author data returned after creation");

        const { error: relationError } = await this.supabase.from("book_authors").insert({
          book_id: bookId,
          author_id: newAuthor.id,
        });

        if (relationError) throw new Error(`Error creating book-author relation: ${relationError.message}`);
      }
    } else {
      bookId = existingBooks.id;
    }

    // Check if user already has this book
    const { data: existingUserBook } = await this.supabase
      .from("user_books")
      .select()
      .eq("user_id", userId)
      .eq("book_id", bookId)
      .single();

    if (existingUserBook) {
      throw new Error("Book already exists in user's collection");
    }

    // Create user book entry
    const { data: userBook, error: userBookError } = await this.supabase
      .from("user_books")
      .insert({
        user_id: userId,
        book_id: bookId,
        status: data.status as UserBookStatus,
        rating: data.rating,
        recommendation_id: data.recommendation_id,
        is_recommended: !!data.recommendation_id,
      })
      .select(
        `
        id,
        book_id,
        status,
        is_recommended,
        rating,
        recommendation_id,
        created_at,
        updated_at,
        books:book_id (
          title,
          language,
          book_authors (
            authors:author_id (
              id,
              name
            )
          )
        )
      `
      )
      .single();

    if (userBookError) throw new Error(`Error creating user book: ${userBookError.message}`);
    if (!userBook) throw new Error("No user book data returned after creation");

    // Transform response to match DTO
    return {
      id: userBook.id,
      book_id: userBook.book_id,
      title: userBook.books.title,
      language: userBook.books.language,
      authors: userBook.books.book_authors.map((ba: any) => ba.authors),
      status: userBook.status as UserBookStatus,
      is_recommended: userBook.is_recommended,
      rating: userBook.rating,
      recommendation_id: userBook.recommendation_id,
      created_at: userBook.created_at,
      updated_at: userBook.updated_at,
    };
  }

  async getUserBooks(userId: string, query: GetUserBooksQuery): Promise<UserBookPaginatedResponseDto> {
    const { status, is_recommended, page, limit } = query;

    // Prepare base query
    let baseQuery = this.supabase
      .from("user_books")
      .select(
        `
        id,
        book_id,
        status,
        is_recommended,
        rating,
        recommendation_id,
        created_at,
        updated_at,
        books:book_id (
          id,
          title,
          language,
          book_authors!inner (
            authors!inner (
              id,
              name
            )
          )
        )
      `,
        { count: "exact" }
      )
      .eq("user_id", userId);

    // Add optional filters
    if (status) {
      baseQuery = baseQuery.eq("status", status);
    }

    if (is_recommended !== undefined) {
      baseQuery = baseQuery.eq("is_recommended", is_recommended);
    }

    // Calculate pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Execute query with pagination
    const { data, error, count } = await baseQuery.range(from, to).order("created_at", { ascending: false });

    if (error) {
      throw new InternalServerError(`Error fetching user books: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundError("No books found");
    }

    // Transform data to response format
    const userBooks: UserBookResponseDto[] = data.map((item) => {
      const authors: AuthorDto[] = item.books.book_authors.map((ba) => ba.authors);

      return {
        id: item.id,
        book_id: item.book_id,
        title: item.books.title,
        language: item.books.language,
        authors,
        status: item.status,
        is_recommended: item.is_recommended,
        rating: item.rating,
        recommendation_id: item.recommendation_id,
        created_at: item.created_at,
        updated_at: item.updated_at,
      };
    });

    // Prepare pagination info
    const pagination: PaginationInfo = {
      total: count || 0,
      page,
      limit,
      total_pages: Math.ceil((count || 0) / limit),
    };

    return {
      data: userBooks,
      pagination,
    };
  }
}
