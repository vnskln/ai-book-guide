# Plan implementacji widoku "Moje Książki - Przeczytane"

## 1. Przegląd
Widok "Moje Książki - Przeczytane" umożliwia użytkownikom zarządzanie listą przeczytanych książek. Pozwala na przeglądanie, dodawanie, ocenianie i usuwanie książek. Jest to jeden z trzech głównych widoków zarządzania książkami, obok list "Do przeczytania" i "Odrzucone". Widok prezentuje książki w porządku chronologicznym, z najnowszymi na górze.

## 2. Routing widoku
Widok będzie dostępny pod ścieżką: `/my-books/read`

## 3. Struktura komponentów
```
MyBooksLayout (layout współdzielony przez wszystkie widoki książek)
└── BooksTabs (zakładki do nawigacji między widokami książek)
└── ReadBooksView
    ├── ReadBooksHeader (nagłówek z tytułem i przyciskiem dodawania)
    ├── AddBookButton (przycisk otwierający modal dodawania książki)
    │   └── AddBookModal (modal zawierający formularz dodawania książki)
    │       └── AddBookForm (formularz dodawania nowej książki)
    ├── EmptyReadBooksList (widok w przypadku braku książek)
    └── ReadBooksList (lista książek)
        └── BookCard (karta pojedynczej książki)
            ├── BookInfo (informacje o książce)
            ├── BookRating (komponenty oceny książki)
            └── BookActions (przyciski akcji - edycja, usunięcie)
                └── DeleteBookDialog (dialog potwierdzający usunięcie)
```

## 4. Szczegóły komponentów

### MyBooksLayout
- Opis komponentu: Layout współdzielony przez wszystkie widoki zarządzania książkami, zapewniający spójny wygląd i nawigację.
- Główne elementy: Container z nagłówkiem sekcji i slotami dla komponentów zakładek i głównej zawartości.
- Obsługiwane interakcje: Brak bezpośrednich interakcji.
- Obsługiwana walidacja: Brak.
- Typy: Brak specyficznych typów.
- Propsy: `title: string` (tytuł sekcji), `children: ReactNode` (zawartość strony).

### BooksTabs
- Opis komponentu: Komponent z zakładkami umożliwiającymi nawigację między różnymi widokami książek.
- Główne elementy: Zestaw zakładek z użyciem komponentów Tabs z biblioteki shadcn/ui.
- Obsługiwane interakcje: Przełączanie między zakładkami.
- Obsługiwana walidacja: Brak.
- Typy: Brak specyficznych typów.
- Propsy: `activeTab: string` (aktywna zakładka).

### ReadBooksView
- Opis komponentu: Główny komponent widoku przeczytanych książek, zarządzający pobieraniem i wyświetlaniem danych.
- Główne elementy: Container zawierający ReadBooksHeader, EmptyReadBooksList lub ReadBooksList.
- Obsługiwane interakcje: Inicjowanie pobierania danych, obsługa stanów ładowania i błędów.
- Obsługiwana walidacja: Brak.
- Typy: `UserBookResponseDto`, `UserBookPaginatedResponseDto`, `ReadBooksViewModel`.
- Propsy: Brak.

### ReadBooksHeader
- Opis komponentu: Nagłówek widoku z tytułem i przyciskiem dodawania nowej książki.
- Główne elementy: Div z tytułem i AddBookButton.
- Obsługiwane interakcje: Brak bezpośrednich interakcji.
- Obsługiwana walidacja: Brak.
- Typy: Brak specyficznych typów.
- Propsy: `onAddBook: () => void` (callback do otwierania modalu dodawania).

### AddBookButton
- Opis komponentu: Przycisk otwierający modal dodawania nowej książki.
- Główne elementy: Button z ikoną dodawania.
- Obsługiwane interakcje: Kliknięcie otwierające modal.
- Obsługiwana walidacja: Brak.
- Typy: Brak specyficznych typów.
- Propsy: `onClick: () => void` (callback do otwierania modalu).

### AddBookModal
- Opis komponentu: Modal zawierający formularz dodawania nowej książki.
- Główne elementy: Dialog z komponentem AddBookForm.
- Obsługiwane interakcje: Otwieranie i zamykanie modalu.
- Obsługiwana walidacja: Brak.
- Typy: Brak specyficznych typów.
- Propsy: `isOpen: boolean`, `onClose: () => void`, `onSuccess: () => void`.

### AddBookForm
- Opis komponentu: Formularz do wprowadzania danych nowej książki i jej oceny.
- Główne elementy: Form z polami na tytuł, autora, język i ocenę książki.
- Obsługiwane interakcje: Wprowadzanie danych, wysyłanie formularza.
- Obsługiwana walidacja: 
  - Tytuł: wymagany, max 255 znaków
  - Autor: wymagany, max 255 znaków
  - Język: wymagany, max 50 znaków
  - Ocena: wymagana dla przeczytanej książki
