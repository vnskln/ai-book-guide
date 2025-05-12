import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useToReadBooks } from "@/hooks/useToReadBooks";
import { useState, useContext, useEffect } from "react";
import { ToReadBooksContext } from "@/components/books/ToReadBooksView";

export const RatingModal = () => {
  const context = useContext(ToReadBooksContext);
  // Fallback to direct hook usage if not in context
  const hookResult = useToReadBooks();
  const { selectedBook, showRatingModal, closeRatingModal, confirmRating } = context || hookResult;
  const [selectedRating, setSelectedRating] = useState<boolean | null>(null);

  console.log("RatingModal rendering with state:", {
    selectedBook,
    showRatingModal,
    selectedRating,
  });

  useEffect(() => {
    console.log("RatingModal effect - modal state changed:", showRatingModal);
  }, [showRatingModal]);

  const handleConfirm = () => {
    console.log("Confirm rating button clicked", { selectedBook, selectedRating });
    if (selectedBook && selectedRating !== null) {
      confirmRating(selectedBook.id, selectedRating);
      setSelectedRating(null);
    }
  };

  const handleClose = () => {
    console.log("Rating modal closed");
    setSelectedRating(null);
    closeRatingModal();
  };

  const handleRatingSelect = (rating: boolean) => {
    console.log("Rating selected:", rating);
    setSelectedRating(rating);
  };

  return (
    <Dialog open={showRatingModal} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rate this book</DialogTitle>
          <DialogDescription>
            {selectedBook?.title}
            <br />
            by {selectedBook?.authors.map((author) => author.name).join(", ")}
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-center gap-4 py-4">
          <Button
            variant={selectedRating === true ? "default" : "outline"}
            size="lg"
            onClick={() => handleRatingSelect(true)}
            className="flex-1"
          >
            <ThumbsUp className="mr-2 h-5 w-5" />
            Liked it
          </Button>
          <Button
            variant={selectedRating === false ? "default" : "outline"}
            size="lg"
            onClick={() => handleRatingSelect(false)}
            className="flex-1"
          >
            <ThumbsDown className="mr-2 h-5 w-5" />
            Didn&apos;t like it
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={selectedRating === null}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
