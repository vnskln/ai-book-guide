import { useState } from "react";
import type { UserBookResponseDto } from "@/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "@radix-ui/react-icons";
import { BookMarked } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface RejectedBookCardProps {
  book: UserBookResponseDto;
  onMoveToRead: (id: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export function RejectedBookCard({ book, onMoveToRead, onDelete }: RejectedBookCardProps) {
  const [isMoving, setIsMoving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleMoveToRead = async () => {
    setIsMoving(true);
    try {
      await onMoveToRead(book.id);
    } finally {
      setIsMoving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(book.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-semibold break-words">{book.title}</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={handleDelete}
            disabled={isDeleting}
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
        <Button variant="outline" className="flex-1 hover:bg-blue-100" onClick={handleMoveToRead} disabled={isMoving}>
          <BookMarked className="mr-2 h-4 w-4" />
          Move to &quot;To Read&quot;
        </Button>
      </CardFooter>
    </Card>
  );
}
