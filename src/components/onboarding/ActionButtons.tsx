import { Button } from "@/components/ui/button";
import type { ActionButtonsProps } from "./types";

export function ActionButtons({ isSubmitting, isValid }: ActionButtonsProps) {
  return (
    <div className="flex justify-end mt-6">
      <Button type="submit" disabled={!isValid || isSubmitting}>
        {isSubmitting ? "Saving..." : "Save Preferences"}
      </Button>
    </div>
  );
}
