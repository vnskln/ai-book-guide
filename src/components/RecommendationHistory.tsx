import { RecommendationCard } from "./RecommendationCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { RecommendationResponseDto } from "@/types";

interface RecommendationHistoryProps {
  history: {
    data: RecommendationResponseDto[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      total_pages: number;
    };
    isLoading: boolean;
    error: string | null;
  };
  onPageChange: (page: number) => void;
}

export function RecommendationHistory({ history, onPageChange }: RecommendationHistoryProps) {
  const { data, pagination, isLoading, error } = history;
  const { page, total_pages } = pagination;

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        Failed to load recommendation history: {error}
      </div>
    );
  }

  if (data.length === 0 && !isLoading) {
    return <div className="text-center py-8 text-gray-500">No recommendations in history yet.</div>;
  }

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold">History</h2>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">Loading recommendations...</div>
        ) : (
          data.map((recommendation) => (
            <RecommendationCard key={recommendation.id} recommendation={recommendation} isCompact />
          ))
        )}
      </div>

      {total_pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={page === 1 || isLoading}>
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <span className="text-sm text-gray-500">
            Page {page} of {total_pages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page === total_pages || isLoading}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </section>
  );
}
