# Plan implementacji widoku "Edycja Preferencji"

## 1. Przegląd
Widok "Edycja Preferencji" umożliwia użytkownikowi aktualizację swoich preferencji czytelniczych oraz preferowanego języka książek. Zmiany te będą wpływać na przyszłe rekomendacje książek generowane przez system AI Book Guide. Widok stanowi realizację wymagania US-003 z dokumentu PRD.

## 2. Routing widoku
Widok będzie dostępny pod ścieżką: `/profile/preferences`

## 3. Struktura komponentów
```
ProfileLayout (Astro)
└── ProfilePreferencesView (React)
    ├── ProfilePageHeader
    ├── PreferencesForm
    │   ├── PreferencesTextarea
    │   │   └── CharacterCounter
    │   ├── LanguageSelect
    │   └── ActionButtons
    └── Toast (komunikaty sukcesu/błędu)
```

## 4. Szczegóły komponentów

### ProfileLayout
- Opis: Komponent kontenerowy Astro dla stron profilu użytkownika
- Główne elementy: Container, slot dla komponentów React
- Propsy: `title: string`

### ProfilePreferencesView
- Opis: Główny komponent React renderujący formularz edycji preferencji
- Główne elementy: ProfilePageHeader, PreferencesForm, Toast
- Obsługiwane interakcje: Inicjalizacja widoku, pobieranie aktualnych preferencji

### ProfilePageHeader
- Opis: Komponent nagłówka strony
- Główne elementy: Tytuł strony, podtytuł z opisem
- Propsy: `title: string, description: string`

### PreferencesForm
- Opis: Formularz do edycji preferencji
- Główne elementy: PreferencesTextarea, LanguageSelect, ActionButtons
- Obsługiwane interakcje: 
  - Wysłanie formularza z aktualizacją preferencji
  - Walidacja pól formularza
  - Wyświetlanie błędów walidacji i odpowiedzi API
- Obsługiwana walidacja:
  - Długość tekstu preferencji: max 1000 znaków
  - Wymagane wypełnienie pola preferencji
  - Wymagane wybranie języka
- Typy: 
  - PreferencesFormData
  - PreferencesFormErrors
  - PreferencesFormState
- Propsy: inicjalne dane formularza (opcjonalne)

### PreferencesTextarea
- Opis: Komponent do wprowadzania tekstu preferencji czytelniczych
- Główne elementy: Label, Textarea, CharacterCounter, komunikat błędu
- Obsługiwane interakcje: Aktualizacja tekstu, walidacja długości
- Obsługiwana walidacja: Długość tekstu (max 1000 znaków)
- Propsy: 
  ```typescript
  {
    value: string,
    onChange: (value: string) => void,
    error?: string,
    maxLength: number
  }
  ```

### CharacterCounter
- Opis: Komponent wyświetlający licznik znaków
- Główne elementy: Tekst informacyjny o liczbie znaków
- Propsy: 
  ```typescript
  {
    currentLength: number,
    maxLength: number,
    isExceeded: boolean
  }
  ```

### LanguageSelect
- Opis: Komponent selecta do wyboru preferowanego języka
- Główne elementy: Label, Select z opcjami językowymi
- Obsługiwane interakcje: Wybór języka z listy
- Propsy: 
  ```typescript
  {
    value: string,
    onChange: (value: string) => void,
    options: LanguageOption[],
    error?: string
  }
  ```

### ActionButtons
- Opis: Komponent przycisków akcji formularza
- Główne elementy: Przycisk "Zapisz preferencje"
- Obsługiwane interakcje: Kliknięcie zapisu formularza
- Propsy: 
  ```typescript
  {
    isSubmitting: boolean,
    isValid: boolean
  }
  ```

## 5. Typy

```typescript
// Typy podstawowe
interface LanguageOption {
  value: string;
  label: string;
}

// Typy formularza
interface PreferencesFormData {
  reading_preferences: string;
  preferred_language: string;
}

interface PreferencesFormErrors {
  reading_preferences?: string;
  preferred_language?: string;
}

type FormStatus = "idle" | "submitting" | "success" | "error";

interface PreferencesFormState {
  data: PreferencesFormData;
  errors: PreferencesFormErrors;
  status: FormStatus;
  errorMessage?: string;
}

// Propsy komponentów
interface PreferencesTextareaProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  maxLength: number;
}

interface LanguageSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: LanguageOption[];
  error?: string;
}

interface ActionButtonsProps {
  isSubmitting: boolean;
  isValid: boolean;
}
```

## 6. Zarządzanie stanem

Zarządzanie stanem będzie realizowane przez hook `usePreferenceEditForm`:

