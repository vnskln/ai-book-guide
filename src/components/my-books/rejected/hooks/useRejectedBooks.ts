import { useState, useEffect } from "react";
import type { UserBookResponseDto, UserBookPaginatedResponseDto, PaginationInfo } from "@/types";
import { UserBookStatus } from "@/types";

interface UseRejectedBooksResult {
  books: UserBookResponseDto[];
  isLoading: boolean;
  error: Error | null;
  pagination: PaginationInfo;
  fetchBooks: (page?: number, limit?: number) => Promise<void>;
  deleteBook: (id: string) => Promise<boolean>;
  moveToRead: (id: string) => Promise<boolean>;
}

export function useRejectedBooks(): UseRejectedBooksResult {
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
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/user-books?status=rejected&page=${page}&limit=${limit}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: UserBookPaginatedResponseDto = await response.json();
      setBooks(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch books"));
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBook = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/user-books?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update local state by removing the deleted book
      setBooks((prevBooks) => prevBooks.filter((book) => book.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to delete book"));
      return false;
    }
  };

  const moveToRead = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/user-books?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: UserBookStatus.TO_READ,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Update local state by removing the moved book
      setBooks((prevBooks) => prevBooks.filter((book) => book.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to move book"));
      return false;
    }
  };

  // Fetch books on component mount
  useEffect(() => {
    fetchBooks();
  }, []);

  return {
    books,
    isLoading,
    error,
    pagination,
    fetchBooks,
    deleteBook,
    moveToRead,
  };
}
