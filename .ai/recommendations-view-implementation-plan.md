# Plan implementacji widoku Rekomendacji

## 1. Przegląd
Widok Rekomendacji jest głównym interfejsem aplikacji AI Book Guide, który umożliwia użytkownikom otrzymywanie, przeglądanie i zarządzanie sugestiami książek. Pozwala on na generowanie nowych rekomendacji, akceptowanie lub odrzucanie sugestii oraz przeglądanie historii wcześniejszych rekomendacji.

## 2. Routing widoku
Widok będzie dostępny pod dwoma ścieżkami:
- `/` - strona główna aplikacji
- `/recommendations` - alternatywna ścieżka

## 3. Struktura komponentów
```
RecommendationsPage
├── RecommendationButton
├── LoadingOverlay (warunkowy)
├── CurrentRecommendation (warunkowy)
│   ├── RecommendationCard
│   └── RecommendationActions
└── RecommendationHistory
    ├── HistoryRecommendationCard[]
    └── Pagination
```

## 4. Szczegóły komponentów

### RecommendationsPage
- Opis komponentu: Główny komponent strony zarządzający całym widokiem rekomendacji
- Główne elementy: Kontener przechowujący wszystkie podkomponenty, hook useRecommendations do zarządzania stanem
- Obsługiwane interakcje: Inicjalizacja danych (historia rekomendacji), zarządzanie stanem widoku
- Obsługiwana walidacja: Sprawdzanie stanu sesji użytkownika
- Typy: RecommendationViewState
- Propsy: N/A (komponent najwyższego poziomu)

### RecommendationButton
- Opis komponentu: Przycisk do generowania nowej rekomendacji książki
- Główne elementy: Przycisk z tekstem "Zasugeruj mi kolejną książkę", ikona
- Obsługiwane interakcje: onClick - inicjalizacja procesu generowania rekomendacji
- Obsługiwana walidacja: Blokowanie przycisku podczas generowania rekomendacji
- Typy: RecommendationViewStatus
- Propsy: 
  ```typescript
  {
    onClick: () => void;
    status: RecommendationViewStatus;
  }
  ```

### LoadingOverlay
- Opis komponentu: Nakładka wyświetlana podczas generowania rekomendacji
- Główne elementy: Półprzezroczysty overlay, spinner, komunikat o ładowaniu, przycisk anulowania, timer
- Obsługiwane interakcje: onCancel - anulowanie procesu, onRetry - ponowienie próby (w przypadku błędu)
- Obsługiwana walidacja: Śledzenie czasu generowania, wykrywanie timeout (30 sekund)
- Typy: RecommendationViewStatus
- Propsy: 
  ```typescript
  {
    status: RecommendationViewStatus;
    onCancel: () => void;
    onRetry: () => void;
    error?: string;
  }
  ```

### CurrentRecommendation
- Opis komponentu: Kontener do wyświetlania aktualnej (najnowszej) rekomendacji oczekującej na decyzję
- Główne elementy: RecommendationCard, RecommendationActions
- Obsługiwane interakcje: Delegowane do podkomponentów
- Obsługiwana walidacja: Sprawdzanie czy rekomendacja istnieje
- Typy: RecommendationResponseDto
- Propsy: 
  ```typescript
  {
    recommendation: RecommendationResponseDto;
    onAccept: (id: string) => void;
    onReject: (id: string) => void;
    isActionLoading: boolean;
  }
  ```

### RecommendationCard
- Opis komponentu: Karta wyświetlająca szczegóły rekomendacji książki
- Główne elementy: Tytuł, autor, język, zarys fabuły, uzasadnienie rekomendacji
- Obsługiwane interakcje: N/A (tylko wyświetlanie)
- Obsługiwana walidacja: N/A
- Typy: RecommendationResponseDto, RecommendationCardProps
- Propsy: 
  ```typescript
  {
    recommendation: RecommendationResponseDto;
    isCompact?: boolean;
  }
  ```

