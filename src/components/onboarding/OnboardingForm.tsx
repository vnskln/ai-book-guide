import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePreferencesForm } from "../../hooks/usePreferencesForm";
import { PreferencesTextarea } from "./PreferencesTextarea";
import { LanguageSelect } from "./LanguageSelect";
import { ActionButtons } from "./ActionButtons";
import type { LanguageOption } from "./types";

const LANGUAGES: LanguageOption[] = [
  { value: "en", label: "English" },
  { value: "pl", label: "Polish" },
  { value: "es", label: "Spanish" },
  { value: "de", label: "German" },
  { value: "fr", label: "French" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "ru", label: "Russian" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "ar", label: "Arabic" },
  { value: "hi", label: "Hindi" },
  { value: "tr", label: "Turkish" },
  { value: "nl", label: "Dutch" },
  { value: "sv", label: "Swedish" },
  { value: "da", label: "Danish" },
  { value: "fi", label: "Finnish" },
  { value: "no", label: "Norwegian" },
  { value: "cs", label: "Czech" },
];

export function OnboardingForm() {
  const { data, errors, status, errorMessage, handleChange, submitForm, isValid } = usePreferencesForm();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitForm();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Reading Preferences</CardTitle>
        <CardDescription>
          Tell us about your reading preferences to help us provide better book recommendations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <PreferencesTextarea
            value={data.reading_preferences}
            onChange={(value) => handleChange("reading_preferences", value)}
            error={errors.reading_preferences}
            maxLength={1000}
          />
          <LanguageSelect
            value={data.preferred_language}
            onChange={(value) => handleChange("preferred_language", value)}
            options={LANGUAGES}
            error={errors.preferred_language}
          />
          {status === "error" && errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
          <ActionButtons isSubmitting={status === "submitting"} isValid={isValid} />
        </form>
      </CardContent>
    </Card>
  );
}