- Typy: `CreateUserBookDto`, `AddBookFormValues`.
- Propsy: `onSubmit: (data: CreateUserBookDto) => Promise<void>`, `onSuccess: () => void`, `onCancel: () => void`.

### EmptyReadBooksList
- Opis komponentu: Informacja wyświetlana gdy użytkownik nie ma żadnych przeczytanych książek.
- Główne elementy: Card z informacją i przyciskiem dodawania pierwszej książki.
- Obsługiwane interakcje: Kliknięcie w przycisk dodawania.
- Obsługiwana walidacja: Brak.
- Typy: Brak specyficznych typów.
- Propsy: `onAddBook: () => void` (callback do otwierania modalu dodawania).

### ReadBooksList
- Opis komponentu: Lista przeczytanych książek użytkownika.
- Główne elementy: Container z listą komponentów BookCard.
- Obsługiwane interakcje: Brak bezpośrednich interakcji.
- Obsługiwana walidacja: Brak.
- Typy: `UserBookResponseDto[]`.
- Propsy: `books: UserBookResponseDto[]`, `onBookDeleted: () => void`, `onRatingChanged: (id: string, rating: boolean) => Promise<void>`.

### BookCard
- Opis komponentu: Karta przedstawiająca pojedynczą książkę z jej szczegółami i akcjami.
- Główne elementy: Card zawierający BookInfo, BookRating i BookActions.
- Obsługiwane interakcje: Brak bezpośrednich interakcji.
- Obsługiwana walidacja: Brak.
- Typy: `UserBookResponseDto`, `BookCardProps`.
- Propsy: `book: UserBookResponseDto`, `onDelete: () => void`, `onRatingChange: (rating: boolean) => Promise<void>`.

### BookInfo
- Opis komponentu: Wyświetla podstawowe informacje o książce.
- Główne elementy: Div zawierający tytuł, autora, język i datę dodania.
- Obsługiwane interakcje: Brak.
- Obsługiwana walidacja: Brak.
- Typy: `BookInfoProps`.
- Propsy: `title: string`, `authors: AuthorDto[]`, `language: string`, `createdAt: string`.

### BookRating
- Opis komponentu: Komponenty do wyświetlania i zmiany oceny książki.
- Główne elementy: Przyciski z ikonami kciuka w górę i w dół.
- Obsługiwane interakcje: Kliknięcie zmieniające ocenę.
- Obsługiwana walidacja: Brak.
- Typy: `BookRatingProps`.
- Propsy: `rating: boolean | null`, `onChange: (rating: boolean) => Promise<void>`.

### BookActions
- Opis komponentu: Przyciski akcji dla książki (usunięcie).
- Główne elementy: Button z ikoną usuwania.
- Obsługiwane interakcje: Kliknięcie otwierające dialog potwierdzenia usunięcia.
- Obsługiwana walidacja: Brak.
- Typy: Brak specyficznych typów.
- Propsy: `onDeleteClick: () => void`.

### DeleteBookDialog
- Opis komponentu: Dialog potwierdzający chęć usunięcia książki.
- Główne elementy: Dialog z komunikatem i przyciskami potwierdzenia/anulowania.
- Obsługiwane interakcje: Potwierdzenie lub anulowanie usunięcia.
- Obsługiwana walidacja: Brak.
- Typy: `DeleteBookDialogProps`.
- Propsy: `isOpen: boolean`, `onClose: () => void`, `onConfirm: () => Promise<void>`, `bookTitle: string`.

## 5. Typy

### ViewModel
```typescript
// Model widoku dla listy przeczytanych książek
interface ReadBooksViewModel {
  books: UserBookResponseDto[];
  isLoading: boolean;
  error: Error | null;
  pagination: PaginationInfo;
}

// Model formularza dodawania książki
interface AddBookFormValues {
  title: string;
  authors: { name: string }[];
  language: string;
  rating: boolean | null;
}

// Props dla karty książki
interface BookCardProps {
  book: UserBookResponseDto;
  onDelete: () => void;
  onRatingChange: (rating: boolean) => Promise<void>;
}

// Props dla informacji o książce
interface BookInfoProps {
  title: string;
  authors: AuthorDto[];
  language: string;
  createdAt: string;
}

// Props dla komponentu oceny
interface BookRatingProps {
  rating: boolean | null;
  onChange: (rating: boolean) => Promise<void>;
}

// Props dla dialogu usuwania
interface DeleteBookDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  bookTitle: string;
}
```

## 6. Zarządzanie stanem

