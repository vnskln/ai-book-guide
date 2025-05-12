import { CreateUserPreferencesDto } from "../../types";

export interface PreferencesFormData extends CreateUserPreferencesDto {
  reading_preferences: string;
  preferred_language: string;
}

export interface PreferencesFormErrors {
  reading_preferences?: string;
  preferred_language?: string;
}

export type FormStatus = "idle" | "submitting" | "success" | "error";

export interface PreferencesFormState {
  data: PreferencesFormData;
  errors: PreferencesFormErrors;
  status: FormStatus;
  errorMessage?: string;
}

export interface LanguageOption {
  value: string;
  label: string;
}

export interface PreferencesTextareaProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  maxLength: number;
}

export interface CharacterCounterProps {
  currentLength: number;
  maxLength: number;
  isExceeded: boolean;
}

export interface LanguageSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: LanguageOption[];
  error?: string;
}

export interface ActionButtonsProps {
  isSubmitting: boolean;
  isValid: boolean;
}