### RecommendationActions
- Opis komponentu: Przyciski akcji dla bieżącej rekomendacji
- Główne elementy: Przycisk akceptacji, przycisk odrzucenia
- Obsługiwane interakcje: onAccept - akceptacja rekomendacji, onReject - odrzucenie rekomendacji
- Obsługiwana walidacja: Blokowanie przycisków podczas wykonywania akcji
- Typy: RecommendationActionsProps
- Propsy: 
  ```typescript
  {
    recommendationId: string;
    onAccept: (id: string) => void;
    onReject: (id: string) => void;
    isLoading: boolean;
  }
  ```

### RecommendationHistory
- Opis komponentu: Lista historii rekomendacji z paginacją
- Główne elementy: Nagłówek sekcji, lista HistoryRecommendationCard, komponent Pagination
- Obsługiwane interakcje: onPageChange - zmiana strony paginacji
- Obsługiwana walidacja: Sprawdzanie czy historia rekomendacji istnieje
- Typy: RecommendationPaginatedResponseDto
- Propsy: 
  ```typescript
  {
    history: {
      data: RecommendationResponseDto[];
      pagination: PaginationInfo;
      isLoading: boolean;
    };
    onPageChange: (page: number) => void;
  }
  ```

### HistoryRecommendationCard
- Opis komponentu: Uproszczona wersja karty rekomendacji dla listy historii
- Główne elementy: Tytuł książki, autor, status, data utworzenia, badge statusu
- Obsługiwane interakcje: onClick - wyświetlenie szczegółów rekomendacji (opcjonalnie)
- Obsługiwana walidacja: N/A
- Typy: RecommendationResponseDto
- Propsy: 
  ```typescript
  {
    recommendation: RecommendationResponseDto;
    onClick?: () => void;
  }
  ```

## 5. Typy

### Enums

```typescript
enum RecommendationViewStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  ERROR = 'error',
  TIMEOUT = 'timeout'
}

enum RecommendationActionStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error'
}
```

### Interfaces

```typescript
// Stan widoku rekomendacji
interface RecommendationViewState {
  status: RecommendationViewStatus;
  currentRecommendation: RecommendationResponseDto | null;
  error: string | null;
  history: {
    data: RecommendationResponseDto[];
    pagination: PaginationInfo;
    isLoading: boolean;
    error: string | null;
  };
}

// Stan akcji na rekomendacji
interface RecommendationActionState {
  status: RecommendationActionStatus;
  error: string | null;
}

// Props dla karty rekomendacji
interface RecommendationCardProps {
  recommendation: RecommendationResponseDto;
  isCompact?: boolean;
}

// Props dla przycisków akcji
interface RecommendationActionsProps {
  recommendationId: string;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  isLoading: boolean;
}
```

## 6. Zarządzanie stanem

Głównym mechanizmem zarządzania stanem będzie custom hook `useRecommendations`:

```typescript
function useRecommendations() {
  // Stan całego widoku rekomendacji
  const [viewState, setViewState] = useState<RecommendationViewState>({
    status: RecommendationViewStatus.IDLE,
    currentRecommendation: null,
    error: null,
    history: {
      data: [],
      pagination: { total: 0, page: 1, limit: 10, total_pages: 0 },
      isLoading: false,
      error: null
    }
  });
  
  // Stan akcji (akceptacja/odrzucenie)
  const [actionState, setActionState] = useState<RecommendationActionState>({
    status: RecommendationActionStatus.IDLE,
    error: null
  });

  // Funkcja generująca nową rekomendację
  const generateRecommendation = async () => {
    // Implementacja...
  };
  
  // Funkcja akceptująca rekomendację
  const acceptRecommendation = async (id: string) => {
    // Implementacja...
  };
  
  // Funkcja odrzucająca rekomendację
  const rejectRecommendation = async (id: string) => {
    // Implementacja...
  };
  
  // Funkcja pobierająca historię rekomendacji
  const fetchHistory = async (page: number = 1, status?: RecommendationStatus) => {
    // Implementacja...
  };
  
  // Funkcja do obsługi zmiany strony
  const setPage = (page: number) => {
    // Implementacja...
  };
  
  // Inicjalizacja przy montowaniu komponentu
  useEffect(() => {
    fetchHistory();
  }, []);
  
  return {
    viewState,
    actionState,
    generateRecommendation,
    acceptRecommendation,
    rejectRecommendation,
    fetchHistory,
    setPage
  };
}
```

