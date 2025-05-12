import { useState } from "react";
import type { PreferencesFormData, PreferencesFormErrors, PreferencesFormState } from "../components/onboarding/types";

const initialData: PreferencesFormData = {
  reading_preferences: "",
  preferred_language: "",
};

export function usePreferencesForm(initialFormData: PreferencesFormData = initialData) {
  const [state, setState] = useState<PreferencesFormState>({
    data: initialFormData,
    errors: {},
    status: "idle",
  });

  const validateForm = () => {
    const errors: PreferencesFormErrors = {};

    if (!state.data.reading_preferences.trim()) {
      errors.reading_preferences = "Reading preferences are required";
    } else if (state.data.reading_preferences.length > 1000) {
      errors.reading_preferences = "Reading preferences cannot exceed 1000 characters";
    }

    if (!state.data.preferred_language) {
      errors.preferred_language = "Language selection is required";
    }

    setState((prev) => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field: keyof PreferencesFormData, value: string) => {
    setState((prev) => {
      const newData = { ...prev.data, [field]: value };
      return {
        ...prev,
        data: newData,
        errors: {},
      };
    });
  };

  const resetForm = () => {
    setState({
      data: initialFormData,
      errors: {},
      status: "idle",
    });
  };

  const submitForm = async () => {
    if (!validateForm()) return;

    setState((prev) => ({ ...prev, status: "submitting" }));

    try {
      const response = await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state.data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "An unknown error occurred");
      }

      setState((prev) => ({ ...prev, status: "success" }));
      window.location.href = "/recommendations";
    } catch (error) {
      setState((prev) => ({
        ...prev,
        status: "error",
        errorMessage: error instanceof Error ? error.message : "An unknown error occurred",
      }));
    }
  };

  const isFormValid = () => {
    return (
      state.data.reading_preferences.trim().length > 0 &&
      state.data.reading_preferences.length <= 1000 &&
      state.data.preferred_language.length > 0
    );
  };

  return {
    ...state,
    handleChange,
    resetForm,
    submitForm,
    isValid: isFormValid(),
  };
}
