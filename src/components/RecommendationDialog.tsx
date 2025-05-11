import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { RecommendationResponseDto } from "@/types";
import { RecommendationCard } from "./RecommendationCard";

interface RecommendationDialogProps {
  recommendation: RecommendationResponseDto | null;
  onClose: () => void;
}

export function RecommendationDialog({ recommendation, onClose }: RecommendationDialogProps) {
  const isOpen = recommendation !== null;
  const bookTitle = recommendation?.book.title;

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent
        className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        aria-labelledby="recommendation-dialog-title"
        aria-describedby="recommendation-dialog-description"
      >
        <DialogHeader className="flex-shrink-0">
          <DialogTitle id="recommendation-dialog-title">
            {bookTitle ? `Details for ${bookTitle}` : "Recommendation Details"}
          </DialogTitle>
        </DialogHeader>
        <div id="recommendation-dialog-description" className="overflow-y-auto pr-2">
          {recommendation && <RecommendationCard recommendation={recommendation} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
