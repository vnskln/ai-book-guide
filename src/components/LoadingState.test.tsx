import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoadingState } from "./LoadingState";
import { vi } from "vitest";

// Mock dla ikon Lucide
vi.mock("lucide-react", () => ({
  Loader2: () => <div data-testid="loader-icon" />,
}));

describe("LoadingState", () => {
  it("renderuje z domyślnymi właściwościami", () => {
    render(<LoadingState />);

    expect(screen.getByTestId("loader-icon")).toBeInTheDocument();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("stosuje odpowiednią klasę dla każdego wariantu", () => {
    const { container, rerender } = render(<LoadingState variant="default" />);
    expect(container.firstChild).toHaveClass("min-h-[200px]");

    rerender(<LoadingState variant="page" />);
    expect(container.firstChild).toHaveClass("min-h-[400px]");

    rerender(<LoadingState variant="card" />);
    expect(container.firstChild).toHaveClass("min-h-[100px]");

    rerender(<LoadingState variant="inline" />);
    expect(container.firstChild).toHaveClass("min-h-fit");
  });

  it("ukrywa tekst dla wariantu inline", () => {
    const { rerender } = render(<LoadingState variant="default" text="Niestandardowy tekst ładowania" />);
    expect(screen.getByText("Niestandardowy tekst ładowania")).toBeInTheDocument();

    rerender(<LoadingState variant="inline" text="Niestandardowy tekst ładowania" />);
    expect(screen.queryByText("Niestandardowy tekst ładowania")).not.toBeInTheDocument();
  });

  it("akceptuje i stosuje niestandardową klasę CSS", () => {
    const { container } = render(<LoadingState className="test-custom-class" />);
    expect(container.firstChild).toHaveClass("test-custom-class");
  });
});
