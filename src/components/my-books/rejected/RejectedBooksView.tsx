import { RejectedBooksList } from "./RejectedBooksList";
import { useRejectedBooks } from "./hooks/useRejectedBooks";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

export function RejectedBooksView() {
  const { books, isLoading, error, deleteBook, moveToRead } = useRejectedBooks();

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="mt-6">
          <AlertDescription>{error.message || "An error occurred while loading books"}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <RejectedBooksList books={books} onMoveToRead={moveToRead} onDelete={deleteBook} />
      )}
    </div>
  );
}
