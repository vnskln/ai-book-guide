import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import type { RecommendationResponseDto } from "@/types";
import { RecommendationCard } from "./RecommendationCard";

interface CurrentRecommendationProps {
  recommendation: RecommendationResponseDto;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  isActionLoading: boolean;
}

export function CurrentRecommendation({
  recommendation,
  onAccept,
  onReject,
  isActionLoading,
}: CurrentRecommendationProps) {
  return (
    <div className="space-y-4">
      <RecommendationCard recommendation={recommendation} />

      <div className="flex justify-center gap-4">
        <Button
          onClick={() => onAccept(recommendation.id)}
          disabled={isActionLoading}
          className="w-40"
          variant="default"
        >
          {isActionLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <ThumbsUp className="mr-2 h-4 w-4" />
              Accept
            </>
          )}
        </Button>

        <Button
          onClick={() => onReject(recommendation.id)}
          disabled={isActionLoading}
          className="w-40"
          variant="outline"
        >
          {isActionLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <ThumbsDown className="mr-2 h-4 w-4" />
              Reject
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
