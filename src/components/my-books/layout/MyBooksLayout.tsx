import React from "react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { LightningBoltIcon, PlusIcon, GearIcon } from "@radix-ui/react-icons";

interface MyBooksLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function MyBooksLayout({ title, children }: MyBooksLayoutProps) {
  const [addBookHandler, setAddBookHandler] = React.useState<(() => void) | null>(null);
  const layoutRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const layout = layoutRef.current;
    if (!layout) return;

    const handleSetAddBookHandler = (event: CustomEvent<{ handler: () => void }>) => {
      setAddBookHandler(() => event.detail.handler);
    };

    layout.addEventListener("setAddBookHandler", handleSetAddBookHandler as EventListener);
    return () => {
      layout.removeEventListener("setAddBookHandler", handleSetAddBookHandler as EventListener);
    };
  }, []);

  return (
    <Container className="py-8">
      <div className="space-y-6" ref={layoutRef} data-my-books-layout>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <div className="flex items-center gap-2">
            {addBookHandler && (
              <Button onClick={addBookHandler} size="sm">
                <PlusIcon className="mr-2 h-4 w-4" />
                Add Book
              </Button>
            )}
            <Button variant="outline" size="sm" asChild className="border-muted-foreground flex items-center gap-2">
              <a href="/profile/preferences">
                <GearIcon className="h-4 w-4" />
                Settings
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild className="border-muted-foreground flex items-center gap-2">
              <a href="/recommendations">
                <LightningBoltIcon className="h-4 w-4" />
                Book suggestions
              </a>
            </Button>
          </div>
        </div>
        {children}
      </div>
    </Container>
  );
}
