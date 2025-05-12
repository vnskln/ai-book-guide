import { useState, useEffect } from "react";
import { UserBookStatus } from "@/types";
import type { UserBookPaginatedResponseDto, UserBookResponseDto, UpdateUserBookDto } from "@/types";

interface ToReadBooksViewModel {
  books: UserBookResponseDto[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
  selectedBook: UserBookResponseDto | null;
  showRatingModal: boolean;
  showConfirmationDialog: boolean;
  confirmationAction: "delete" | "reject" | null;
}

export const useToReadBooks = () => {
  const [viewModel, setViewModel] = useState<ToReadBooksViewModel>({
    books: [],
    isLoading: true,
    error: null,
    pagination: { total: 0, page: 1, limit: 20, total_pages: 0 },
    selectedBook: null,
    showRatingModal: false,
    showConfirmationDialog: false,
    confirmationAction: null,
  });

  const fetchBooks = async (page = 1, limit = 20) => {
    setViewModel((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await fetch(`/api/user-books?status=to_read&page=${page}&limit=${limit}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data: UserBookPaginatedResponseDto = await response.json();
      console.log("Fetched books:", data);
      setViewModel((prev) => ({
        ...prev,
        books: data.data,
        pagination: data.pagination,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error fetching books:", error);
      setViewModel((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Unknown error",
        isLoading: false,
      }));
    }
  };

  const updateBookStatus = async (bookId: string, newStatus: UserBookStatus, rating?: boolean) => {
    console.log("Updating book status:", { bookId, newStatus, rating });
    const updateData: UpdateUserBookDto = {
      status: newStatus,
      ...(newStatus === UserBookStatus.READ ? { rating } : {}),
    };
    try {
      const response = await fetch(`/api/user-books?id=${bookId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await fetchBooks(viewModel.pagination.page);
      return true;
    } catch (error) {
      console.error("Error updating book status:", error);
      setViewModel((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Unknown error",
      }));
      return false;
    }
  };

  const deleteBook = async (bookId: string) => {
    console.log("Deleting book:", bookId);
    try {
      const response = await fetch(`/api/user-books?id=${bookId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await fetchBooks(viewModel.pagination.page);
      return true;
    } catch (error) {
      console.error("Error deleting book:", error);
      setViewModel((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Unknown error",
      }));
      return false;
    }
  };

  // Modal and dialog handlers
  const openRatingModal = (book: UserBookResponseDto) => {
    console.log("Opening rating modal for book:", book);
    setViewModel((prev) => ({
      ...prev,
      selectedBook: book,
      showRatingModal: true,
    }));
  };

  const closeRatingModal = () => {
    console.log("Closing rating modal");
    setViewModel((prev) => ({
      ...prev,
      selectedBook: null,
      showRatingModal: false,
    }));
  };

  const confirmRating = async (bookId: string, rating: boolean) => {
    console.log("Confirming rating:", { bookId, rating });
    const success = await updateBookStatus(bookId, UserBookStatus.READ, rating);
    if (success) {
      closeRatingModal();
    }
  };

  const openConfirmationDialog = (book: UserBookResponseDto, action: "delete" | "reject") => {
    console.log("Opening confirmation dialog:", { book, action });
    setViewModel((prev) => ({
      ...prev,
      selectedBook: book,
      showConfirmationDialog: true,
      confirmationAction: action,
    }));
  };

  const closeConfirmationDialog = () => {
    console.log("Closing confirmation dialog");
    setViewModel((prev) => ({
      ...prev,
      selectedBook: null,
      showConfirmationDialog: false,
      confirmationAction: null,
    }));
  };

  const confirmAction = async () => {
    console.log("Confirming action:", { selectedBook: viewModel.selectedBook, action: viewModel.confirmationAction });
    if (!viewModel.selectedBook || !viewModel.confirmationAction) return;

    const success =
      viewModel.confirmationAction === "delete"
        ? await deleteBook(viewModel.selectedBook.id)
        : await updateBookStatus(viewModel.selectedBook.id, UserBookStatus.REJECTED);

    if (success) {
      closeConfirmationDialog();
    }
  };

  // Initial data fetch
  useEffect(() => {
    console.log("Initial fetch of books");
    fetchBooks();
  }, []);

  return {
    ...viewModel,
    fetchBooks,
    openRatingModal,
    closeRatingModal,
    confirmRating,
    openConfirmationDialog,
    closeConfirmationDialog,
    confirmAction,
  };
};
