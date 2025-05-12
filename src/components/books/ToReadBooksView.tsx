import React, { createContext } from "react";
import { BookCardList } from "./BookCardList";
import { RatingModal } from "@/components/modals/RatingModal";
import { ConfirmationDialog } from "@/components/modals/ConfirmationDialog";
import { useToReadBooks } from "@/hooks/useToReadBooks";

// Create a context for the to-read books state
export const ToReadBooksContext = createContext<ReturnType<typeof useToReadBooks> | null>(null);

// Separate component for modals to ensure proper hydration
function Modals() {
  return (
    <>
      <RatingModal />
      <ConfirmationDialog />
    </>
  );
}

export function ToReadBooksView() {
  console.log("ToReadBooksView mounting");
  const toReadBooksState = useToReadBooks();

  return (
    <ToReadBooksContext.Provider value={toReadBooksState}>
      <BookCardList />
      <Modals />
    </ToReadBooksContext.Provider>
  );
}
