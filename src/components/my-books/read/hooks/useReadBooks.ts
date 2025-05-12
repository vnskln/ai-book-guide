import { useState, useEffect } from "react";
import type { UserBookResponseDto, UserBookPaginatedResponseDto, CreateUserBookDto, PaginationInfo } from "@/types";

export function useReadBooks() {
  const [books, setBooks] = useState<UserBookResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 20,
    total_pages: 0,
  });

  const fetchBooks = async (page = 1, limit = 20) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/user-books?status=read&page=${page}&limit=${limit}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error fetching books");
      }
      const data: UserBookPaginatedResponseDto = await response.json();
      setBooks(data.data);
      setPagination(data.pagination);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  const addBook = async (bookData: CreateUserBookDto) => {
    try {
      const response = await fetch("/api/user-books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error adding book");
      }

      await fetchBooks(pagination.page, pagination.limit);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      return false;
    }
  };

  const deleteBook = async (id: string) => {
    try {
      const response = await fetch(`/api/user-books?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error deleting book");
      }

      await fetchBooks(pagination.page, pagination.limit);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      return false;
    }
  };

  const updateRating = async (id: string, rating: boolean) => {
    try {
      const response = await fetch(`/api/user-books?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "read",
          rating,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error updating rating");
      }

      setBooks((prevBooks) => prevBooks.map((book) => (book.id === id ? { ...book, rating } : book)));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
      return false;
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  return {
    books,
    isLoading,
    error,
    pagination,
    fetchBooks,
    addBook,
    deleteBook,
    updateRating,
  };
}
