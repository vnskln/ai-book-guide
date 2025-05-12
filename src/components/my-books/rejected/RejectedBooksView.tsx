import { RejectedBooksList } from "./RejectedBooksList";
import { useRejectedBooks } from "./hooks/useRejectedBooks";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingState } from "@/components/LoadingState";

export function RejectedBooksView() {
  const { books, isLoading, error, deleteBook, moveToRead } = useRejectedBooks();

  if (error) {
    return (
      <div>
        <Alert variant="destructive" className="mt-6">
          <AlertDescription>{error.message || "An error occurred while loading books"}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div>
      {isLoading ? (
        <LoadingState variant="default" text="Loading your books..." />
      ) : (
        <RejectedBooksList books={books} onMoveToRead={moveToRead} onDelete={deleteBook} />
      )}
    </div>
  );
}
