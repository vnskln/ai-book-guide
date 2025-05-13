import type { Tables } from "./db/database.types";
import type { SupabaseClient } from "./db/supabase.client";

// Common types and interfaces

/**
 * Pagination information for paginated responses
 */
export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

/**
 * Generic paginated response structure
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

/**
 * Author information as returned in responses
 */
export interface AuthorDto {
  id: string;
  name: string;
}

/**
 * Author input for creating books
 */
export interface AuthorInput {
  name: string;
}

// User Preferences DTOs

/**
 * User preferences response DTO
 */
export type UserPreferencesResponseDto = Tables<"user_preferences">;

/**
 * DTO for creating user preferences
 */
export interface CreateUserPreferencesDto {
  reading_preferences: string;
  preferred_language: string;
}

/**
 * DTO for updating user preferences
 */
export type UpdateUserPreferencesDto = CreateUserPreferencesDto;

// Book DTOs

/**
 * Book with authors information
 */
export interface BookWithAuthorsDto {
  id: string;
  title: string;
  language: string;
  authors: AuthorDto[];
  created_at: string;
  rating?: boolean | null;
}

/**
 * Paginated response for books
 */
export type BookPaginatedResponseDto = PaginatedResponse<BookWithAuthorsDto>;

/**
 * DTO for creating a new book
 */
export interface CreateBookDto {
  title: string;
  language: string;
  authors: AuthorInput[];
}

// User Books DTOs

/**
 * User book response DTO
 */
export interface UserBookResponseDto {
  id: string;
  book_id: string;
  title: string;
  language: string;
  authors: AuthorDto[];
  status: UserBookStatus;
  is_recommended: boolean;
  rating: boolean | null;
  recommendation_id: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Paginated response for user books
 */
export type UserBookPaginatedResponseDto = PaginatedResponse<UserBookResponseDto>;

/**
 * DTO for adding a book to user's collection
 */
export interface CreateUserBookDto {
  book: {
    title: string;
    language: string;
    authors: AuthorInput[];
  };
  status: UserBookStatus;
  rating?: boolean | null; // Required if status is 'read'
  recommendation_id?: string | null;
}

/**
 * DTO for updating a book in user's collection
 */
export interface UpdateUserBookDto {
  status: UserBookStatus;
  rating?: boolean | null; // Required if status is 'read'
}

// Recommendation DTOs

/**
 * Recommendation response DTO with book details
 */
export interface RecommendationResponseDto {
  id: string;
  book: {
    id: string;
    title: string;
    language: string;
    authors: AuthorDto[];
  };
  plot_summary: string;
  rationale: string;
  ai_model: string;
  execution_time: number;
  status: RecommendationStatus;
  created_at: string;
  updated_at?: string;
}

/**
 * Paginated response for recommendations
 */
export type RecommendationPaginatedResponseDto = PaginatedResponse<RecommendationResponseDto>;

/**
 * DTO for updating recommendation status
 */
export interface UpdateRecommendationStatusDto {
  status: RecommendationStatus;
}

/**
 * Result from OpenRouter API for book recommendations
 */
export interface RecommendationResult {
  book: {
    title: string;
    language: string;
    authors: AuthorDto[];
  };
  plot_summary: string;
  rationale: string;
}

// Book-Author relationship types

/**
 * Represents a book-author relationship
 */
export interface BookAuthorRelationship {
  book_id: string;
  author_id: string;
}

// Enums for validation

/**
 * Valid statuses for user books
 */
export enum UserBookStatus {
  READ = "read",
  TO_READ = "to_read",
  REJECTED = "rejected",
}

/**
 * Valid statuses for recommendations
 */
export enum RecommendationStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  NEW = "new",
}

declare module "astro" {
  interface Locals {
    supabase: SupabaseClient;
    user?: {
      id: string;
      email: string | undefined;
    };
  }
}
