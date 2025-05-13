import { useState, useEffect } from "react";
import type { UpdateUserPreferencesDto, UserPreferencesResponseDto } from "@/types";

interface FormErrors {
  reading_preferences?: string;
  preferred_language?: string;
}

interface FormState {
  data: UpdateUserPreferencesDto;
  errors: FormErrors;
  status: "idle" | "submitting" | "success" | "error";
}

export function usePreferenceEditForm() {
  const [state, setState] = useState<FormState>({
    data: {
      reading_preferences: "",
      preferred_language: "",
    },
    errors: {},
    status: "idle",
  });

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await fetch("/api/preferences");
      if (!response.ok) {
        throw new Error("Failed to fetch preferences");
      }
      const data: UserPreferencesResponseDto = await response.json();
      setState((prev) => ({
        ...prev,
        data: {
          reading_preferences: data.reading_preferences,
          preferred_language: data.preferred_language,
        },
      }));
    } catch (error) {
      console.error("Error fetching preferences:", error);
    }
  };

  const validateForm = (): FormErrors => {
    const errors: FormErrors = {};

    if (!state.data.reading_preferences.trim()) {
      errors.reading_preferences = "Reading preferences are required";
    } else if (state.data.reading_preferences.length > 1000) {
      errors.reading_preferences = "Reading preferences cannot exceed 1000 characters";
    }

    if (!state.data.preferred_language) {
      errors.preferred_language = "Preferred language is required";
    }

    return errors;
  };

  const handleChange = (field: keyof UpdateUserPreferencesDto, value: string) => {
    setState((prev) => ({
      ...prev,
      data: { ...prev.data, [field]: value },
      errors: { ...prev.errors, [field]: undefined },
    }));
  };

  const submitForm = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setState((prev) => ({ ...prev, errors }));
      throw new Error("Please fix the form errors");
    }

    setState((prev) => ({ ...prev, status: "submitting" }));

    try {
      const response = await fetch("/api/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state.data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to update preferences");
      }

      setState((prev) => ({ ...prev, status: "success" }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        status: "error",
      }));
      throw error;
    }
  };

  const isValid = Object.keys(state.errors).length === 0;

  return {
    ...state,
    handleChange,
    submitForm,
    isValid,
  };
}
