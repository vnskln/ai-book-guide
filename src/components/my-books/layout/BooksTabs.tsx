import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserBookStatus } from "@/types";

interface TabItem {
  id: UserBookStatus;
  label: string;
  path: string;
}

const tabs: TabItem[] = [
  { id: UserBookStatus.TO_READ, label: "To Read", path: "/my-books/to-read" },
  { id: UserBookStatus.READ, label: "Read", path: "/my-books/read" },
  { id: UserBookStatus.REJECTED, label: "Rejected", path: "/my-books/rejected" },
];

interface BooksTabsProps {
  activeTab: UserBookStatus;
}

export function BooksTabs({ activeTab }: BooksTabsProps) {
  return (
    <Tabs value={activeTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id} asChild>
            <a href={tab.path}>{tab.label}</a>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
