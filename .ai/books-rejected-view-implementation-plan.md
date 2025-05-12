# Plan implementacji widoku "Moje Książki - Odrzucone"

## 1. Przegląd
Widok "Moje Książki - Odrzucone" pozwala użytkownikom na zarządzanie listą odrzuconych książek. Użytkownicy mogą przeglądać listę, usuwać książki oraz przenosić je z powrotem na listę "Do przeczytania". Widok ten jest częścią większej sekcji "Moje Książki", która zawiera również zakładki "Do przeczytania" i "Przeczytane". Widok "Moje Książki - Odrzucone" powinien być w języku angielskim i korzystać z komponentów wykorzystanych w widokach "Przeczytane" i "Do przeczytania". 

## 2. Routing widoku
Widok będzie dostępny pod ścieżką `/my-books/rejected`, zgodnie z istniejącym schematem routingu dla innych zakładek w sekcji "Moje Książki".

## 3. Struktura komponentów
```
RejectedBooksView
├── BooksTabs (istniejący komponent)
├── RejectedBooksHeader
├── RejectedBooksList
│   ├── RejectedBookCard (dla każdej książki)
│   │   └── BookActionsMenu
│   │       └── MoveToReadDialog
│   │       └── DeleteBookDialog (zaadaptowany z istniejącego)
│   └── EmptyRejectedBooksList (gdy brak książek)
└── PaginationControls (opcjonalnie, jeśli potrzebne)
```

## 4. Szczegóły komponentów

### RejectedBooksView
- Opis komponentu: Główny komponent widoku, odpowiedzialny za zarządzanie stanem i renderowanie pozostałych komponentów
- Główne elementy: Container, BooksTabs, RejectedBooksHeader, RejectedBooksList, LoadingState, ErrorBoundary
- Obsługiwane interakcje: Inicjalizacja pobierania danych, obsługa błędów, zarządzanie stanem ładowania
- Obsługiwana walidacja: Sprawdzanie poprawności danych z API
- Typy: UserBookPaginatedResponseDto, PaginationInfo
- Propsy: Brak (komponent najwyższego poziomu)

### RejectedBooksHeader
- Opis komponentu: Nagłówek widoku z tytułem sekcji
- Główne elementy: Header, Heading
- Obsługiwane interakcje: Brak
- Obsługiwana walidacja: Brak
- Typy: Brak
- Propsy: Brak

### RejectedBooksList
- Opis komponentu: Lista odrzuconych książek z opcją paginacji
- Główne elementy: Grid/List container, RejectedBookCard dla każdej książki, EmptyRejectedBooksList gdy brak książek
- Obsługiwane interakcje: Renderowanie listy książek, obsługa pustej listy
- Obsługiwana walidacja: Brak
- Typy: UserBookResponseDto[]
- Propsy: 
  - books: UserBookResponseDto[]
  - onMoveToRead: (id: string) => Promise<boolean>
  - onDelete: (id: string) => Promise<boolean>
  - isLoading: boolean

### RejectedBookCard
- Opis komponentu: Karta pojedynczej odrzuconej książki z informacjami i akcjami
- Główne elementy: Card, CardHeader, CardContent, CardFooter, Button
- Obsługiwane interakcje: Przycisk usunięcia, przycisk przeniesienia do "Do przeczytania"
- Obsługiwana walidacja: Brak
- Typy: UserBookResponseDto
- Propsy:
  - book: UserBookResponseDto
  - onMoveToRead: () => Promise<boolean>
  - onDelete: () => Promise<boolean>

### MoveToReadDialog
- Opis komponentu: Dialog potwierdzający przeniesienie książki do listy "Do przeczytania"
- Główne elementy: AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, Button
- Obsługiwane interakcje: Potwierdzenie lub anulowanie akcji
- Obsługiwana walidacja: Brak
- Typy: Brak
- Propsy:
  - isOpen: boolean
  - bookTitle: string
  - onClose: () => void
  - onConfirm: () => Promise<boolean>

### DeleteBookDialog
- Opis komponentu: Dialog potwierdzający usunięcie książki (zaadaptowany z istniejącego komponentu)
- Główne elementy: AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, Button
- Obsługiwane interakcje: Potwierdzenie lub anulowanie usunięcia
- Obsługiwana walidacja: Brak
- Typy: Brak
- Propsy:
  - isOpen: boolean
  - bookTitle: string
  - onClose: () => void
  - onConfirm: () => Promise<boolean>

### EmptyRejectedBooksList
- Opis komponentu: Komunikat wyświetlany, gdy lista odrzuconych książek jest pusta
- Główne elementy: Container, Icon, Text
- Obsługiwane interakcje: Brak
- Obsługiwana walidacja: Brak
- Typy: Brak
- Propsy: Brak

## 5. Typy
Widok będzie korzystał z istniejących typów zdefiniowanych w `src/types.ts`:

```typescript
// Istniejące typy
import type { UserBookResponseDto, UserBookPaginatedResponseDto, PaginationInfo, UserBookStatus } from "@/types";

// Nowy typ dla hooka useRejectedBooks
interface UseRejectedBooksResult {
  books: UserBookResponseDto[];
  isLoading: boolean;
  error: Error | null;
  pagination: PaginationInfo;
  fetchBooks: (page?: number, limit?: number) => Promise<void>;
  deleteBook: (id: string) => Promise<boolean>;
  moveToRead: (id: string) => Promise<boolean>;
}
```

## 6. Zarządzanie stanem
Stan widoku będzie zarządzany przez dedykowany hook `useRejectedBooks`:

