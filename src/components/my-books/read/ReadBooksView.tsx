import React from "react";
import { useReadBooks } from "./hooks/useReadBooks";
import { ReadBooksHeader } from "./ReadBooksHeader";
import { EmptyReadBooksList } from "./EmptyReadBooksList";
import { ReadBooksList } from "./ReadBooksList";
import { AddBookModal } from "./AddBookModal";

export function ReadBooksView() {
  console.log("ReadBooksView is mounting");
  const { books, isLoading, error, pagination, fetchBooks, addBook, deleteBook, updateRating } = useReadBooks();

  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);

  const handlePageChange = async (page: number) => {
    await fetchBooks(page);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
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
    <div className="space-y-8">
      <ReadBooksHeader onAddClick={() => setIsAddModalOpen(true)} />
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
  );
}
