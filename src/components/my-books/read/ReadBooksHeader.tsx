import React from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@radix-ui/react-icons";

interface ReadBooksHeaderProps {
  onAddClick: () => void;
}

export function ReadBooksHeader({ onAddClick }: ReadBooksHeaderProps) {
  console.log("ReadBooksHeader is mounting"); // Debug log
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Read Books</h2>
        <p className="text-sm text-muted-foreground">List of books you have read</p>
      </div>
      <Button onClick={onAddClick} size="sm">
        <PlusIcon className="mr-2 h-4 w-4" />
        Add Book
      </Button>
    </div>
  );
}
