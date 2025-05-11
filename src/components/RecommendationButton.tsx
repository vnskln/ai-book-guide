import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface RecommendationButtonProps {
  onClick: () => void;
  isLoading: boolean;
}

export function RecommendationButton({ onClick, isLoading }: RecommendationButtonProps) {
  return (
    <Button onClick={onClick} disabled={isLoading} size="lg" className="w-full max-w-md">
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
