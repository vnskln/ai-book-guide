import React from "react";
import type { UserBookResponseDto } from "@/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircledIcon, MinusCircledIcon, TrashIcon } from "@radix-ui/react-icons";
import { formatDate } from "@/lib/utils";
import { DeleteBookDialog } from "./DeleteBookDialog";

interface BookCardProps {
  book: UserBookResponseDto;
  onDelete: () => Promise<boolean>;
  onRatingChange: (rating: boolean) => Promise<void>;
}

export function BookCard({ book, onDelete, onRatingChange }: BookCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isUpdatingRating, setIsUpdatingRating] = React.useState(false);

  const handleRatingChange = async (newRating: boolean) => {
    if (isUpdatingRating || newRating === book.rating) return;
    setIsUpdatingRating(true);
    try {
      await onRatingChange(newRating);
    } finally {
      setIsUpdatingRating(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="space-y-1">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-lg font-semibold break-words">{book.title}</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <TrashIcon className="h-4 w-4" />
              <span className="sr-only">Delete book</span>
            </Button>
          </div>
          <p className="line-clamp-1 text-sm text-muted-foreground">
            {book.authors.map((author) => author.name).join(", ")}
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{book.language}</span>
            <span>•</span>
            <span>Added {formatDate(book.created_at)}</span>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex w-full gap-2">
            <Button
              variant={book.rating === true ? "default" : "outline"}
              className={`flex-1 ${book.rating === true ? "bg-emerald-600 hover:bg-emerald-700" : "hover:bg-emerald-100"}`}
              onClick={() => handleRatingChange(true)}
              disabled={isUpdatingRating}
            >
              <PlusCircledIcon className="mr-2 h-4 w-4" />
              Recommend
            </Button>
            <Button
              variant={book.rating === false ? "default" : "outline"}
              className={`flex-1 ${book.rating === false ? "bg-rose-600 hover:bg-rose-700" : "hover:bg-rose-100"}`}
              onClick={() => handleRatingChange(false)}
              disabled={isUpdatingRating}
            >
              <MinusCircledIcon className="mr-2 h-4 w-4" />
              Don't Recommend
            </Button>
          </div>
        </CardFooter>
      </Card>
      <DeleteBookDialog
        isOpen={isDeleteDialogOpen}
        bookTitle={book.title}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={onDelete}
      />
    </>
  );
}
