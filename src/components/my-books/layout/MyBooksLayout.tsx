import React from "react";
import { Container } from "@/components/ui/container";

interface MyBooksLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function MyBooksLayout({ title, children }: MyBooksLayoutProps) {
  return (
    <Container className="py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        </div>
        {children}
      </div>
    </Container>
  );
}
