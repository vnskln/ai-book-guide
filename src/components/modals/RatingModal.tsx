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
import { useState, useContext } from "react";
import { ToReadBooksContext } from "@/components/books/ToReadBooksView";

export const RatingModal = () => {
  const context = useContext(ToReadBooksContext);
  const [selectedRating, setSelectedRating] = useState<boolean | null>(null);

  if (!context) {
    console.error("RatingModal must be used within ToReadBooksContext");
    return null;
  }

  const { selectedBook, showRatingModal, closeRatingModal, confirmRating } = context;

  console.log("RatingModal rendering with state:", {
    selectedBook,
    showRatingModal,
    selectedRating,
  });

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
          <DialogTitle>Rate this Book</DialogTitle>
          <DialogDescription>
            {selectedBook?.title}
            <br />
            by {selectedBook?.authors.map((author) => author.name).join(", ")}
            <br />
            <br />
            Did you enjoy reading this book? Your rating helps us improve our recommendations.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center gap-4">
          <Button
            variant={selectedRating === true ? "default" : "outline"}
            className="flex-1"
            onClick={() => handleRatingSelect(true)}
          >
            <ThumbsUp className="mr-2 h-4 w-4" />I liked it
          </Button>
          <Button
            variant={selectedRating === false ? "default" : "outline"}
            className="flex-1"
            onClick={() => handleRatingSelect(false)}
          >
            <ThumbsDown className="mr-2 h-4 w-4" />I didn't like it
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
