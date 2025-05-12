import type { SupabaseClient } from "../../db/supabase.client";
import type { CreateUserBookSchemaType, UpdateUserBookSchemaType } from "../schemas/user-books.schema";
import type { UserBookResponseDto, UserBookPaginatedResponseDto, AuthorDto } from "../../types";
import { UserBookStatus } from "../../types";
import type { GetUserBooksQuery } from "../schemas/user-books.schema";
import { NotFoundError, InternalServerError, ForbiddenError } from "../errors";

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
    const { status, is_recommended, page = 1, limit = 20 } = query;

    // Prepare base query with left joins
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
          book_authors!left (
            authors!left (
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

    // Transform data to response format
    const userBooks: UserBookResponseDto[] = data.map((item) => {
      const authors: AuthorDto[] = item.books.book_authors?.map((ba) => ba.authors).filter(Boolean) || [];

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

    // Calculate pagination info
    const total = count || 0;
    const total_pages = Math.ceil(total / limit);

    return {
      data: userBooks,
      pagination: {
        total,
        page,
        limit,
        total_pages,
      },
    };
  }

  async updateUserBook(
    userId: string,
    userBookId: string,
    data: UpdateUserBookSchemaType
  ): Promise<UserBookResponseDto> {
    // First verify book ownership
    const { data: existingBook, error: findError } = await this.supabase
      .from("user_books")
      .select("id")
      .eq("id", userBookId)
      .eq("user_id", userId)
      .single();

    if (findError) {
      throw new Error(`Error verifying book ownership: ${findError.code} - ${findError.message}`);
    }

    if (!existingBook) {
      throw new NotFoundError(`Book with ID ${userBookId} not found in user's collection`);
    }

    // Update the book and fetch updated data with authors
    const { data: updatedBook, error: updateError } = await this.supabase
      .from("user_books")
      .update({
        status: data.status,
        rating: data.rating,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userBookId)
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
            authors (
              id,
              name
            )
          )
        )
      `
      )
      .single();

    if (updateError) {
      throw new Error(`Failed to update book: ${updateError.code} - ${updateError.message}`);
    }

    if (!updatedBook) {
      throw new Error(`Book was updated but no data was returned. This might indicate a database inconsistency.`);
    }

    try {
      // Transform the data to match UserBookResponseDto
      return {
        id: updatedBook.id,
        book_id: updatedBook.book_id,
        title: updatedBook.books.title,
        language: updatedBook.books.language,
        authors: updatedBook.books.book_authors.map((a) => a.authors),
        status: updatedBook.status as UserBookStatus,
        is_recommended: updatedBook.is_recommended,
        rating: updatedBook.rating,
        recommendation_id: updatedBook.recommendation_id,
        created_at: updatedBook.created_at,
        updated_at: updatedBook.updated_at,
      };
    } catch (error) {
      throw new Error(`Error transforming book data: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async deleteUserBook(userId: string, userBookId: string): Promise<void> {
    // Check if book exists and belongs to user
    const { data: userBook, error: findError } = await this.supabase
      .from("user_books")
      .select("id, user_id")
      .eq("id", userBookId)
      .single();

    if (findError) {
      if (findError.code === "PGRST116") {
        throw new NotFoundError(`Book with ID ${userBookId} not found in user's collection`);
      }
      throw new Error(`Error verifying book ownership: ${findError.code} - ${findError.message}`);
    }

    if (!userBook) {
      throw new NotFoundError(`Book with ID ${userBookId} not found in user's collection`);
    }

    if (userBook.user_id !== userId) {
      throw new ForbiddenError("User does not own this book");
    }

    // Delete book from user's collection
    const { error: deleteError } = await this.supabase.from("user_books").delete().eq("id", userBookId);

    if (deleteError) {
      throw new Error(`Failed to delete book: ${deleteError.code} - ${deleteError.message}`);
    }
  }

  async createUserBookFromRecommendation(userId: string, recommendationId: string): Promise<UserBookResponseDto> {
    // First, get the recommendation details
    const { data: recommendation, error: recommendationError } = await this.supabase
      .from("recommendations")
      .select(
        `
        book_id,
        books:book_id (
          title,
          language,
          book_authors (
            authors (
              id,
              name
            )
          )
        )
      `
      )
      .eq("id", recommendationId)
      .single();

    if (recommendationError) {
      throw new Error(`Error fetching recommendation: ${recommendationError.message}`);
    }

    if (!recommendation) {
      throw new NotFoundError(`Recommendation with ID ${recommendationId} not found`);
    }

    // Check if user already has this book
    const { data: existingUserBook } = await this.supabase
      .from("user_books")
      .select()
      .eq("user_id", userId)
      .eq("book_id", recommendation.book_id)
      .single();

    if (existingUserBook) {
      throw new Error("Book already exists in user's collection");
    }

    // Create user book entry
    const { data: userBook, error: userBookError } = await this.supabase
      .from("user_books")
      .insert({
        user_id: userId,
        book_id: recommendation.book_id,
        status: UserBookStatus.TO_READ,
        is_recommended: true,
        recommendation_id: recommendationId,
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
            authors (
              id,
              name
            )
          )
        )
      `
      )
      .single();

    if (userBookError) {
      throw new Error(`Error creating user book: ${userBookError.message}`);
    }

    if (!userBook) {
      throw new Error("No user book data returned after creation");
    }

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
}
