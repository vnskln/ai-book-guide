# Plan implementacji widoku Onboarding

## 1. Przegląd
Widok Onboarding jest pierwszym ekranem, który widzi nowy użytkownik po rejestracji w aplikacji AI Book Guide. Umożliwia użytkownikowi wprowadzenie preferencji czytelniczych oraz wybór preferowanego języka rekomendacji, co jest kluczowym elementem dla działania systemu rekomendacji książek. Po zatwierdzeniu preferencji użytkownik jest przekierowywany do głównego widoku z rekomendacjami.

## 2. Routing widoku
```
/onboarding
```
Widok powinien być dostępny pod ścieżką `/onboarding` i powinien być automatycznie pokazywany nowym użytkownikom po zalogowaniu, jeśli nie mają jeszcze ustawionych preferencji.

## 3. Struktura komponentów
```
OnboardingPage (Astro)
└── OnboardingForm (React)
    ├── PreferencesTextarea
    │   └── CharacterCounter
    ├── LanguageSelect
    └── ActionButtons
```

## 4. Szczegóły komponentów

### OnboardingPage
- Opis komponentu: Główny komponent widoku onboardingu, zbudowany w Astro, który renderuje formularz onboardingowy i zarządza layoutem strony.
- Główne elementy: Tytuł strony, opis celu formularza, komponent OnboardingForm
- Obsługiwane interakcje: Brak bezpośrednich interakcji (delegowane do OnboardingForm)
- Obsługiwana walidacja: Brak (delegowana do OnboardingForm)
- Typy: Nie wymaga specyficznych typów
- Propsy: Nie przyjmuje propsów

### OnboardingForm
- Opis komponentu: Interaktywny formularz React do zbierania preferencji czytelniczych od użytkownika.
- Główne elementy: 
  - Card z Shadcn/ui jako kontener
  - Formularz z dwoma głównymi sekcjami: preferencje i język
  - Przyciski akcji
- Obsługiwane interakcje: 
  - Wypełnianie formularza
  - Przesyłanie formularza
  - Resetowanie formularza
- Obsługiwana walidacja: 
  - Preferencje czytelnicze: wymagane, maksymalnie 1000 znaków
  - Preferowany język: wymagane
- Typy: 
  - PreferencesFormData
  - PreferencesFormErrors
- Propsy: 
  - supportedLanguages: tablica dostępnych języków

### PreferencesTextarea
- Opis komponentu: Tekstarea do wprowadzania preferencji czytelniczych z licznikiem znaków.
- Główne elementy: 
  - Label z Shadcn/ui
  - Textarea z limitacją znaków
  - CharacterCounter pokazujący liczbę wprowadzonych/maksymalnych znaków
- Obsługiwane interakcje: 
  - Wprowadzanie tekstu
  - Obsługa zdarzeń onChange i onBlur
- Obsługiwana walidacja: 
  - Pole wymagane
  - Maksymalna długość 1000 znaków
- Typy: Brak specyficznych
- Propsy: 
  - value: string
  - onChange: (value: string) => void
  - error?: string
  - maxLength: number

### CharacterCounter
- Opis komponentu: Komponent pokazujący liczbę wpisanych znaków i limit.
- Główne elementy: Tekst z licznikiem
- Obsługiwane interakcje: Brak (komponent prezentacyjny)
- Obsługiwana walidacja: Brak
- Typy: Brak specyficznych
- Propsy: 
  - currentLength: number
  - maxLength: number
  - isExceeded: boolean

### LanguageSelect
- Opis komponentu: Dropdown do wyboru preferowanego języka.
- Główne elementy: 
  - Label z Shadcn/ui
  - Select z Shadcn/ui
  - Lista języków
- Obsługiwane interakcje: 
  - Wybór języka z listy
  - Zdarzenie onChange
- Obsługiwana walidacja: 
  - Pole wymagane
- Typy: 
  - LanguageOption
- Propsy: 
  - value: string
  - onChange: (value: string) => void
  - options: LanguageOption[]
  - error?: string

### ActionButtons
- Opis komponentu: Grupa przycisków do zatwierdzania lub resetowania formularza.
- Główne elementy: 
  - Przyciski z Shadcn/ui
- Obsługiwane interakcje: 
  - Kliknięcie submit
  - Kliknięcie reset
- Obsługiwana walidacja: Brak
- Typy: Brak specyficznych
- Propsy: 
  - onReset: () => void
  - isSubmitting: boolean
  - isValid: boolean

## 5. Typy

