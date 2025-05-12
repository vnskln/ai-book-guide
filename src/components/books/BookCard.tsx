import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckIcon, Cross2Icon, TrashIcon } from "@radix-ui/react-icons";
import type { UserBookResponseDto } from "@/types";
import { formatDate } from "@/lib/utils";

interface BookCardProps {
  book: UserBookResponseDto;
  onMarkAsRead: (book: UserBookResponseDto) => void;
  onReject: (book: UserBookResponseDto) => void;
  onDelete: (book: UserBookResponseDto) => void;
}

export function BookCard({ book, onMarkAsRead, onReject, onDelete }: BookCardProps) {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex items-start justify-between gap-4">
          <h3 className="line-clamp-2 text-lg font-semibold">{book.title}</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(book)}
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
          <Button variant="outline" className="flex-1 hover:bg-emerald-100" onClick={() => onMarkAsRead(book)}>
            <CheckIcon className="mr-2 h-4 w-4" />
            Mark as Read
          </Button>
          <Button variant="outline" className="flex-1 hover:bg-rose-100" onClick={() => onReject(book)}>
            <Cross2Icon className="mr-2 h-4 w-4" />
            Reject
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