### Główny stan widoku
Widok będzie wykorzystywał customowy hook `useReadBooks`, który zarządza:
- pobieraniem listy przeczytanych książek
- paginacją
- obsługą błędów i stanów ładowania
- dodawaniem nowych książek
- usuwaniem książek
- aktualizacją ocen

```typescript
const useReadBooks = () => {
  const [books, setBooks] = useState<UserBookResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 20,
    total_pages: 0
  });

  const fetchBooks = async (page: number = 1, limit: number = 20) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/user-books?status=read&page=${page}&limit=${limit}`);
      if (!response.ok) throw new Error('Błąd pobierania książek');
      const data: UserBookPaginatedResponseDto = await response.json();
      setBooks(data.data);
      setPagination(data.pagination);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Nieznany błąd'));
    } finally {
      setIsLoading(false);
    }
  };

  const addBook = async (bookData: CreateUserBookDto) => {
    try {
      const response = await fetch('/api/user-books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Błąd dodawania książki');
      }
      
      // Odśwież listę książek po dodaniu
      await fetchBooks(pagination.page, pagination.limit);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Nieznany błąd'));
      return false;
    }
  };

  const deleteBook = async (id: string) => {
    try {
      const response = await fetch(`/api/user-books?id=${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Błąd usuwania książki');
      }
      
      // Odśwież listę książek po usunięciu
      await fetchBooks(pagination.page, pagination.limit);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Nieznany błąd'));
      return false;
    }
  };

  const updateRating = async (id: string, rating: boolean) => {
    try {
      const response = await fetch(`/api/user-books?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'read',
          rating 
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Błąd aktualizacji oceny');
      }
      
      // Aktualizuj lokalnie zamiast ponownego pobierania całej listy
      setBooks(books.map(book => 
        book.id === id ? { ...book, rating } : book
      ));
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Nieznany błąd'));
      return false;
    }
  };

  // Inicjalne pobranie danych
  useEffect(() => {
    fetchBooks();
  }, []);

  return {
    books,
    isLoading,
    error,
    pagination,
    fetchBooks,
    addBook,
    deleteBook,
    updateRating
  };
};
```

### Stan modalu dodawania książki
Modal będzie wykorzystywał prostszy hook `useAddBookModal` do zarządzania swoim stanem:

```typescript
const useAddBookModal = (onAddBook: (data: CreateUserBookDto) => Promise<boolean>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  const handleSubmit = async (data: AddBookFormValues) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const bookData: CreateUserBookDto = {
        book: {
          title: data.title,
          language: data.language,
          authors: data.authors
        },
        status: UserBookStatus.READ,
        rating: data.rating
      };
      
      const success = await onAddBook(bookData);
      if (success) {
        closeModal();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nieznany błąd');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isOpen,
    isSubmitting,
    error,
    openModal,
    closeModal,
    handleSubmit
  };
};
```

### Stan dialogu usuwania książki
Dialog potwierdzenia usunięcia książki będzie wykorzystywał hook `useDeleteBookDialog`:

```typescript
const useDeleteBookDialog = (onDeleteBook: (id: string) => Promise<boolean>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<UserBookResponseDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openDialog = (book: UserBookResponseDto) => {
    setBookToDelete(book);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setError(null);
    // Opóźnione czyszczenie bookToDelete, żeby uniknąć migotania UI
    setTimeout(() => setBookToDelete(null), 200);
  };

  const confirmDelete = async () => {
    if (!bookToDelete) return;
    
    setIsDeleting(true);
    setError(null);
    
    try {
      const success = await onDeleteBook(bookToDelete.id);
      if (success) {
        closeDialog();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nieznany błąd');
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isOpen,
    bookToDelete,
    isDeleting,
    error,
    openDialog,
    closeDialog,
    confirmDelete
  };
};
```

## 7. Integracja API

### Pobieranie listy przeczytanych książek
```typescript
// Endpoint: GET /api/user-books
// Parametry: status=read, page=1, limit=20
// Odpowiedź: UserBookPaginatedResponseDto

const fetchReadBooks = async (page: number = 1, limit: number = 20): Promise<UserBookPaginatedResponseDto> => {
  const response = await fetch(`/api/user-books?status=read&page=${page}&limit=${limit}`);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Błąd pobierania książek');
  }
  
  return await response.json();
};
```

### Dodawanie nowej książki
```typescript
// Endpoint: POST /api/user-books
// Body: CreateUserBookDto
// Odpowiedź: UserBookResponseDto

const addBook = async (bookData: CreateUserBookDto): Promise<UserBookResponseDto> => {
  const response = await fetch('/api/user-books', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookData)
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Błąd dodawania książki');
  }
  
  return await response.json();
};
```

### Aktualizacja oceny książki
```typescript
// Endpoint: PUT /api/user-books?id={id}
// Body: { status: "read", rating: boolean }
// Odpowiedź: UserBookResponseDto

