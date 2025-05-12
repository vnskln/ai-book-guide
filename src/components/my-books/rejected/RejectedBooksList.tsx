import { useState } from "react";
import type { UserBookResponseDto } from "@/types";
import { RejectedBookCard } from "./RejectedBookCard";
import { MoveToReadDialog } from "./MoveToReadDialog";
import { DeleteBookDialog } from "@/components/my-books/read/DeleteBookDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Cross2Icon } from "@radix-ui/react-icons";

interface RejectedBooksListProps {
  books: UserBookResponseDto[];
  onMoveToRead: (id: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

interface DialogState {
  type: "move" | "delete" | null;
  bookId: string | null;
  bookTitle: string | null;
}

export function RejectedBooksList({ books, onMoveToRead, onDelete }: RejectedBooksListProps) {
  const [dialogState, setDialogState] = useState<DialogState>({
    type: null,
    bookId: null,
    bookTitle: null,
  });

  const handleMoveToRead = (book: UserBookResponseDto) => {
    setDialogState({
      type: "move",
      bookId: book.id,
      bookTitle: book.title,
    });
  };

  const handleDelete = (book: UserBookResponseDto) => {
    setDialogState({
      type: "delete",
      bookId: book.id,
      bookTitle: book.title,
    });
  };

  const handleCloseDialog = () => {
    setDialogState({
      type: null,
      bookId: null,
      bookTitle: null,
    });
  };

  const handleConfirmMove = async () => {
    if (dialogState.bookId) {
      return onMoveToRead(dialogState.bookId);
    }
    return false;
  };

  const handleConfirmDelete = async () => {
    if (dialogState.bookId) {
      return onDelete(dialogState.bookId);
    }
    return false;
  };

  if (books.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center gap-4 py-8 text-center">
          <div className="rounded-full border-2 border-dashed border-muted p-4">
            <Cross2Icon className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">No rejected books found</h3>
            <p className="text-sm text-muted-foreground">Books you reject will appear here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {books.map((book) => (
          <RejectedBookCard
            key={book.id}
            book={book}
            onMoveToRead={async () => {
              handleMoveToRead(book);
              return false;
            }}
            onDelete={async () => {
              handleDelete(book);
              return false;
            }}
          />
        ))}
      </div>

      <MoveToReadDialog
        isOpen={dialogState.type === "move"}
        bookTitle={dialogState.bookTitle || ""}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmMove}
      />

      <DeleteBookDialog
        isOpen={dialogState.type === "delete"}
        bookTitle={dialogState.bookTitle || ""}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
