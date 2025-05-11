import { useEffect, useState } from "react";
import { useTimeout } from "@/lib/hooks/useTimeout";
import { Button } from "@/components/ui/button";
import { Loader2, XCircle } from "lucide-react";

interface LoadingOverlayProps {
  onCancel: () => void;
  onRetry?: () => void;
  error?: string | null;
}

const TIMEOUT_DURATION = 30000; // 30 seconds

export function LoadingOverlay({ onCancel, onRetry, error }: LoadingOverlayProps) {
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const { startTimer, clearTimer } = useTimeout(() => {
    setTimeoutReached(true);
  }, TIMEOUT_DURATION);

  useEffect(() => {
    // Start the timeout timer
    startTimer();

    // Start the elapsed time counter
    const interval = setInterval(() => {
      setElapsedTime((prev) => {
        if (prev >= 30) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    return () => {
      clearTimer();
      clearInterval(interval);
    };
  }, [startTimer, clearTimer]);

  if (timeoutReached || error) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] min-h-screen w-full">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 space-y-4">
          <div className="flex items-center space-x-2 text-red-600">
            <XCircle className="h-6 w-6" />
            <h2 className="text-lg font-semibold">{error || "Request timed out"}</h2>
          </div>
          <p className="text-gray-600">
            {error
              ? "An error occurred while generating your recommendation."
              : "The recommendation is taking longer than expected. Please try again."}
          </p>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            {onRetry && <Button onClick={onRetry}>Try Again</Button>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] min-h-screen w-full">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <h2 className="text-lg font-semibold">Generating recommendation...</h2>
        </div>
        <div className="space-y-2">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-1000"
              style={{ width: `${(elapsedTime / 30) * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 text-center">{elapsedTime} seconds elapsed</p>
        </div>
        <div className="flex justify-end">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