Dodatkowo, dla obsługi timeoutu podczas generowania rekomendacji użyjemy:

```typescript
function useTimeout(callback: () => void, delay: number) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);
  
  const startTimer = useCallback(() => {
    clearTimer();
    timeoutRef.current = setTimeout(callback, delay);
  }, [callback, delay, clearTimer]);
  
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);
  
  return { startTimer, clearTimer };
}
```

## 7. Integracja API

### Generowanie rekomendacji
```typescript
async function generateRecommendation() {
  try {
    setViewState(prev => ({ ...prev, status: RecommendationViewStatus.LOADING, error: null }));
    
    // Uruchomienie timera dla timeout po 30 sekundach
    startTimer();
    
    const response = await fetch('/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    // Zatrzymanie timera
    clearTimer();
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const data: RecommendationResponseDto = await response.json();
    setViewState(prev => ({
      ...prev,
      status: RecommendationViewStatus.IDLE,
      currentRecommendation: data
    }));
  } catch (error) {
    clearTimer();
    setViewState(prev => ({
      ...prev,
      status: RecommendationViewStatus.ERROR,
      error: error instanceof Error ? error.message : 'Unknown error'
    }));
  }
}
```

### Pobieranie historii rekomendacji
```typescript
async function fetchHistory(page: number = 1, status?: RecommendationStatus) {
  try {
    setViewState(prev => ({
      ...prev,
      history: { ...prev.history, isLoading: true, error: null }
    }));
    
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (status) params.append('status', status);
    
    const response = await fetch(`/api/recommendations?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const data: RecommendationPaginatedResponseDto = await response.json();
    setViewState(prev => ({
      ...prev,
      history: {
        data: data.data,
        pagination: data.pagination,
        isLoading: false,
        error: null
      }
    }));
  } catch (error) {
    setViewState(prev => ({
      ...prev,
      history: {
        ...prev.history,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }));
  }
}
```

### Aktualizacja statusu rekomendacji
```typescript
async function updateRecommendationStatus(id: string, status: RecommendationStatus) {
  try {
    setActionState({ status: RecommendationActionStatus.LOADING, error: null });
    
    const response = await fetch(`/api/recommendations?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const data = await response.json();
    setActionState({ status: RecommendationActionStatus.SUCCESS, error: null });
    
    // Aktualizacja stanu widoku
    setViewState(prev => ({
      ...prev,
      currentRecommendation: null
    }));
    
    // Odświeżenie historii
    fetchHistory();
    
    return data;
  } catch (error) {
    setActionState({
      status: RecommendationActionStatus.ERROR,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
}
```

## 8. Interakcje użytkownika

### Generowanie rekomendacji
1. Użytkownik klika przycisk "Zasugeruj mi kolejną książkę"
2. System zmienia stan na LOADING i wyświetla LoadingOverlay
3. System wywołuje API POST /api/recommendations
4. Po otrzymaniu odpowiedzi, system zmienia stan na IDLE i wyświetla CurrentRecommendation
5. Jeśli wystąpi błąd, system wyświetla komunikat o błędzie z opcją ponowienia
6. Jeśli generowanie trwa dłużej niż 30 sekund, system wyświetla komunikat o timeout z opcją ponowienia

### Akceptacja rekomendacji
1. Użytkownik klika przycisk "Akceptuj"
2. System zmienia stan akcji na LOADING i blokuje przyciski
3. System wywołuje API PUT /api/recommendations?id=<uuid> z body { status: "accepted" }
4. Po otrzymaniu odpowiedzi, system usuwa CurrentRecommendation i odświeża historię
5. Jeśli wystąpi błąd, system wyświetla komunikat o błędzie

### Odrzucenie rekomendacji
1. Użytkownik klika przycisk "Odrzuć"
2. System zmienia stan akcji na LOADING i blokuje przyciski
3. System wywołuje API PUT /api/recommendations?id=<uuid> z body { status: "rejected" }
4. Po otrzymaniu odpowiedzi, system usuwa CurrentRecommendation i odświeża historię
5. Jeśli wystąpi błąd, system wyświetla komunikat o błędzie

### Przeglądanie historii
1. System automatycznie ładuje historię rekomendacji przy montowaniu komponentu
2. Użytkownik może przeglądać kolejne strony historii używając paginacji
3. System wyświetla stan ładowania podczas pobierania nowych danych

## 9. Warunki i walidacja

### Generowanie rekomendacji
- Przycisk generowania jest zablokowany podczas ładowania
- System monitoruje czas generowania i zgłasza timeout po 30 sekundach
- System obsługuje różne kody błędów z API (401, 429)

### Aktualizacja statusu rekomendacji
- Przyciski akcji są zablokowane podczas wykonywania akcji
- System weryfikuje czy rekomendacja istnieje przed wykonaniem akcji
- System obsługuje różne kody błędów z API (400, 401, 403, 404)

### Historia rekomendacji
- System wyświetla przyjazny komunikat gdy historia jest pusta
- System obsługuje błędy podczas ładowania historii

## 10. Obsługa błędów

### Błędy generowania rekomendacji
- Wyświetlenie przyjaznego komunikatu o błędzie
- Opcja ponowienia próby
- Obsługa konkretnych kodów błędów (401 - przekierowanie do logowania, 429 - informacja o limicie)

### Timeout podczas generowania
- Po 30 sekundach system przerywa oczekiwanie
- Wyświetlenie komunikatu o timeout
- Opcja ponowienia próby lub anulowania

### Błędy aktualizacji statusu
- Wyświetlenie przyjaznego komunikatu o błędzie
- Zachowanie stanu rekomendacji (możliwość ponownej próby)
- Obsługa konkretnych kodów błędów (401, 403, 404)

### Błędy pobierania historii
- Wyświetlenie przyjaznego komunikatu o błędzie
- Opcja ponowienia próby
- Domyślne wartości w przypadku braku danych

## 11. Kroki implementacji

1. Zdefiniowanie typów i interfejsów potrzebnych w widoku
   - Enums dla stanów widoku i akcji
   - Interfejsy dla stanu widoku i props komponentów

2. Implementacja custom hooków
   - useRecommendations - główny hook zarządzający stanem
   - useTimeout - hook do obsługi timeoutu podczas generowania

3. Tworzenie głównego komponentu RecommendationsPage
   - Integracja z custom hookiami
   - Podstawowa struktura widoku

4. Implementacja komponentów UI (w kolejności):
   - RecommendationButton - przycisk generowania rekomendacji
   - LoadingOverlay - nakładka podczas ładowania
   - RecommendationCard - karta rekomendacji
   - RecommendationActions - przyciski akcji
   - HistoryRecommendationCard - karta historii rekomendacji
   - RecommendationHistory - historia z paginacją

5. Integracja z API
   - Implementacja funkcji generateRecommendation
   - Implementacja funkcji updateRecommendationStatus
   - Implementacja funkcji fetchHistory

6. Obsługa błędów i przypadków brzegowych
   - Timeout podczas generowania
   - Obsługa różnych kodów odpowiedzi z API
   - Komunikaty o błędach

7. Testy i poprawki
   - Testy integracyjne z API
   - Testy funkcjonalne dla interakcji użytkownika
   - Poprawki UX i dostępności

8. Finalizacja i dokumentacja
   - Finalne poprawki stylistyczne
   - Dokumentacja komponentów i hooków
   - Instrukcje dla developerów 