```typescript
function useRejectedBooks() {
  const [books, setBooks] = useState<UserBookResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 20,
    total_pages: 0,
  });

  // Funkcja pobierająca odrzucone książki
  const fetchBooks = async (page = 1, limit = 20) => {
    // Implementacja
  };

  // Funkcja usuwająca książkę
  const deleteBook = async (id: string) => {
    // Implementacja
  };

  // Funkcja przenosząca książkę do "Do przeczytania"
  const moveToRead = async (id: string) => {
    // Implementacja
  };

  // Efekt pobierający dane przy inicjalizacji
  useEffect(() => {
    fetchBooks();
  }, []);

  return {
    books,
    isLoading,
    error,
    pagination,
    fetchBooks,
    deleteBook,
    moveToRead,
  };
}
```

## 7. Integracja API
Widok będzie korzystał z następujących endpointów API:

1. **Pobieranie odrzuconych książek**:
   - Endpoint: `GET /api/user-books?status=rejected&page={page}&limit={limit}`
   - Parametry: 
     - `page`: numer strony (domyślnie 1)
     - `limit`: liczba elementów na stronę (domyślnie 20)
   - Odpowiedź: `UserBookPaginatedResponseDto`

2. **Usuwanie książki**:
   - Endpoint: `DELETE /api/user-books?id={id}`
   - Parametry:
     - `id`: identyfikator książki
   - Odpowiedź: 204 No Content (sukces)

3. **Przenoszenie książki do "Do przeczytania"**:
   - Endpoint: `PUT /api/user-books?id={id}`
   - Parametry:
     - `id`: identyfikator książki
   - Ciało żądania:
     ```json
     {
       "status": "to_read"
     }
     ```
   - Odpowiedź: `UserBookResponseDto`

## 8. Interakcje użytkownika
1. **Przeglądanie listy odrzuconych książek**:
   - Użytkownik wchodzi na stronę `/my-books/rejected`
   - System wyświetla listę odrzuconych książek lub komunikat o pustej liście
   - Jeśli książek jest więcej niż mieści się na jednej stronie, wyświetlane są kontrolki paginacji

2. **Usuwanie książki**:
   - Użytkownik klika przycisk "Usuń" przy wybranej książce
   - System wyświetla dialog potwierdzenia
   - Po potwierdzeniu, książka jest usuwana z listy
   - Lista jest odświeżana

3. **Przenoszenie książki do "Do przeczytania"**:
   - Użytkownik klika przycisk "Przenieś do Do przeczytania" przy wybranej książce
   - System wyświetla dialog potwierdzenia
   - Po potwierdzeniu, książka jest przenoszona do listy "Do przeczytania"
   - Książka znika z listy odrzuconych

## 9. Warunki i walidacja
1. **Warunki dla usuwania książki**:
   - Użytkownik musi być właścicielem książki (weryfikowane przez API)
   - Książka musi istnieć (weryfikowane przez API)

2. **Warunki dla przenoszenia książki**:
   - Użytkownik musi być właścicielem książki (weryfikowane przez API)
   - Książka musi istnieć (weryfikowane przez API)
   - Książka musi mieć status "rejected" (weryfikowane przez API)

## 10. Obsługa błędów
1. **Błędy pobierania danych**:
   - Wyświetlenie komunikatu o błędzie
   - Możliwość ponownego załadowania danych

2. **Błędy usuwania książki**:
   - Wyświetlenie komunikatu o błędzie w dialogu
   - Dialog pozostaje otwarty, umożliwiając ponowną próbę lub anulowanie

3. **Błędy przenoszenia książki**:
   - Wyświetlenie komunikatu o błędzie w dialogu
   - Dialog pozostaje otwarty, umożliwiając ponowną próbę lub anulowanie

4. **Brak połączenia z internetem**:
   - Wyświetlenie komunikatu o braku połączenia
   - Automatyczne ponowienie próby po przywróceniu połączenia

## 11. Kroki implementacji
1. Utworzenie struktury katalogów:
   ```
   src/components/my-books/rejected/
   ├── RejectedBooksView.tsx
   ├── RejectedBooksHeader.tsx
   ├── RejectedBooksList.tsx
   ├── RejectedBookCard.tsx
   ├── EmptyRejectedBooksList.tsx
   ├── MoveToReadDialog.tsx
   └── hooks/
       └── useRejectedBooks.ts
   ```

2. Implementacja hooka `useRejectedBooks.ts` do zarządzania stanem i komunikacji z API.

3. Implementacja komponentu `RejectedBooksView.tsx` jako głównego komponentu widoku.

4. Implementacja komponentu `RejectedBooksHeader.tsx` z tytułem sekcji.

5. Implementacja komponentu `EmptyRejectedBooksList.tsx` do wyświetlania komunikatu o pustej liście.

6. Implementacja komponentu `RejectedBookCard.tsx` do wyświetlania pojedynczej książki.

7. Adaptacja istniejącego komponentu `DeleteBookDialog.tsx` lub implementacja nowego.

8. Implementacja komponentu `MoveToReadDialog.tsx` do potwierdzania przeniesienia książki.

9. Implementacja komponentu `RejectedBooksList.tsx` do wyświetlania listy książek.

10. Utworzenie strony Astro `src/pages/my-books/rejected.astro` z komponentem `RejectedBooksView`.

11. Testowanie widoku pod kątem funkcjonalności i responsywności.

12. Weryfikacja dostępności (nawigacja klawiaturowa, etykiety dla czytników ekranowych).

13. Optymalizacja wydajności (memoizacja komponentów, lazy loading). 