import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { PreferencesTextareaProps } from "./types";
import { CharacterCounter } from "./CharacterCounter";

export function PreferencesTextarea({ value, onChange, error, maxLength }: PreferencesTextareaProps) {
  const isExceeded = value.length > maxLength;

  return (
    <div className="space-y-2">
      <Label htmlFor="reading_preferences">Reading Preferences</Label>
      <Textarea
        id="reading_preferences"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Tell us about your favorite genres, authors, themes, and what you look for in a good book..."
        className={error ? "border-destructive" : ""}
      />
      <CharacterCounter currentLength={value.length} maxLength={maxLength} isExceeded={isExceeded} />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
