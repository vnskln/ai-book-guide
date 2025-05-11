# Architektura UI dla AI Book Guide

## 1. Przegląd struktury UI

Architektura interfejsu użytkownika AI Book Guide będzie oparta na trzech głównych widokach dostępnych przez poziomą nawigację: Rekomendacje, Moje Książki i Profil. Aplikacja wykorzystuje podejście Single Page Application (SPA) zbudowane na Astro 5 z React 19 dla interaktywnych komponentów. Architektura UI została zaprojektowana zgodnie z wymaganiami produktu, z naciskiem na intuicyjną nawigację, dostępność WCAG 2.1 AA oraz responsywność (mobile-first).

Struktura UI składa się z:
- **System autentykacji**: Logowanie, rejestracja i onboarding dla nowych użytkowników
- **Nawigacja główna**: Poziome menu nawigacyjne dla trzech głównych widoków
- **Widoki funkcjonalne**: Rekomendacje, Moje Książki (z zakładkami), Profil
- **Komponenty współdzielone**: Karty książek, modale, formularze, przyciski akcji, powiadomienia
- **Stany aplikacji**: Obsługa stanów ładowania, pustych list, błędów

## 2. Lista widoków

### Auth - Logowanie
- **Ścieżka**: `/login`
- **Główny cel**: Umożliwienie użytkownikom zalogowania się do aplikacji
- **Kluczowe informacje**:
  - Formularz logowania (email, hasło)
  - Link do rejestracji
  - Informacje o błędach logowania
- **Kluczowe komponenty**:
  - Logo aplikacji
  - Formularz logowania z walidacją pól
  - Przycisk logowania
  - Link do widoku rejestracji
- **UX, dostępność i bezpieczeństwo**:
  - Walidacja formularza przed wysłaniem
  - Przyjazne komunikaty błędów
  - Bezpieczne przechowywanie tokenów JWT
  - Dostępność klawiaturowa i dla czytników ekranu

### Auth - Rejestracja
- **Ścieżka**: `/register`
- **Główny cel**: Umożliwienie nowym użytkownikom utworzenia konta
- **Kluczowe informacje**:
  - Formularz rejestracji (email, hasło, potwierdzenie hasła)
  - Link do logowania
  - Informacje o wymaganiach dla hasła
- **Kluczowe komponenty**:
  - Logo aplikacji
  - Formularz rejestracji z walidacją pól
  - Przycisk rejestracji
  - Link do widoku logowania
- **UX, dostępność i bezpieczeństwo**:
  - Walidacja siły hasła
  - Weryfikacja unikalności adresu email
  - Dostępność klawiaturowa i dla czytników ekranu

### Onboarding
- **Ścieżka**: `/onboarding`
- **Główny cel**: Zebranie preferencji czytelniczych od nowego użytkownika
- **Kluczowe informacje**:
  - Formularz preferencji czytelniczych (max 1000 znaków)
  - Wybór preferowanego języka rekomendacji
  - Instrukcje i przykłady
- **Kluczowe komponenty**:
  - Tekstowe pole wprowadzania preferencji z licznikiem znaków i podpowiedziami
  - Rozwijana lista 20 predefiniowanych języków
  - Przycisk zatwierdzenia
- **UX, dostępność i bezpieczeństwo**:
  - Walidacja długości tekstu (max 1000 znaków)
  - Podpowiedzi dotyczące zawartości preferencji
  - Progres uzupełnienia (pole wymagane)
  - Dostępność klawiaturowa dla rozwijanej listy

### Rekomendacje
- **Ścieżka**: `/` (strona główna) lub `/recommendations`
- **Główny cel**: Generowanie i wyświetlanie rekomendacji książek
- **Kluczowe informacje**:
  - Przycisk generowania rekomendacji
  - Aktualna rekomendacja (jeśli istnieje)
  - Historia rekomendacji
- **Kluczowe komponenty**:
  - Przycisk "Zasugeruj mi kolejną książkę"
  - Karta rekomendacji z szczegółami książki (tytuł, autor, język)
  - Zarys fabuły (do 1000 znaków)
  - Uzasadnienie rekomendacji
  - Przyciski akceptacji/odrzucenia
  - Chronologiczna lista historii rekomendacji
  - Stan ładowania (overlay z komunikatem i spinner)
- **UX, dostępność i bezpieczeństwo**:
  - Blokada interfejsu podczas generowania z informacją o postępie
  - Limit czasu (timeout 30 sekund) z opcją ponowienia
  - Przyjazny komunikat dla pustej historii rekomendacji
  - Dostępność akcji dla nawigacji klawiaturowej

### Moje Książki - Przeczytane
- **Ścieżka**: `/my-books/read`
- **Główny cel**: Zarządzanie listą przeczytanych książek
- **Kluczowe informacje**:
  - Lista przeczytanych książek
  - Oceny książek (kciuk w górę/dół)
  - Data dodania książki
