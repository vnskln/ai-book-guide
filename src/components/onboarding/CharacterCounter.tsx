import type { CharacterCounterProps } from "./types";

export function CharacterCounter({ currentLength, maxLength, isExceeded }: CharacterCounterProps) {
  return (
    <div className={`text-sm mt-1 ${isExceeded ? "text-destructive" : "text-muted-foreground"}`}>
      {currentLength} / {maxLength} characters
    </div>
  );
}
