import { useRecommendations } from "@/lib/hooks/useRecommendations";
import { RecommendationViewStatus } from "@/lib/types/recommendations";
import { RecommendationButton } from "./RecommendationButton";
import { LoadingOverlay } from "./LoadingOverlay";
import { CurrentRecommendation } from "./CurrentRecommendation";
import { RecommendationHistory } from "./RecommendationHistory";
import { ErrorBoundary } from "./ErrorBoundary";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { BookOpen } from "lucide-react";
import { GearIcon } from "@radix-ui/react-icons";
import { UserHeader } from "./UserHeader";

interface RecommendationsPageProps {
  userEmail: string;
}

function RecommendationsPageContent({ userEmail }: RecommendationsPageProps) {
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
    <Container className="py-8">
      <UserHeader email={userEmail} />
      <div className="space-y-8">
        <section className="text-center">
          <h1 className="text-4xl font-bold mb-8">Book Recommendations</h1>
          <div className="flex flex-col gap-4 justify-center items-center max-w-md mx-auto">
            <RecommendationButton
              onClick={generateRecommendation}
              isLoading={viewState.status === RecommendationViewStatus.LOADING}
              currentRecommendation={viewState.currentRecommendation}
            />
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => (window.location.href = "/my-books/read")}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              View my book lists
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => (window.location.href = "/profile/preferences")}
            >
              <GearIcon className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
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
    </Container>
  );
}

export function RecommendationsPage(props: RecommendationsPageProps) {
  return (
    <ErrorBoundary>
      <RecommendationsPageContent {...props} />
    </ErrorBoundary>
  );
}