- **Kluczowe komponenty**:
  - Zakładki nawigacyjne (Przeczytane, Do przeczytania, Odrzucone)
  - Karty książek z tytułem, autorem, językiem, datą dodania i oceną
  - Przycisk usuwania książki
  - Przycisk dodawania nowej książki
  - Komunikat dla pustej listy
- **UX, dostępność i bezpieczeństwo**:
  - Chronologiczne sortowanie książek (najnowsze na górze)
  - Potwierdzenie usunięcia książki
  - Dostępność akcji dla nawigacji klawiaturowej

### Moje Książki - Do przeczytania
- **Ścieżka**: `/my-books/to-read`
- **Główny cel**: Zarządzanie listą książek do przeczytania
- **Kluczowe informacje**:
  - Lista książek do przeczytania
  - Data dodania książki
  - Źródło dodania (rekomendacja lub manualne)
- **Kluczowe komponenty**:
  - Zakładki nawigacyjne
  - Karty książek z tytułem, autorem, językiem i datą dodania
  - Przyciski akcji: oznacz jako przeczytaną, odrzuć, usuń
  - Przycisk dodawania nowej książki
  - Komunikat dla pustej listy
- **UX, dostępność i bezpieczeństwo**:
  - Modal oceny przy oznaczaniu książki jako przeczytanej
  - Potwierdzenie usunięcia książki
  - Dostępność akcji dla nawigacji klawiaturowej

### Moje Książki - Odrzucone
- **Ścieżka**: `/my-books/rejected`
- **Główny cel**: Zarządzanie listą odrzuconych książek
- **Kluczowe informacje**:
  - Lista odrzuconych książek
  - Data dodania książki
  - Źródło dodania (rekomendacja lub manualne)
- **Kluczowe komponenty**:
  - Zakładki nawigacyjne
  - Karty książek z tytułem, autorem, językiem i datą dodania
  - Przyciski akcji: przenieś do "Do przeczytania", usuń
  - Komunikat dla pustej listy
- **UX, dostępność i bezpieczeństwo**:
  - Potwierdzenie usunięcia książki
  - Dostępność akcji dla nawigacji klawiaturowej

### Profil
- **Ścieżka**: `/profile`
- **Główny cel**: Edycja preferencji czytelniczych i ustawień użytkownika
- **Kluczowe informacje**:
  - Aktualne preferencje czytelnicze
  - Preferowany język rekomendacji
  - Opcja wylogowania
- **Kluczowe komponenty**:
  - Formularz edycji preferencji czytelniczych (max 1000 znaków)
  - Rozwijana lista języków
  - Przycisk zapisywania zmian
  - Przycisk wylogowania
- **UX, dostępność i bezpieczeństwo**:
  - Walidacja długości tekstu (max 1000 znaków)
  - Podpowiedzi dotyczące zawartości preferencji
  - Potwierdzenie zapisania zmian
  - Dostępność klawiaturowa dla rozwijanej listy

## 3. Mapa podróży użytkownika

### Ścieżka Nowego Użytkownika
1. **Rejestracja**
   - Użytkownik wchodzi na stronę `/register`
   - Wypełnia formularz rejestracji (email, hasło, potwierdzenie hasła)
   - Wysyła formularz
   - Przy powodzeniu jest przekierowany do onboardingu

2. **Onboarding**
   - Użytkownik wpisuje swoje preferencje czytelnicze
   - Wybiera preferowany język rekomendacji z rozwijanej listy
   - Zatwierdza wybór
   - Jest przekierowany do głównego widoku (Rekomendacje)

3. **Pierwsza Rekomendacja**
   - Użytkownik klika przycisk "Zasugeruj mi kolejną książkę"
   - Interfejs blokuje się (overlay z komunikatem i spinner)
   - Po wygenerowaniu rekomendacji, użytkownik widzi ją wraz z przyciskami akceptacji/odrzucenia
   - Użytkownik może zaakceptować lub odrzucić rekomendację

### Ścieżka Zarządzania Książkami
1. **Dodawanie Przeczytanej Książki**
   - Użytkownik przechodzi do zakładki "Przeczytane"
   - Klika przycisk dodawania nowej książki
   - Wypełnia formularz (tytuł, autor, język)
   - Wybiera ocenę (kciuk w górę/dół)
   - Zatwierdza dodanie książki

2. **Przenoszenie Książki z "Do przeczytania" do "Przeczytane"**
   - Użytkownik przechodzi do zakładki "Do przeczytania"
   - Na karcie książki klika przycisk "Oznacz jako przeczytaną"
   - Pojawia się modal oceny
   - Użytkownik wybiera ocenę (kciuk w górę/dół)
   - Zatwierdza akcję
   - Książka zostaje przeniesiona do zakładki "Przeczytane"

