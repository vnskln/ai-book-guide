import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { LanguageSelectProps } from "./types";

export function LanguageSelect({ value, onChange, options, error }: LanguageSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="preferred_language">Preferred Language</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="preferred_language" className={error ? "border-destructive" : ""}>
          <SelectValue placeholder="Select a language" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
