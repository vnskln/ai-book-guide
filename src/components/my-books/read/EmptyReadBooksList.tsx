import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ReaderIcon, PlusIcon } from "@radix-ui/react-icons";

interface EmptyReadBooksListProps {
  onAddClick: () => void;
}

export function EmptyReadBooksList({ onAddClick }: EmptyReadBooksListProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center gap-4 py-8 text-center">
        <div className="rounded-full border-2 border-dashed border-muted p-4">
          <ReaderIcon className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold">You haven&apos;t read any books yet</h3>
          <p className="text-sm text-muted-foreground">Add your first read book to start building your library</p>
        </div>
        <Button onClick={onAddClick} variant="secondary" className="mt-2">
          <PlusIcon className="mr-2 h-4 w-4" />
          Add First Book
        </Button>
      </CardContent>
    </Card>
  );
}
