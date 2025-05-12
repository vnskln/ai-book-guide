import { Button } from "@/components/ui/button";
import { BookPlus } from "lucide-react";

export const EmptyStateMessage = () => {
  return (
    <div className="text-center py-12">
      <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
        <BookPlus className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No books to read</h3>
      <p className="text-muted-foreground mb-6">
        You haven&apos;t added any books to your reading list yet.
        <br />
        Add a book or wait for new recommendations.
      </p>
      <Button asChild>
        <a href="/books/search">Add a Book</a>
      </Button>
    </div>
  );
};
