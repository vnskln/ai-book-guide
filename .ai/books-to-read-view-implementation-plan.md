# Plan implementacji widoku "Moje Książki - Do przeczytania"

## 1. Przegląd
Widok "Moje Książki - Do przeczytania" umożliwia użytkownikom zarządzanie listą książek oznaczonych do przeczytania. Użytkownicy mogą przeglądać, oceniać, odrzucać lub usuwać książki z tej listy. Widok ten jest zgodny z historyjkami użytkownika US-009 i US-010 zdefiniowanymi w PRD.

## 2. Routing widoku
Widok będzie dostępny pod ścieżką `/my-books/to-read`

## 3. Struktura komponentów
```
ToReadBooksPage
├── BooksTabs                // Zakładki nawigacyjne dla różnych widoków książek
├── EmptyStateMessage        // Komunikat wyświetlany, gdy lista jest pusta
├── BookCardList             // Kontener do wyświetlania kart książek
│   └── BookCard             // Pojedyncza karta książki
│       └── BookActions      // Przyciski akcji dla książki
├── AddBookButton            // Przycisk dodawania nowej książki
├── RatingModal              // Modal oceny przy oznaczaniu książki jako przeczytanej
└── ConfirmationDialog       // Dialog potwierdzenia dla akcji usuwania/odrzucania
```

## 4. Szczegóły komponentów

### ToReadBooksPage
- Opis komponentu: Główny komponent strony zarządzający stanem, pobieraniem danych i wyświetlaniem książek do przeczytania.
- Główne elementy: Zakładki nawigacyjne, lista kart książek, przycisk dodawania, komunikat o pustej liście.
- Obsługiwane interakcje: Inicjalizacja pobierania danych, obsługa paginacji, obsługa zdarzeń filtrowania i sortowania.
- Obsługiwana walidacja: Sprawdzanie statusu odpowiedzi API.
- Typy: `UserBookPaginatedResponseDto`, `UserBookResponseDto`, `ToReadBooksViewModel`.
- Propsy: Brak (komponent główny).

### BooksTabs
- Opis komponentu: Zakładki nawigacyjne umożliwiające przełączanie między różnymi widokami książek (przeczytane, do przeczytania, odrzucone).
- Główne elementy: Komponenty `Tabs` i `TabsList` z biblioteki Shadcn/ui.
- Obsługiwane interakcje: Kliknięcie zakładki, nawigacja klawiaturowa.
- Obsługiwana walidacja: Brak.
- Typy: `TabItem[]` (własny typ).
- Propsy: `activeTab: string, onTabChange: (tab: string) => void`.

### EmptyStateMessage
- Opis komponentu: Komunikat wyświetlany, gdy lista książek do przeczytania jest pusta.
- Główne elementy: Komunikat tekstowy, ikona, przycisk dodawania książki.
- Obsługiwane interakcje: Kliknięcie przycisku dodawania książki.
- Obsługiwana walidacja: Brak.
- Typy: Brak specyficznych typów.
- Propsy: `onAddBook: () => void`.

### BookCardList
- Opis komponentu: Kontener wyświetlający karty książek w formie siatki lub listy.
- Główne elementy: Lista komponentów `BookCard`.
- Obsługiwane interakcje: Brak bezpośrednich (deleguje do komponentów dzieci).
- Obsługiwana walidacja: Brak.
- Typy: `UserBookResponseDto[]`.
- Propsy: `books: UserBookResponseDto[], onMarkAsRead: (bookId: string) => void, onReject: (bookId: string) => void, onDelete: (bookId: string) => void`.

### BookCard
- Opis komponentu: Wyświetla pojedynczą książkę jako kartę z informacjami i dostępnymi akcjami.
- Główne elementy: Tytuł, autor, język, data dodania, źródło dodania (rekomendacja/manualne), przyciski akcji.
- Obsługiwane interakcje: Przekazywanie zdarzeń dla akcji (przeczytane, odrzucone, usunięte).
- Obsługiwana walidacja: Brak.
- Typy: `UserBookResponseDto`.
- Propsy: `book: UserBookResponseDto, onMarkAsRead: () => void, onReject: () => void, onDelete: () => void`.

### BookActions
- Opis komponentu: Zestaw przycisków akcji dla książki (oznacz jako przeczytaną, odrzuć, usuń).
- Główne elementy: Przyciski z ikonami z biblioteki Shadcn/ui.
- Obsługiwane interakcje: Kliknięcie przycisku akcji, nawigacja klawiaturowa.
- Obsługiwana walidacja: Brak.
- Typy: Brak specyficznych typów.
- Propsy: `onMarkAsRead: () => void, onReject: () => void, onDelete: () => void`.

### AddBookButton
- Opis komponentu: Przycisk umożliwiający dodanie nowej książki do listy do przeczytania.
- Główne elementy: Przycisk z ikoną.
- Obsługiwane interakcje: Kliknięcie przycisku.
- Obsługiwana walidacja: Brak.
- Typy: Brak specyficznych typów.
- Propsy: `onClick: () => void`.

