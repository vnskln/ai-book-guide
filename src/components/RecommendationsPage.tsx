import { useRecommendations } from "@/lib/hooks/useRecommendations";
import { RecommendationViewStatus } from "@/lib/types/recommendations";
import { RecommendationButton } from "./RecommendationButton";
import { LoadingOverlay } from "./LoadingOverlay";
import { CurrentRecommendation } from "./CurrentRecommendation";
import { RecommendationHistory } from "./RecommendationHistory";
import { ErrorBoundary } from "./ErrorBoundary";

function RecommendationsPageContent() {
  const {
    viewState,
    actionState,
    generateRecommendation,
    acceptRecommendation,
    rejectRecommendation,
    fetchHistory,
    cancelGeneration,
  } = useRecommendations();

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <section className="text-center">
          <h1 className="text-4xl font-bold mb-8">Book Recommendations</h1>
          <RecommendationButton
            onClick={generateRecommendation}
            isLoading={viewState.status === RecommendationViewStatus.LOADING}
          />
        </section>

        {viewState.status === RecommendationViewStatus.LOADING && (
          <LoadingOverlay onCancel={cancelGeneration} onRetry={generateRecommendation} error={viewState.error} />
        )}

        {viewState.currentRecommendation && (
          <CurrentRecommendation
            recommendation={viewState.currentRecommendation}
            onAccept={acceptRecommendation}
            onReject={rejectRecommendation}
            isActionLoading={actionState.status === "loading"}
          />
        )}

        {viewState.error && !viewState.currentRecommendation && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">{viewState.error}</div>
        )}

        <RecommendationHistory history={viewState.history} onPageChange={fetchHistory} />
      </div>
    </main>
  );
}

export function RecommendationsPage() {
  return (
    <ErrorBoundary>
      <RecommendationsPageContent />
    </ErrorBoundary>
  );
}