const updateBookRating = async (id: string, rating: boolean): Promise<UserBookResponseDto> => {
  const response = await fetch(`/api/user-books?id=${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'read',
      rating
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Błąd aktualizacji oceny');
  }
  
  return await response.json();
};
```

### Usuwanie książki
```typescript
// Endpoint: DELETE /api/user-books?id={id}
// Odpowiedź: Status 204 (No Content)

const deleteBook = async (id: string): Promise<void> => {
  const response = await fetch(`/api/user-books?id=${id}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Błąd usuwania książki');
  }
};
```

## 8. Interakcje użytkownika

### Dodawanie nowej książki
1. Użytkownik klika przycisk "Dodaj książkę"
2. Otwiera się modal z formularzem
3. Użytkownik wypełnia formularz (tytuł, autor, język, ocena)
4. Formularz waliduje dane w czasie rzeczywistym
5. Użytkownik zatwierdza formularz
6. System wysyła żądanie do API
7. Po sukcesie modal się zamyka, a lista książek odświeża się
8. W przypadku błędu, wyświetla się komunikat w modalu

### Zmiana oceny książki
1. Użytkownik klika przycisk kciuka w górę lub w dół przy książce
2. System wysyła żądanie aktualizacji do API
3. Interfejs natychmiast aktualizuje wygląd oceny (optymistyczny UI)
4. W przypadku błędu, ocena wraca do poprzedniego stanu i wyświetla się komunikat

### Usuwanie książki
1. Użytkownik klika przycisk usuwania przy książce
2. Otwiera się dialog potwierdzenia
3. Użytkownik potwierdza lub anuluje operację
4. W przypadku potwierdzenia, system wysyła żądanie do API
5. Po sukcesie dialog się zamyka, a książka znika z listy
6. W przypadku błędu, wyświetla się komunikat w dialogu

## 9. Warunki i walidacja

### Formularz dodawania książki
- Tytuł: 
  - Wymagany
  - Maksymalnie 255 znaków
- Autor: 
  - Wymagany co najmniej jeden autor
  - Imię i nazwisko autora maksymalnie 255 znaków
- Język: 
  - Wymagany
  - Minimum 2 znaki, maksymalnie 50 znaków
- Ocena: 
  - Wymagana dla książek o statusie "read"
  - Wartość boolean (true/false)

### Aktualizacja oceny
- Ocena musi być wartością boolean (true/false)
- Status książki musi być "read"

## 10. Obsługa błędów

### Pobieranie danych
- W przypadku błędu podczas pobierania danych, wyświetl komunikat błędu na liście książek
- Dodaj przycisk "Spróbuj ponownie" do odświeżenia danych

### Dodawanie książki
- Walidacja formularza w czasie rzeczywistym
- Wyświetlanie błędów walidacji pod każdym polem
- W przypadku błędu API, wyświetlenie komunikatu w modalu
- Blokowanie przycisku zatwierdzenia podczas wysyłania żądania

### Aktualizacja oceny
- Optymistyczna aktualizacja UI
- W przypadku błędu, przywrócenie poprzedniej oceny
- Wyświetlenie toast z komunikatem błędu

### Usuwanie książki
- Blokowanie przycisku potwierdzenia podczas usuwania
- W przypadku błędu, wyświetlenie komunikatu w dialogu
- Możliwość zamknięcia dialogu nawet w przypadku błędu

## 11. Kroki implementacji

1. Utwórz strukturę katalogów dla komponentów widoku
   ```
   /src/components/my-books/
   /src/components/my-books/layout/
   /src/components/my-books/read/
   /src/pages/my-books/
   ```

2. Zaimplementuj współdzielone komponenty layoutu
   - MyBooksLayout
   - BooksTabs

3. Stwórz plik strony Astro w `/src/pages/my-books/read.astro`

4. Zaimplementuj główny komponent widoku ReadBooksView i jego hooki
   - useReadBooks
   - useAddBookModal
   - useDeleteBookDialog

5. Zaimplementuj komponenty pomocnicze
   - ReadBooksHeader
   - EmptyReadBooksList
   - ReadBooksList
   - BookCard
   - BookInfo
   - BookRating
   - BookActions

6. Zaimplementuj komponenty modalne i dialogi
   - AddBookModal
   - AddBookForm
   - DeleteBookDialog

7. Zaimplementuj typy i interfejsy ViewModeli

8. Dodaj obsługę błędów i stanów ładowania

9. Przeprowadź testy funkcjonalne
   - Dodawanie książki
   - Zmiana oceny
   - Usuwanie książki
   - Obsługa błędów API

10. Zoptymalizuj wydajność (memoizacja komponentów, optymalizacja rerenderów)

11. Przeprowadź testy dostępności

12. Wdróż widok na środowisko testowe 