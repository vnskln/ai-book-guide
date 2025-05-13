import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useContext } from "react";
import { ToReadBooksContext } from "@/components/books/ToReadBooksView";

type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";

export const ConfirmationDialog = () => {
  const context = useContext(ToReadBooksContext);

  if (!context) {
    console.error("ConfirmationDialog must be used within ToReadBooksContext");
    return null;
  }

  const { selectedBook, showConfirmationDialog, confirmationAction, closeConfirmationDialog, confirmAction } = context;

  console.log("ConfirmationDialog rendering with state:", {
    selectedBook,
    showConfirmationDialog,
    confirmationAction,
  });

  const getDialogContent = () => {
    if (!selectedBook || !confirmationAction) return null;

    const isDelete = confirmationAction === "delete";
    const title = isDelete ? "Delete Book" : "Reject Book";
    const description = isDelete
      ? "Are you sure you want to delete this book from your list? This action cannot be undone."
      : "Are you sure you want to reject this book? It will be moved to your rejected books list.";

    return {
      title,
      description,
      confirmText: isDelete ? "Delete" : "Reject",
      confirmVariant: isDelete ? "destructive" : ("default" as ButtonVariant),
    };
  };

  const content = getDialogContent();

  if (!content) return null;

  const handleConfirm = () => {
    console.log("Confirm button clicked in dialog");
    confirmAction();
  };

  const handleClose = () => {
    console.log("Dialog closed");
    closeConfirmationDialog();
  };

  return (
    <Dialog open={showConfirmationDialog} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{content.title}</DialogTitle>
          <DialogDescription>
            {selectedBook?.title}
            <br />
            by {selectedBook?.authors.map((author) => author.name).join(", ")}
            <br />
            <br />
            {content.description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant={content.confirmVariant} onClick={handleConfirm}>
            {content.confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