```typescript
function usePreferenceEditForm(initialData?: PreferencesFormData) {
  const [state, setState] = useState<PreferencesFormState>({
    data: initialData || { reading_preferences: "", preferred_language: "" },
    errors: {},
    status: "idle",
  });

  // Funkcja do pobierania aktualnych preferencji
  const fetchPreferences = async () => {
    try {
      const response = await fetch("/api/preferences");
      if (response.ok) {
        const data = await response.json();
        setState(prev => ({
          ...prev,
          data: {
            reading_preferences: data.reading_preferences,
            preferred_language: data.preferred_language,
          }
        }));
      } else {
        throw new Error("Failed to fetch preferences");
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        status: "error",
        errorMessage: "Nie udało się pobrać preferencji"
      }));
    }
  };

  // Funkcja walidacji
  const validateForm = () => { ... };

  // Obsługa zmiany pól
  const handleChange = (field: keyof PreferencesFormData, value: string) => { ... };

  // Wysłanie formularza
  const submitForm = async () => {
    if (!validateForm()) return;
    
    setState(prev => ({ ...prev, status: "submitting" }));
    
    try {
      const response = await fetch("/api/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state.data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Wystąpił nieznany błąd");
      }
      
      setState(prev => ({ ...prev, status: "success" }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        status: "error",
        errorMessage: error instanceof Error ? error.message : "Wystąpił nieznany błąd"
      }));
    }
  };

  // Sprawdzenie poprawności formularza
  const isFormValid = () => { ... };

  // Efekt do pobierania preferencji przy inicjalizacji
  useEffect(() => {
    fetchPreferences();
  }, []);

  return {
    ...state,
    handleChange,
    submitForm,
    isValid: isFormValid(),
    fetchPreferences,
  };
}
```

## 7. Integracja API

Widok będzie korzystał z następujących endpointów API:

1. **GET /api/preferences**
   - Pobieranie aktualnych preferencji użytkownika
   - Odpowiedź: `UserPreferencesResponseDto`

2. **PUT /api/preferences**
   - Aktualizacja preferencji użytkownika
   - Dane wejściowe: `UpdateUserPreferencesDto`
   - Odpowiedź: `UserPreferencesResponseDto`

Typy zapytań i odpowiedzi:

```typescript
// Zapytanie PUT
interface UpdateUserPreferencesDto {
  reading_preferences: string;
  preferred_language: string;
}

// Odpowiedź GET i PUT
interface UserPreferencesResponseDto {
  id: string;
  user_id: string;
  reading_preferences: string;
  preferred_language: string;
  created_at: string;
  updated_at: string;
}
```

## 8. Interakcje użytkownika

1. **Inicjalizacja widoku**
   - Użytkownik przechodzi do strony `/profile/preferences`
   - System pobiera aktualne preferencje i wypełnia formularz

2. **Edycja preferencji czytelniczych**
   - Użytkownik modyfikuje tekst w polu preferencji
   - System waliduje długość tekstu i wyświetla licznik znaków
   - Jeśli przekroczono limit, wyświetla ostrzeżenie

3. **Zmiana preferowanego języka**
   - Użytkownik wybiera język z listy rozwijanej
   - System aktualizuje stan formularza

4. **Zapisywanie zmian**
   - Użytkownik klika przycisk "Zapisz preferencje"
   - System waliduje formularz przed wysłaniem
   - System wysyła dane do API
   - System wyświetla komunikat o powodzeniu lub błędzie

## 9. Warunki i walidacja

- **Walidacja długości tekstu preferencji:**
  - Pole nie może być puste
  - Tekst nie może przekraczać 1000 znaków
  - Walidacja realizowana w `PreferencesTextarea` oraz `usePreferenceEditForm`
  - Błąd wyświetlany pod polem tekstowym

- **Walidacja języka:**
  - Pole musi zawierać wybraną wartość
  - Walidacja realizowana w `usePreferenceEditForm`
  - Błąd wyświetlany pod polem select

- **Walidacja formularza przed wysłaniem:**
  - Formularz nie może zawierać błędów
  - Przycisk zapisu jest nieaktywny, gdy formularz zawiera błędy lub trwa wysyłanie

## 10. Obsługa błędów

- **Błędy pobierania danych:**
  - Wyświetlenie komunikatu o błędzie pobierania preferencji
  - Możliwość ponownej próby pobrania

- **Błędy walidacji formularza:**
  - Wyświetlenie komunikatów błędów pod odpowiednimi polami
  - Blokada wysłania formularza, gdy zawiera błędy

- **Błędy API podczas zapisu:**
  - Wyświetlenie komunikatu z błędem zwróconym przez API
  - Pozostawienie formularza w stanie edycji z wprowadzonymi danymi

## 11. Kroki implementacji

1. Utworzenie pliku strony `src/pages/profile/preferences.astro`
2. Implementacja `ProfileLayout` jako podstawowego układu stron profilu
3. Stworzenie komponentu `ProfilePreferencesView` i jego podkomponentów:
   - Implementacja `ProfilePageHeader`
   - Wykorzystanie istniejących komponentów `PreferencesTextarea`, `LanguageSelect`, `ActionButtons`
4. Implementacja hooka `usePreferenceEditForm` do zarządzania stanem formularza
5. Połączenie komponentów w widok i dodanie obsługi komunikatów Toast
6. Dodanie nawigacji do widoku z innych miejsc w aplikacji (np. menu główne)
7. Testowanie funkcjonalności:
   - Testowanie walidacji formularza
   - Testowanie integracji z API
   - Testowanie obsługi błędów
8. Wprowadzenie poprawek na podstawie wyników testów 