### RatingModal
- Opis komponentu: Modal umożliwiający ocenę książki podczas oznaczania jej jako przeczytanej.
- Główne elementy: Dialog, przyciski oceny (kciuk w górę/dół), przyciski potwierdzenia/anulowania.
- Obsługiwane interakcje: Wybór oceny, potwierdzenie, anulowanie.
- Obsługiwana walidacja: Sprawdzanie czy ocena została wybrana.
- Typy: `UserBookResponseDto`, `UpdateUserBookDto`.
- Propsy: `book: UserBookResponseDto, isOpen: boolean, onClose: () => void, onConfirm: (bookId: string, rating: boolean) => void`.

### ConfirmationDialog
- Opis komponentu: Dialog potwierdzenia dla akcji usuwania lub odrzucania książki.
- Główne elementy: Dialog, tekst potwierdzenia, przyciski potwierdzenia/anulowania.
- Obsługiwane interakcje: Potwierdzenie, anulowanie.
- Obsługiwana walidacja: Brak.
- Typy: Brak specyficznych typów.
- Propsy: `isOpen: boolean, onClose: () => void, onConfirm: () => void, title: string, message: string, confirmText?: string, cancelText?: string`.

## 5. Typy

### TabItem
```typescript
interface TabItem {
  id: string;
  label: string;
  path: string;
}
```

### ToReadBooksViewModel
```typescript
interface ToReadBooksViewModel {
  books: UserBookResponseDto[];
  isLoading: boolean;
  error: string | null;
  pagination: PaginationInfo;
  selectedBook: UserBookResponseDto | null;
  showRatingModal: boolean;
  showConfirmationDialog: boolean;
  confirmationAction: 'delete' | 'reject' | null;
}
```

### ToReadBooksResponse
Będzie wykorzystywać istniejące typy zdefiniowane w `types.ts`:
- `UserBookPaginatedResponseDto` - do odebrania danych z API
- `UserBookResponseDto` - do reprezentacji pojedynczej książki
- `UpdateUserBookDto` - do aktualizacji statusu książki

## 6. Zarządzanie stanem

### useToReadBooks (Custom Hook)
```typescript
const useToReadBooks = () => {
  const [viewModel, setViewModel] = useState<ToReadBooksViewModel>({
    books: [],
    isLoading: true,
    error: null,
    pagination: { total: 0, page: 1, limit: 20, total_pages: 0 },
    selectedBook: null,
    showRatingModal: false,
    showConfirmationDialog: false,
    confirmationAction: null
  });

  // Funkcje do pobierania książek
  const fetchBooks = async (page = 1, limit = 20) => {...};

  // Funkcje do obsługi akcji
  const handleMarkAsRead = (bookId: string) => {...};
  const handleReject = (bookId: string) => {...};
  const handleDelete = (bookId: string) => {...};
  
  // Funkcje modalne
  const openRatingModal = (book: UserBookResponseDto) => {...};
  const closeRatingModal = () => {...};
  const confirmRating = async (bookId: string, rating: boolean) => {...};

  // Funkcje dialogu potwierdzenia
  const openConfirmationDialog = (book: UserBookResponseDto, action: 'delete' | 'reject') => {...};
  const closeConfirmationDialog = () => {...};
  const confirmAction = async () => {...};

  // Efekt pobierający dane przy inicjalizacji
  useEffect(() => {
    fetchBooks();
  }, []);

  return {
    ...viewModel,
    fetchBooks,
    handleMarkAsRead,
    handleReject,
    handleDelete,
    openRatingModal,
    closeRatingModal,
    confirmRating,
    openConfirmationDialog,
    closeConfirmationDialog,
    confirmAction
  };
};
```

## 7. Integracja API

### Pobieranie książek do przeczytania
- **Endpoint**: `GET /api/user-books?status=to_read`
- **Query Parameters**:
  - `status: 'to_read'` (stały)
  - `page: number` (domyślnie 1)
  - `limit: number` (domyślnie 20)