```typescript
// Opcja języka w dropdown
interface LanguageOption {
  value: string;   // kod języka (np. "pl", "en")
  label: string;   // nazwa języka (np. "Polski", "English")
}

// Dane formularza preferencji
interface PreferencesFormData {
  reading_preferences: string;
  preferred_language: string;
}

// Błędy walidacji formularza
interface PreferencesFormErrors {
  reading_preferences?: string;
  preferred_language?: string;
}

// Status formularza
type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

// Stan formularza
interface PreferencesFormState {
  data: PreferencesFormData;
  errors: PreferencesFormErrors;
  status: FormStatus;
  errorMessage?: string;
}

// Odpowiedź API po utworzeniu preferencji
interface PreferencesApiResponse {
  id: string;
  user_id: string;
  reading_preferences: string;
  preferred_language: string;
  created_at: string;
  updated_at: string;
}
```

## 6. Zarządzanie stanem

### usePreferencesForm Hook
Własny hook do zarządzania stanem formularza preferencji:

```typescript
function usePreferencesForm(initialData: PreferencesFormData = { 
  reading_preferences: '', 
  preferred_language: '' 
}) {
  const [state, setState] = useState<PreferencesFormState>({
    data: initialData,
    errors: {},
    status: 'idle'
  });
  
  // Walidacja formularza
  const validateForm = () => {
    const errors: PreferencesFormErrors = {};
    
    if (!state.data.reading_preferences.trim()) {
      errors.reading_preferences = 'Preferencje czytelnicze są wymagane';
    } else if (state.data.reading_preferences.length > 1000) {
      errors.reading_preferences = 'Preferencje nie mogą przekraczać 1000 znaków';
    }
    
    if (!state.data.preferred_language) {
      errors.preferred_language = 'Wybór języka jest wymagany';
    }
    
    setState(prev => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };
  
  // Obsługa zmian w formularzu
  const handleChange = (field: keyof PreferencesFormData, value: string) => {
    setState(prev => ({
      ...prev,
      data: { ...prev.data, [field]: value },
      // Czyszczenie błędu dla zmienionego pola
      errors: { ...prev.errors, [field]: undefined }
    }));
  };
  
  // Resetowanie formularza
  const resetForm = () => {
    setState({
      data: initialData,
      errors: {},
      status: 'idle'
    });
  };
  
  // Wysyłanie formularza
  const submitForm = async () => {
    if (!validateForm()) return;
    
    setState(prev => ({ ...prev, status: 'submitting' }));
    
    try {
      const response = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Wystąpił nieznany błąd');
      }
      
      setState(prev => ({ ...prev, status: 'success' }));
      
      // Przekierowanie do głównego widoku
      window.location.href = '/recommendations';
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Wystąpił nieznany błąd'
      }));
    }
  };
  
  return {
    ...state,
    handleChange,
    resetForm,
    submitForm,
    isValid: Object.keys(state.errors).length === 0
  };
}
```

## 7. Integracja API

Integracja z endpointem `/api/preferences` poprzez hook `usePreferencesForm`.

**Żądanie POST:**
```typescript
fetch('/api/preferences', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    reading_preferences: string, // max 1000 znaków
    preferred_language: string   // min 2 znaki
  })
});
```

**Odpowiedź (sukces - 201):**
```typescript
{
  id: string,
  user_id: string,
  reading_preferences: string,
  preferred_language: string,
  created_at: string,
  updated_at: string
}
```

**Obsługiwane błędy:**
- 400: Nieprawidłowe dane wejściowe
- 401: Użytkownik niezalogowany
- 409: Preferencje już istnieją dla tego użytkownika

## 8. Interakcje użytkownika

1. **Wprowadzanie preferencji czytelniczych:**
   - Użytkownik wprowadza tekst w pole tekstowe
   - System dynamicznie aktualizuje licznik znaków
   - System waliduje długość tekstu (max 1000 znaków)

2. **Wybór języka:**
   - Użytkownik klika dropdown z językami
   - System wyświetla listę dostępnych języków
   - Użytkownik wybiera preferowany język
   - System zapisuje wybór

3. **Zatwierdzanie formularza:**
   - Użytkownik klika przycisk "Zatwierdź"
   - System waliduje formularz
   - Jeśli walidacja przechodzi, system wysyła dane do API
   - Wyświetlany jest stan ładowania
   - Po sukcesie użytkownik jest przekierowywany do głównego widoku
   - W przypadku błędu wyświetlany jest komunikat błędu

4. **Resetowanie formularza:**
   - Użytkownik klika przycisk "Resetuj"
   - System czyści wszystkie pola i błędy walidacji

