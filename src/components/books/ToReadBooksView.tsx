import React, { createContext } from "react";
import { BookCardList } from "./BookCardList";
import { RatingModal } from "@/components/modals/RatingModal";
import { ConfirmationDialog } from "@/components/modals/ConfirmationDialog";
import { useToReadBooks } from "@/hooks/useToReadBooks";

// Create a context for the to-read books state
export const ToReadBooksContext = createContext<ReturnType<typeof useToReadBooks> | null>(null);

export function ToReadBooksView() {
  console.log("ToReadBooksView mounting");
  const toReadBooksState = useToReadBooks();

  return (
    <ToReadBooksContext.Provider value={toReadBooksState}>
      <BookCardList />
      <RatingModal />
      <ConfirmationDialog />
    </ToReadBooksContext.Provider>
  );
}
