import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserBookStatus } from "@/types";

interface BooksTabsProps {
  activeTab: UserBookStatus;
}

export function BooksTabs({ activeTab }: BooksTabsProps) {
  return (
    <Tabs value={activeTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value={UserBookStatus.READ} asChild>
          <a href="/my-books/read">Read</a>
        </TabsTrigger>
        <TabsTrigger value={UserBookStatus.TO_READ} asChild>
          <a href="/my-books/to-read">To Read</a>
        </TabsTrigger>
        <TabsTrigger value={UserBookStatus.REJECTED} asChild>
          <a href="/my-books/rejected">Rejected</a>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
