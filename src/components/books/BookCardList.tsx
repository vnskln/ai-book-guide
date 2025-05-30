import { useContext } from "react";
import { BookCard } from "./BookCard";
import { EmptyStateMessage } from "./EmptyStateMessage";
import { LoadingState } from "@/components/LoadingState";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UserBookResponseDto } from "@/types";
import { ToReadBooksContext } from "./ToReadBooksView";
import { useToReadBooks } from "@/hooks/useToReadBooks";

const ErrorFallback = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <div className="text-center text-destructive p-4 rounded-lg bg-destructive/10">
    <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
    <p>Error loading books: {error}</p>
    <Button onClick={onRetry} variant="outline" className="mt-2">
      Try again
    </Button>
  </div>
);

export const BookCardList = () => {
  const context = useContext(ToReadBooksContext);
  // Fallback to direct hook usage if not in context
  const hookResult = useToReadBooks();
  const { books, isLoading, error, openRatingModal, openConfirmationDialog } = context || hookResult;

  console.log("BookCardList rendering with books:", books);

  const handleMarkAsRead = (book: UserBookResponseDto) => {
    console.log("Mark as Read clicked for book:", book);
    openRatingModal(book);
  };

  const handleReject = (book: UserBookResponseDto) => {
    console.log("Reject clicked for book:", book);
    openConfirmationDialog(book, "reject");
  };

  const handleDelete = (book: UserBookResponseDto) => {
    console.log("Delete clicked for book:", book);
    openConfirmationDialog(book, "delete");
  };

  if (isLoading) {
    return <LoadingState variant="default" text="Loading your books..." />;
  }

  if (error) {
    return <ErrorFallback error={error} onRetry={() => window.location.reload()} />;
  }

  if (!books.length) {
    return <EmptyStateMessage />;
  }

  return (
    <ErrorBoundary>
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {books.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            onMarkAsRead={handleMarkAsRead}
            onReject={handleReject}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </ErrorBoundary>
  );
};
