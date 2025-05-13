import { Button } from "@/components/ui/button";
import type { ActionButtonsProps } from "./types";

export function ActionButtons({ isSubmitting, isValid }: ActionButtonsProps) {
  return (
    <div className="flex justify-between mt-6">
      <Button variant="outline" type="button" onClick={() => (window.location.href = "/recommendations")}>
        Back to Recommendations
      </Button>
      <Button type="submit" disabled={!isValid || isSubmitting}>
        {isSubmitting ? "Saving..." : "Save Preferences"}
      </Button>
    </div>
  );
}
