import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  variant?: "default" | "page" | "card" | "inline";
  text?: string;
  className?: string;
}

export const LoadingState = ({ variant = "default", text = "Loading...", className }: LoadingStateProps) => {
  const variants = {
    default: "min-h-[200px]",
    page: "min-h-[400px]",
    card: "min-h-[100px]",
    inline: "min-h-fit",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center gap-2", variants[variant], className)}>
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      {variant !== "inline" && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
};
