import { Button } from "@/components/ui/button";
import { BookPlus } from "lucide-react";

export const AddBookButton = () => {
  return (
    <Button asChild>
      <a href="/books/search" className="flex items-center gap-2">
        <BookPlus className="w-4 h-4" />
        Add Book
      </a>
    </Button>
  );
};
