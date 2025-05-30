import React from "react";
import { useReadBooks } from "./hooks/useReadBooks";
import { EmptyReadBooksList } from "./EmptyReadBooksList";
import { ReadBooksList } from "./ReadBooksList";
import { AddBookModal } from "./AddBookModal";
import { LoadingState } from "@/components/LoadingState";

// Create a context for the add book functionality
const AddBookContext = React.createContext<{
  openAddBookModal: () => void;
}>({
  // Default implementation logs a warning when used outside provider
  openAddBookModal: () => {
    // No-op implementation when used outside provider
  },
});

// Export the hook for other components to use
export const useAddBook = () => React.useContext(AddBookContext);

export function ReadBooksView() {
  const { books, isLoading, error, pagination, fetchBooks, addBook, deleteBook, updateRating } = useReadBooks();
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);

  const handlePageChange = async (page: number) => {
    await fetchBooks(page);
  };

  // Provide the add book functionality through context
  React.useEffect(() => {
    const layout = document.querySelector("[data-my-books-layout]");
    if (layout) {
      const event = new CustomEvent("setAddBookHandler", {
        detail: { handler: () => setIsAddModalOpen(true) },
      });
      layout.dispatchEvent(event);
    }
  }, []);

  if (isLoading) {
    return <LoadingState variant="default" text="Loading your books..." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-8">
        <p className="text-destructive">An error occurred while loading books</p>
        <button onClick={() => window.location.reload()} className="text-sm text-muted-foreground hover:text-primary">
          Refresh page
        </button>
      </div>
    );
  }

  return (
    <AddBookContext.Provider value={{ openAddBookModal: () => setIsAddModalOpen(true) }}>
      <div className="space-y-8">
        {books.length === 0 ? (
          <EmptyReadBooksList onAddClick={() => setIsAddModalOpen(true)} />
        ) : (
          <ReadBooksList
            books={books}
            pagination={pagination}
            onPageChange={handlePageChange}
            onDelete={deleteBook}
            onRatingChange={updateRating}
          />
        )}
        <AddBookModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={addBook} />
      </div>
    </AddBookContext.Provider>
  );
}