## 9. Warunki i walidacja

### Preferencje czytelnicze:
- **Warunek wymagany:** Pole nie może być puste lub zawierać tylko białe znaki
- **Komunikat błędu:** "Preferencje czytelnicze są wymagane"
- **Wpływ na UI:** Podświetlenie pola na czerwono, wyświetlenie komunikatu błędu poniżej

- **Warunek maksymalnej długości:** Tekst nie może przekraczać 1000 znaków
- **Komunikat błędu:** "Preferencje nie mogą przekraczać 1000 znaków"
- **Wpływ na UI:** Podświetlenie pola i licznika na czerwono, wyświetlenie komunikatu błędu, zablokowanie przycisku zatwierdzania

### Preferowany język:
- **Warunek wymagany:** Musi być wybrany język
- **Komunikat błędu:** "Wybór języka jest wymagany"
- **Wpływ na UI:** Podświetlenie selecta na czerwono, wyświetlenie komunikatu błędu poniżej

### Ogólna walidacja:
- Przycisk zatwierdzania jest nieaktywny, dopóki wszystkie pola nie są prawidłowo wypełnione
- Walidacja uruchamiana jest przy:
  - utracie focusu pola
  - zmianie wartości pola
  - próbie zatwierdzenia formularza

## 10. Obsługa błędów

### Błędy walidacji:
- Komunikaty błędów wyświetlane pod odpowiednimi polami
- Wizualne oznaczenie nieprawidłowych pól
- Blokada wysłania formularza do czasu poprawy błędów

### Błędy API:
- **400 Bad Request:**
  - Wyświetlenie komunikatu "Nieprawidłowe dane. Sprawdź wprowadzone informacje."
  - Możliwość poprawy danych i ponownej próby

- **401 Unauthorized:**
  - Wyświetlenie komunikatu "Sesja wygasła. Zaloguj się ponownie."
  - Przekierowanie do strony logowania

- **409 Conflict:**
  - Wyświetlenie komunikatu "Preferencje już istnieją dla tego konta."
  - Przekierowanie do głównego widoku aplikacji

- **Inne błędy:**
  - Wyświetlenie ogólnego komunikatu błędu
  - Możliwość ponownej próby lub kontaktu z pomocą techniczną

### Obsługa braku połączenia:
- Wykrywanie braku połączenia internetowego
- Wyświetlanie komunikatu "Brak połączenia z internetem. Sprawdź swoje połączenie i spróbuj ponownie."
- Przycisk ponowienia próby

## 11. Kroki implementacji

1. **Stworzenie struktury plików:**
   - Utwórz plik `src/pages/onboarding.astro` dla głównego widoku
   - Utwórz katalog `src/components/onboarding` dla komponentów
   - Utwórz pliki komponentów: `OnboardingForm.tsx`, `PreferencesTextarea.tsx`, `LanguageSelect.tsx`, `CharacterCounter.tsx`, `ActionButtons.tsx`

2. **Implementacja typów:**
   - Zdefiniuj wymagane interfejsy i typy w pliku `src/components/onboarding/types.ts`

3. **Implementacja hooka:**
   - Stwórz plik `src/hooks/usePreferencesForm.ts` z logiką formularza

4. **Implementacja komponentów:**
   - Zaimplementuj najmniejsze komponenty (CharacterCounter, ActionButtons)
   - Zaimplementuj komponenty formularza (PreferencesTextarea, LanguageSelect)
   - Zaimplementuj główny komponent formularza OnboardingForm
   - Zaimplementuj stronę Astro (OnboardingPage)

5. **Styl komponentów:**
   - Zastosuj komponenty Shadcn/ui
   - Dodaj odpowiednie klasy Tailwind dla stylizacji

6. **Testy komponentów:**
   - Napisz testy dla głównej funkcjonalności
   - Przetestuj warunki błędów i obsługę wyjątków

7. **Integracja z API:**
   - Podłącz formularz do API `/api/preferences`
   - Zaimplementuj obsługę odpowiedzi i błędów

8. **Implementacja routingu:**
   - Dodaj przekierowania po pomyślnym zapisie preferencji
   - Dodaj zabezpieczenia widoku (tylko dla nowych użytkowników bez preferencji)

9. **Testowanie końcowe:**
   - Przetestuj pełny proces onboardingu
   - Upewnij się, że wszystkie przypadki brzegowe są obsługiwane

10. **Dokumentacja:**
    - Dodaj komentarze do kodu
    - Zaktualizuj dokumentację projektu o nowy widok 