import { useState } from "react";
import { RecommendationCard } from "./RecommendationCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { RecommendationResponseDto } from "@/types";
import { RecommendationDialog } from "./RecommendationDialog";

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
  const [selectedRecommendation, setSelectedRecommendation] = useState<RecommendationResponseDto | null>(null);

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
    <section className="space-y-6" aria-label="Recommendation history">
      <div>
        <h2 className="text-2xl font-semibold">History</h2>
        <p className="text-sm text-gray-500 mt-1">Click on any recommendation to view its full details</p>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">Loading recommendations...</div>
        ) : (
          data.map((recommendation) => (
            <button
              key={recommendation.id}
              className="w-full text-left transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 rounded-lg"
              onClick={() => setSelectedRecommendation(recommendation)}
              aria-label={`View details for ${recommendation.book.title}`}
            >
              <RecommendationCard recommendation={recommendation} isCompact />
            </button>
          ))
        )}
      </div>

      {total_pages > 1 && (
        <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
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
        </nav>
      )}

      <RecommendationDialog recommendation={selectedRecommendation} onClose={() => setSelectedRecommendation(null)} />
    </section>
  );
}