3. **Odrzucanie Rekomendacji**
   - Użytkownik otrzymuje rekomendację i klika przycisk odrzucenia
   - Książka trafia na listę "Odrzucone"
   - Użytkownik może później przenieść ją z powrotem do "Do przeczytania" lub usunąć

### Ścieżka Aktualizacji Preferencji
1. **Edycja Preferencji**
   - Użytkownik przechodzi do widoku "Profil"
   - Edytuje swoje preferencje czytelnicze
   - Zmienia preferowany język (opcjonalnie)
   - Zapisuje zmiany
   - Kolejne rekomendacje uwzględniają nowe preferencje

## 4. Układ i struktura nawigacji

### Struktura Nawigacji
- **Nawigacja główna** (poziome menu): Dostępna na wszystkich głównych widokach
  - Rekomendacje (domyślnie aktywne)
  - Moje Książki
  - Profil

- **Nawigacja sekcji Moje Książki** (zakładki): Dostępna w widoku "Moje Książki"
  - Przeczytane
  - Do przeczytania
  - Odrzucone

- **Nawigacja autoryzacji**: Widoki logowania/rejestracji przed autoryzacją
  - Przełącznik między logowaniem a rejestracją

### Elementy Nawigacyjne
1. **Górne menu**
   - Poziome menu z ikonami i etykietami
   - Wskaźnik aktywnego widoku
   - Responsywne - zmniejsza się do ikon na mniejszych ekranach

2. **Zakładki w Moje Książki**
   - Poziome zakładki z etykietami
   - Wskaźnik aktywnej zakładki
   - Licznik książek w każdej zakładce (opcjonalnie)

3. **Przyciski akcji**
   - Duży, widoczny przycisk "Zasugeruj mi kolejną książkę" w widoku Rekomendacje
   - Przycisk dodawania nowej książki w widoku Moje Książki
   - Kontekstowe przyciski akcji na kartach książek

4. **Linki nawigacyjne**
   - Linki między widokami logowania i rejestracji
   - Przyciski powrotu w modalach

## 5. Kluczowe komponenty

### Komponenty UI
1. **AppLayout**
   - Komponent układu głównego z nagłówkiem, nawigacją i obszarem treści
   - Odpowiedzialny za responsywny układ i nawigację
   - Zawiera obsługę stanu autentykacji

2. **AuthLayout**
   - Komponent układu dla widoków logowania i rejestracji
   - Centruje formularze i wyświetla logo aplikacji

3. **NavBar**
   - Poziome menu nawigacyjne
   - Wskazuje aktywny widok
   - Responsywne - ikony na mniejszych ekranach

4. **TabsNavigation**
   - Komponenty zakładek dla widoku "Moje Książki"
   - Obsługuje przełączanie między listami książek

### Komponenty Funkcjonalne
1. **BookCard**
   - Wyświetla informacje o książce (tytuł, autor, język, data)
   - Zawiera kontekstowe przyciski akcji zależne od typu listy
   - Warianty dla różnych stanów (przeczytana, do przeczytania, odrzucona)

2. **RecommendationCard**
   - Rozszerzony wariant BookCard dla rekomendacji
   - Zawiera dodatkowo zarys fabuły i uzasadnienie
   - Przyciski akcji: akceptuj/odrzuć (dla nowych) lub status (dla historycznych)

3. **BookForm**
   - Formularz dodawania/edycji książki
   - Pola: tytuł, autor, język
   - Opcjonalnie: ocena (dla przeczytanych)

4. **PreferencesForm**
   - Formularz edycji preferencji czytelniczych
   - Pole tekstowe z licznikiem znaków (max 1000)
   - Rozwijana lista języków

### Komponenty Modalowe
1. **AddBookModal**
   - Modal zawierający BookForm
   - Używany do dodawania nowych książek

2. **RatingModal**
   - Modal do oceny książki (kciuk w górę/dół)
   - Wyświetlany przy przenoszeniu książki do "Przeczytane"

3. **ConfirmationModal**
   - Modal potwierdzający akcje takie jak usuwanie książki
   - Może być dostosowany do różnych kontekstów

### Komponenty Stanu
1. **EmptyState**
   - Komponent wyświetlany dla pustych list
   - Przyjazne komunikaty i wskazówki dla użytkownika
   - Warianty dla różnych typów list

2. **LoadingOverlay**
   - Nakładka z animacją ładowania
   - Blokuje interfejs podczas długotrwałych operacji
   - Zawiera komunikat o postępie i opcję anulowania (dla timeoutów)

3. **ErrorMessage**
   - Komponent wyświetlający błędy
   - Warianty: inline (dla formularzy) i toast (dla komunikatów)
   - Przyjazne komunikaty błędów z opcjonalnymi wskazówkami 