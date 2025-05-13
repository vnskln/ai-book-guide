import { PreferencesTextarea } from "@/components/onboarding/PreferencesTextarea";
import { LanguageSelect } from "@/components/onboarding/LanguageSelect";
import { ActionButtons } from "@/components/onboarding/ActionButtons";
import { usePreferenceEditForm } from "./hooks/usePreferenceEditForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "pl", label: "Polish" },
  { value: "es", label: "Spanish" },
  { value: "de", label: "German" },
  { value: "fr", label: "French" },
];

export function ProfilePreferencesView() {
  const { data, errors, status, handleChange, submitForm, isValid } = usePreferenceEditForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await submitForm();
      toast.success("Your preferences have been updated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update preferences");
    }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader className="px-6">
        <CardTitle>Reading Preferences</CardTitle>
        <CardDescription>
          Update your reading preferences and preferred language. This will help us provide better book recommendations.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6">
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
            options={LANGUAGE_OPTIONS}
            error={errors.preferred_language}
          />
          <ActionButtons isSubmitting={status === "submitting"} isValid={isValid} />
        </form>
      </CardContent>
    </Card>
  );
}
