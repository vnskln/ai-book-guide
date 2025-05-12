import { useState } from "react";
import type { UserBookResponseDto } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2, BookMarked } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">{book.title}</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleMoveToRead} disabled={isMoving} className="text-blue-600">
              <BookMarked className="mr-2 h-4 w-4" />
              Move to "To Read"
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} disabled={isDeleting} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">{book.authors.map((author) => author.name).join(", ")}</div>
      </CardContent>
    </Card>
  );
}
