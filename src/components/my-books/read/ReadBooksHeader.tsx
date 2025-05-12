import React from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, LightningBoltIcon } from "@radix-ui/react-icons";

interface ReadBooksHeaderProps {
  onAddClick: () => void;
}

export function ReadBooksHeader({ onAddClick }: ReadBooksHeaderProps) {
  console.log("ReadBooksHeader is mounting"); // Debug log
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Read Books</h2>
          <p className="text-sm text-muted-foreground">List of books you have read</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href="/recommendations">
              <LightningBoltIcon className="mr-2 h-4 w-4" />
              Book suggestions
            </a>
          </Button>
          <Button onClick={onAddClick} size="sm">
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Book
          </Button>
        </div>
      </div>
    </div>
  );
}
