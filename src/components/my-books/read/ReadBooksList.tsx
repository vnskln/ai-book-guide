import React from "react";
import type { UserBookResponseDto, PaginationInfo } from "@/types";
import { BookCard } from "./BookCard";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface ReadBooksListProps {
  books: UserBookResponseDto[];
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onDelete: (id: string) => Promise<boolean>;
  onRatingChange: (id: string, rating: boolean) => Promise<void>;
}

export function ReadBooksList({ books, pagination, onPageChange, onDelete, onRatingChange }: ReadBooksListProps) {
  const { page, total_pages } = pagination;

  const renderPaginationItems = () => {
    const items = [];
    const maxVisible = 5;
    const halfVisible = Math.floor(maxVisible / 2);
    let start = Math.max(1, page - halfVisible);
    const end = Math.min(total_pages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    if (start > 1) {
      items.push(
        <PaginationItem key="1">
          <PaginationLink onClick={() => onPageChange(1)}>1</PaginationLink>
        </PaginationItem>
      );
      if (start > 2) {
        items.push(
          <PaginationItem key="start-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }

    for (let i = start; i <= end; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink onClick={() => onPageChange(i)} isActive={page === i}>
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (end < total_pages) {
      if (end < total_pages - 1) {
        items.push(
          <PaginationItem key="end-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      items.push(
        <PaginationItem key={total_pages}>
          <PaginationLink onClick={() => onPageChange(total_pages)}>{total_pages}</PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {books.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            onDelete={() => onDelete(book.id)}
            onRatingChange={(rating) => onRatingChange(book.id, rating)}
          />
        ))}
      </div>
      {total_pages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={() => onPageChange(page - 1)} disabled={page === 1} />
            </PaginationItem>
            {renderPaginationItems()}
            <PaginationItem>
              <PaginationNext onClick={() => onPageChange(page + 1)} disabled={page === total_pages} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