- **Response Type**: `UserBookPaginatedResponseDto`
- **Implementacja**:
  ```typescript
  const fetchBooks = async (page = 1, limit = 20) => {
    setViewModel(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await fetch(`/api/user-books?status=to_read&page=${page}&limit=${limit}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data: UserBookPaginatedResponseDto = await response.json();
      setViewModel(prev => ({ 
        ...prev, 
        books: data.data, 
        pagination: data.pagination,
        isLoading: false 
      }));
    } catch (error) {
      setViewModel(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false 
      }));
    }
  };
  ```

### Aktualizacja statusu książki (przeczytana/odrzucona)
- **Endpoint**: `PUT /api/user-books?id={bookId}`
- **Request Body Type**: `UpdateUserBookDto`
- **Response Type**: `UserBookResponseDto`
- **Implementacja**:
  ```typescript
  const updateBookStatus = async (bookId: string, newStatus: UserBookStatus, rating?: boolean) => {
    const updateData: UpdateUserBookDto = {
      status: newStatus,
      ...(newStatus === UserBookStatus.READ ? { rating } : {})
    };
    try {
      const response = await fetch(`/api/user-books?id=${bookId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await fetchBooks(viewModel.pagination.page);
      return true;
    } catch (error) {
      setViewModel(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
      return false;
    }
  };
  ```

### Usuwanie książki
- **Endpoint**: `DELETE /api/user-books?id={bookId}`
- **Response**: Status 204 (No Content) w przypadku sukcesu
- **Implementacja**:
  ```typescript
  const deleteBook = async (bookId: string) => {
    try {
      const response = await fetch(`/api/user-books?id=${bookId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await fetchBooks(viewModel.pagination.page);
      return true;
    } catch (error) {
      setViewModel(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
      return false;
    }
  };
  ```

## 8. Interakcje użytkownika

### Oznaczanie książki jako przeczytanej
1. Użytkownik klika przycisk "Oznacz jako przeczytaną" na karcie książki
2. System wyświetla modal oceny (RatingModal)
3. Użytkownik wybiera ocenę (kciuk w górę/dół)
4. Użytkownik klika przycisk "Potwierdź"
5. System wysyła żądanie PUT do API z nowym statusem i oceną
6. System odświeża listę książek
7. System zamyka modal

### Odrzucanie książki
1. Użytkownik klika przycisk "Odrzuć" na karcie książki
2. System wyświetla dialog potwierdzenia
3. Użytkownik potwierdza akcję
4. System wysyła żądanie PUT do API z nowym statusem "rejected"
5. System odświeża listę książek
6. System zamyka dialog potwierdzenia

### Usuwanie książki
1. Użytkownik klika przycisk "Usuń" na karcie książki
2. System wyświetla dialog potwierdzenia
3. Użytkownik potwierdza akcję
4. System wysyła żądanie DELETE do API
5. System odświeża listę książek
6. System zamyka dialog potwierdzenia

### Nawigacja między widokami książek
1. Użytkownik klika na zakładkę (np. "Przeczytane" lub "Odrzucone")
2. System przekierowuje użytkownika do wybranej ścieżki

## 9. Warunki i walidacja

### RatingModal
- Wymagana ocena przed potwierdzeniem (kciuk w górę/dół)
- Przycisk potwierdzenia jest wyłączony, dopóki użytkownik nie wybierze oceny

### ConfirmationDialog
- Wyświetla odpowiedni komunikat w zależności od akcji (usuwanie/odrzucanie)
- Wymaga jawnego potwierdzenia przed wykonaniem operacji

### Aktualizacja statusu książki
- Przy zmianie statusu na "read" wymagana jest ocena (rating)
- Aktualizacja statusu na "rejected" wymaga potwierdzenia użytkownika

## 10. Obsługa błędów

### Pobieranie danych
- Wyświetlanie komunikatu o błędzie, gdy pobieranie danych nie powiedzie się
- Przycisk ponownego załadowania danych

### Aktualizacja statusu/usuwanie
- Wyświetlanie komunikatu o błędzie, gdy operacja się nie powiedzie
- Zachowanie stanu aplikacji i umożliwienie ponownej próby
- Obsługa błędów HTTP 400, 403, 404 z odpowiednimi komunikatami

### Przypadki brzegowe
- Obsługa pustej listy książek do przeczytania
- Obsługa utraconych połączeń sieciowych
- Obsługa nieoczekiwanych formatów danych z API

## 11. Kroki implementacji

1. Stworzenie struktury katalogów i plików
   ```
   src/
     pages/
       my-books/
         to-read.astro
     components/
       books/
         BooksTabs.tsx
         BookCardList.tsx
         BookCard.tsx
         BookActions.tsx
         EmptyStateMessage.tsx
         AddBookButton.tsx
       modals/
         RatingModal.tsx
         ConfirmationDialog.tsx
     hooks/
       useToReadBooks.ts
   ```

2. Implementacja hooka zarządzającego stanem (`useToReadBooks.ts`)
   - Implementacja pobierania danych
   - Implementacja funkcji do obsługi akcji
   - Implementacja obsługi modali i dialogów

3. Implementacja komponentów pomocniczych
   - BooksTabs.tsx
   - EmptyStateMessage.tsx
   - ConfirmationDialog.tsx
   - RatingModal.tsx

4. Implementacja komponentów związanych z książkami
   - BookActions.tsx
   - BookCard.tsx
   - BookCardList.tsx
   - AddBookButton.tsx

5. Połączenie wszystkiego w widoku Astro (`to-read.astro`)
   - Zdefiniowanie układu strony
   - Integracja z hookiem useToReadBooks
   - Implementacja kompletnego widoku

6. Testowanie funkcjonalności
   - Testowanie pobierania danych
   - Testowanie akcji oznaczania jako przeczytane
   - Testowanie akcji odrzucania
   - Testowanie akcji usuwania
   - Testowanie obsługi błędów i przypadków brzegowych

7. Dodanie paginacji i optymalizacji wydajności
   - Implementacja paginacji książek
   - Optymalizacja ponownego renderowania

8. Finalizacja stylizacji i dostępności
   - Dopracowanie stylizacji komponentów
   - Zapewnienie dostępności dla nawigacji klawiaturowej
   - Testowanie responsywności widoku 