import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { RecommendationResponseDto } from "@/types";

interface RecommendationButtonProps {
  onClick: () => void;
  isLoading: boolean;
  currentRecommendation: RecommendationResponseDto | null;
}

export function RecommendationButton({ onClick, isLoading, currentRecommendation }: RecommendationButtonProps) {
  const isDisabled = isLoading || currentRecommendation !== null;

  return (
    <Button onClick={onClick} disabled={isDisabled} size="lg" className="w-full max-w-md">
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating recommendation...
        </>
      ) : (
        "Suggest me a book"
      )}
    </Button>
  );
}
