import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Trash2, X } from "lucide-react";
import type { UserBookResponseDto } from "@/types";

interface BookCardProps {
  book: UserBookResponseDto;
  onMarkAsRead: (book: UserBookResponseDto) => void;
  onReject: (book: UserBookResponseDto) => void;
  onDelete: (book: UserBookResponseDto) => void;
}

export const BookCard = ({ book, onMarkAsRead, onReject, onDelete }: BookCardProps) => {
  const formattedDate = new Date(book.created_at).toLocaleDateString();
  const authors = book.authors.map((author) => author.name).join(", ");

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{book.title}</CardTitle>
            <CardDescription>{authors}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => onMarkAsRead(book)} title="Mark as read">
              <ThumbsUp className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => onReject(book)} title="Reject book">
              <X className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onDelete(book)}
              title="Delete book"
              className="text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Language: {book.language}</span>
          <span>Added: {formattedDate}</span>
          {book.is_recommended && <span className="text-primary">Recommended</span>}
        </div>
      </CardContent>
    </Card>
  );
};
