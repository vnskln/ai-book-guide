import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface MoveToReadDialogProps {
  isOpen: boolean;
  bookTitle: string;
  onClose: () => void;
  onConfirm: () => Promise<boolean>;
}

export function MoveToReadDialog({ isOpen, bookTitle, onClose, onConfirm }: MoveToReadDialogProps) {
  const handleConfirm = async () => {
    const success = await onConfirm();
    if (success) {
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Move to "To Read" List</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to move "{bookTitle}" to your "To Read" list? This will remove it from your rejected
            books.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>Move Book</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
