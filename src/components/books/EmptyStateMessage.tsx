import { BookPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const EmptyStateMessage = () => {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center gap-4 py-8 text-center">
        <div className="rounded-full border-2 border-dashed border-muted p-4">
          <BookPlus className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold">No books to read</h3>
          <p className="text-sm text-muted-foreground">
            You haven&apos;t added any books to your reading list yet.
            <br />
            Add a book or wait for new recommendations.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
