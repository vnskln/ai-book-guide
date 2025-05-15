import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorBoundary } from "./ErrorBoundary";
import React, { useState } from "react";

// Wrapper component to control whether an error is thrown
function ErrorBoundaryTester() {
  const [shouldThrow, setShouldThrow] = useState(true);
  const [key, setKey] = useState(0);

  const resetError = () => {
    // Increment the key to force a remount of the ErrorBoundary
    setKey((k) => k + 1);
    // Stop throwing errors
    setShouldThrow(false);
  };

  return (
    <div>
      <button data-testid="reset-button" onClick={resetError}>
        Reset Error
      </button>
      <ErrorBoundary key={key}>{shouldThrow ? <ThrowErrorComponent /> : <div>Normal component</div>}</ErrorBoundary>
    </div>
  );
}

// Component that always throws an error
function ThrowErrorComponent(): React.ReactNode {
  throw new Error("Test error");
  // This return is never reached but TypeScript requires it
  return null;
}

describe("ErrorBoundary", () => {
  // Suppress console.error during tests
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("renders error UI when a child component throws an exception", () => {
    render(
      <ErrorBoundary>
        <ThrowErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText(/test error/i)).toBeInTheDocument();
  });

  it("renders custom fallback if provided", () => {
    const fallback = <div>Custom error UI</div>;

    render(
      <ErrorBoundary fallback={fallback}>
        <ThrowErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText("Custom error UI")).toBeInTheDocument();
  });

  it("resets error boundary when retry button is clicked", async () => {
    // Custom container to test the full reset functionality
    const { unmount } = render(<ErrorBoundaryTester />);

    // Verify error is shown
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    // Click the reset button to reset the error boundary
    fireEvent.click(screen.getByTestId("reset-button"));

    // Verify success content is shown
    expect(screen.getByText("Normal component")).toBeInTheDocument();

    unmount();
  });
});
