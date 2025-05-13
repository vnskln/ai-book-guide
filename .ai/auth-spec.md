# Specyfikacja architektury modułu autentykacji dla AI Book Guide

## 1. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### 1.1. Nowe strony

#### 1.1.1. Strona logowania (`/login`)
- **Plik**: `src/pages/login.astro`
- **Opis**: Strona umożliwiająca zalogowanie się do aplikacji
- **Komponenty**:
  - `LoginForm.tsx` - komponent React zawierający formularz logowania
- **Przepływ**:
  - Użytkownik wprowadza adres email i hasło
  - Po poprawnym zalogowaniu użytkownik jest przekierowany do `/recommendations`
  - W przypadku błędu wyświetlany jest odpowiedni komunikat
  - Link do strony rejestracji i odzyskiwania hasła

#### 1.1.2. Strona rejestracji (`/register`)
- **Plik**: `src/pages/register.astro`
- **Opis**: Strona umożliwiająca rejestrację nowego użytkownika
- **Komponenty**:
  - `RegisterForm.tsx` - komponent React zawierający formularz rejestracji
- **Przepływ**:
  - Użytkownik wprowadza adres email, hasło i potwierdzenie hasła
  - Po poprawnej rejestracji użytkownik jest przekierowany do strony `/onboarding`
  - W przypadku błędu wyświetlany jest odpowiedni komunikat
  - Link do strony logowania

#### 1.1.3. Strona odzyskiwania hasła (`/reset-password`)
- **Plik**: `src/pages/reset-password.astro`
- **Opis**: Strona umożliwiająca zresetowanie hasła
- **Komponenty**:
  - `ResetPasswordForm.tsx` - komponent React zawierający formularz resetowania hasła
- **Przepływ**:
  - Użytkownik wprowadza adres email
  - Po poprawnym wysłaniu linku resetującego wyświetlana jest informacja o wysłaniu emaila
  - Link do strony logowania

#### 1.1.4. Strona ustawiania nowego hasła (`/new-password`)
- **Plik**: `src/pages/new-password.astro`
- **Opis**: Strona umożliwiająca ustawienie nowego hasła po kliknięciu w link z emaila
- **Komponenty**:
  - `NewPasswordForm.tsx` - komponent React zawierający formularz ustawiania nowego hasła
- **Przepływ**:
  - Użytkownik wprowadza nowe hasło i jego potwierdzenie
  - Po poprawnym ustawieniu nowego hasła użytkownik jest przekierowany do strony logowania
  - W przypadku błędu wyświetlany jest odpowiedni komunikat

### 1.2. Modyfikacje istniejących komponentów

#### 1.2.1. Layout główny (`src/layouts/Layout.astro`)
- **Modyfikacja**: Dodanie komponentu `Navbar` z przyciskiem logowania/wylogowania i menu użytkownika
- **Komponenty**:
  - `Navbar.tsx` - komponent React zawierający nawigację aplikacji
  - `UserMenu.tsx` - komponent React zawierający menu użytkownika (wyświetlane po zalogowaniu)
- **Przepływ**:
  - Jeśli użytkownik jest zalogowany, wyświetlane jest menu użytkownika z opcją wylogowania
  - Jeśli użytkownik nie jest zalogowany, wyświetlany jest przycisk logowania

#### 1.2.2. Middleware (`src/middleware/index.ts`)
- **Modyfikacja**: Rozszerzenie middleware o sprawdzanie sesji użytkownika i przekierowanie niezalogowanych użytkowników
- **Przepływ**:
  - Sprawdzenie sesji użytkownika
  - Jeśli użytkownik nie jest zalogowany, a próbuje dostać się do chronionej strony, przekierowanie do strony logowania
  - Dodanie informacji o zalogowanym użytkowniku do kontekstu Astro

#### 1.2.3. Strona onboardingu (`src/pages/onboarding.astro`)
- **Modyfikacja**: Dostosowanie do pracy z zalogowanym użytkownikiem
- **Przepływ**:
  - Sprawdzenie czy użytkownik jest zalogowany
  - Pobranie ID użytkownika z sesji zamiast używania DEFAULT_USER_ID
  - Umożliwienie użytkownikowi wprowadzenia preferencji czytelniczych i preferowanego języka

### 1.3. Nowe komponenty React

#### 1.3.1. Formularze autentykacji
- **LoginForm.tsx**: Formularz logowania
- **RegisterForm.tsx**: Formularz rejestracji
- **ResetPasswordForm.tsx**: Formularz resetowania hasła
- **NewPasswordForm.tsx**: Formularz ustawiania nowego hasła

#### 1.3.2. Komponenty nawigacyjne
- **Navbar.tsx**: Pasek nawigacyjny z przyciskami logowania/wylogowania
- **UserMenu.tsx**: Menu użytkownika z opcją wylogowania i przejścia do profilu

#### 1.3.3. Komponenty pomocnicze
- **AuthGuard.tsx**: Komponent HOC do ochrony stron wymagających logowania
- **AuthStatus.tsx**: Komponent wyświetlający status autentykacji (zalogowany/niezalogowany)

#### 1.3.4. Komponenty zarządzania książkami
- **BookList.tsx**: Komponent wyświetlający listę książek (przeczytane/do przeczytania/odrzucone)
- **BookForm.tsx**: Formularz dodawania/edycji książki
- **BookActions.tsx**: Przyciski akcji dla książek (ocena, przeniesienie między listami, usunięcie)

### 1.4. Walidacja i obsługa błędów

#### 1.4.1. Walidacja formularzy
- **Walidacja logowania**:
  - Email: wymagany, poprawny format
  - Hasło: wymagane
- **Walidacja rejestracji**:
  - Email: wymagany, poprawny format, unikalny
  - Hasło: wymagane, minimalna długość 8 znaków, zawiera cyfry i znaki specjalne
  - Potwierdzenie hasła: zgodne z hasłem
- **Walidacja resetowania hasła**:
  - Email: wymagany, poprawny format
- **Walidacja nowego hasła**:
  - Hasło: wymagane, minimalna długość 8 znaków, zawiera cyfry i znaki specjalne
  - Potwierdzenie hasła: zgodne z hasłem
- **Walidacja preferencji**:
  - Tekst preferencji: maksymalnie 1000 znaków
  - Język: wymagany

#### 1.4.2. Komunikaty błędów
- Niepoprawne dane logowania
- Adres email już istnieje
- Hasło nie spełnia wymagań bezpieczeństwa
- Hasła nie są zgodne
- Użytkownik nie istnieje
- Link resetujący hasło wygasł
- Ogólny błąd serwera

## 2. LOGIKA BACKENDOWA

### 2.1. Nowe endpointy API

#### 2.1.1. Endpoint rejestracji (`/api/auth/register`)
- **Plik**: `src/pages/api/auth/register.ts`
- **Metoda**: POST
- **Dane wejściowe**:
  - email: string
  - password: string
  - passwordConfirmation: string
- **Walidacja**:
  - Poprawność formatu email
  - Siła hasła
  - Zgodność hasła z potwierdzeniem
  - Unikalność adresu email
- **Odpowiedź**:
  - Sukces (201): Dane użytkownika bez hasła
  - Błąd (400): Szczegóły błędu walidacji
  - Błąd (409): Email już istnieje
  - Błąd (500): Błąd serwera

#### 2.1.2. Endpoint logowania (`/api/auth/login`)
- **Plik**: `src/pages/api/auth/login.ts`
- **Metoda**: POST
- **Dane wejściowe**:
  - email: string
  - password: string
- **Walidacja**:
  - Poprawność formatu email
  - Istnienie użytkownika
  - Poprawność hasła
- **Odpowiedź**:
  - Sukces (200): Dane sesji użytkownika
  - Błąd (400): Błędne dane logowania
  - Błąd (500): Błąd serwera

#### 2.1.3. Endpoint wylogowania (`/api/auth/logout`)
- **Plik**: `src/pages/api/auth/logout.ts`
- **Metoda**: POST
- **Odpowiedź**:
  - Sukces (200): Potwierdzenie wylogowania
  - Błąd (500): Błąd serwera

#### 2.1.4. Endpoint resetowania hasła (`/api/auth/reset-password`)
- **Plik**: `src/pages/api/auth/reset-password.ts`
- **Metoda**: POST
- **Dane wejściowe**:
  - email: string
- **Walidacja**:
  - Poprawność formatu email
  - Istnienie użytkownika
- **Odpowiedź**:
  - Sukces (200): Potwierdzenie wysłania emaila
  - Błąd (400): Błędny email
  - Błąd (500): Błąd serwera

#### 2.1.5. Endpoint ustawiania nowego hasła (`/api/auth/new-password`)
- **Plik**: `src/pages/api/auth/new-password.ts`
- **Metoda**: POST
- **Dane wejściowe**:
  - token: string
  - password: string
  - passwordConfirmation: string
- **Walidacja**:
  - Poprawność tokenu
  - Siła hasła
  - Zgodność hasła z potwierdzeniem
- **Odpowiedź**:
  - Sukces (200): Potwierdzenie zmiany hasła
  - Błąd (400): Błędny token lub dane
  - Błąd (500): Błąd serwera

#### 2.1.6. Endpoint sprawdzania sesji (`/api/auth/session`)
- **Plik**: `src/pages/api/auth/session.ts`
- **Metoda**: GET
- **Odpowiedź**:
  - Sukces (200): Dane sesji użytkownika
  - Błąd (401): Brak sesji
  - Błąd (500): Błąd serwera

### 2.2. Modyfikacje istniejących endpointów

#### 2.2.1. Endpoint preferencji (`/api/preferences`)
- **Modyfikacja**: Używanie ID użytkownika z sesji zamiast DEFAULT_USER_ID
- **Przepływ**:
  - Pobranie ID użytkownika z sesji
  - Używanie tego ID we wszystkich operacjach na bazie danych
- **Metody**:
  - GET: Pobranie preferencji użytkownika
  - POST/PUT: Aktualizacja preferencji użytkownika (tekst preferencji, preferowany język)

#### 2.2.2. Endpoint książek użytkownika (`/api/user-books`)
- **Modyfikacja**: Używanie ID użytkownika z sesji zamiast DEFAULT_USER_ID
- **Przepływ**:
  - Pobranie ID użytkownika z sesji
  - Używanie tego ID we wszystkich operacjach na bazie danych
- **Metody**:
  - GET: Pobranie książek użytkownika (przeczytane, do przeczytania, odrzucone)
  - POST: Dodanie nowej książki
  - PUT: Aktualizacja książki (ocena, przeniesienie między listami)
  - DELETE: Usunięcie książki

#### 2.2.3. Endpoint rekomendacji (`/api/recommendations`)
- **Modyfikacja**: Używanie ID użytkownika z sesji zamiast DEFAULT_USER_ID
- **Przepływ**:
  - Pobranie ID użytkownika z sesji
  - Pobranie preferencji użytkownika
  - Pobranie list książek użytkownika (przeczytane, odrzucone)
  - Generowanie rekomendacji na podstawie tych danych
- **Metody**:
  - GET: Generowanie nowej rekomendacji
  - POST: Akceptacja lub odrzucenie rekomendacji

### 2.3. Modele danych

#### 2.3.1. Rozszerzenie typów Supabase
- **Plik**: `src/db/database.types.ts`
- **Modyfikacja**: Dodanie typów dla tabeli `auth.users` Supabase
- **Tabele**:
  - `user_preferences`: Preferencje czytelnicze użytkownika
  - `user_books`: Książki użytkownika (przeczytane, do przeczytania, odrzucone)

#### 2.3.2. Nowe typy DTO
- **Plik**: `src/types.ts`
- **Nowe typy**:
  - `RegisterUserDto`: Dane rejestracji użytkownika
  - `LoginUserDto`: Dane logowania użytkownika
  - `ResetPasswordDto`: Dane resetowania hasła
  - `NewPasswordDto`: Dane ustawiania nowego hasła
  - `UserSessionDto`: Dane sesji użytkownika
  - `UserPreferencesDto`: Dane preferencji użytkownika
  - `BookDto`: Dane książki
  - `RecommendationDto`: Dane rekomendacji

### 2.4. Obsługa wyjątków i walidacja

#### 2.4.1. Schematy walidacji Zod
- **Plik**: `src/lib/schemas/auth.schemas.ts`
- **Schematy**:
  - `registerSchema`: Schemat walidacji danych rejestracji
  - `loginSchema`: Schemat walidacji danych logowania
  - `resetPasswordSchema`: Schemat walidacji danych resetowania hasła
  - `newPasswordSchema`: Schemat walidacji danych nowego hasła
  - `preferencesSchema`: Schemat walidacji danych preferencji
  - `bookSchema`: Schemat walidacji danych książki

#### 2.4.2. Klasy błędów
- **Plik**: `src/lib/errors/auth.errors.ts`
- **Klasy**:
  - `AuthenticationError`: Błąd autentykacji
  - `RegistrationError`: Błąd rejestracji
  - `PasswordResetError`: Błąd resetowania hasła
  - `ValidationError`: Błąd walidacji danych

## 3. SYSTEM AUTENTYKACJI

### 3.1. Integracja z Supabase Auth

#### 3.1.1. Klient Supabase Auth
- **Plik**: `src/db/supabase.client.ts`
- **Modyfikacja**: Dodanie metod pomocniczych do obsługi autentykacji
- **Metody**:
  - `signUp`: Rejestracja użytkownika
  - `signIn`: Logowanie użytkownika
  - `signOut`: Wylogowanie użytkownika
  - `resetPassword`: Resetowanie hasła
  - `updatePassword`: Aktualizacja hasła
  - `getSession`: Pobranie sesji użytkownika
  - `getUser`: Pobranie danych użytkownika

#### 3.1.2. Hook React do obsługi autentykacji
- **Plik**: `src/hooks/useAuth.ts`
- **Funkcjonalność**:
  - Zarządzanie stanem autentykacji
  - Metody logowania, rejestracji, wylogowania
  - Obsługa błędów autentykacji
  - Przechowywanie i odświeżanie sesji

### 3.2. Middleware Astro do obsługi autentykacji

#### 3.2.1. Rozszerzenie middleware
- **Plik**: `src/middleware/index.ts`
- **Funkcjonalność**:
  - Sprawdzanie sesji użytkownika
  - Przekierowanie niezalogowanych użytkowników
  - Dodanie danych użytkownika do kontekstu Astro

#### 3.2.2. Typy dla kontekstu Astro
- **Plik**: `src/env.d.ts`
- **Modyfikacja**: Dodanie typów dla danych użytkownika w kontekście Astro

### 3.3. Kontekst autentykacji React

#### 3.3.1. Provider autentykacji
- **Plik**: `src/components/auth/AuthProvider.tsx`
- **Funkcjonalność**:
  - Dostarczanie stanu autentykacji do komponentów React
  - Automatyczne odświeżanie sesji
  - Obsługa zmiany stanu autentykacji

#### 3.3.2. Hook kontekstu autentykacji
- **Plik**: `src/hooks/useAuthContext.ts`
- **Funkcjonalność**:
  - Dostęp do stanu autentykacji
  - Dostęp do metod autentykacji
  - Sprawdzanie czy użytkownik jest zalogowany

### 3.4. Ochrona stron

#### 3.4.1. Komponent AuthGuard
- **Plik**: `src/components/auth/AuthGuard.tsx`
- **Funkcjonalność**:
  - Ochrona komponentów React wymagających logowania
  - Przekierowanie niezalogowanych użytkowników do strony logowania

#### 3.4.2. Ochrona stron Astro
- **Metoda**: Sprawdzanie sesji w bloku frontmatter stron Astro
- **Przykład**:
  ```astro
  ---
  const session = await Astro.locals.supabase.auth.getSession();
  if (!session.data.session) {
    return Astro.redirect('/login');
  }
  ---
  ```

### 3.5. Przepływy autentykacji

#### 3.5.1. Rejestracja
1. Użytkownik wypełnia formularz rejestracji
2. Walidacja danych po stronie klienta
3. Wysłanie danych do endpointu `/api/auth/register`
4. Walidacja danych po stronie serwera
5. Utworzenie użytkownika w Supabase Auth
6. Utworzenie sesji użytkownika
7. Przekierowanie do strony onboardingu

#### 3.5.2. Logowanie
1. Użytkownik wypełnia formularz logowania
2. Walidacja danych po stronie klienta
3. Wysłanie danych do endpointu `/api/auth/login`
4. Walidacja danych po stronie serwera
5. Sprawdzenie poświadczeń w Supabase Auth
6. Utworzenie sesji użytkownika
7. Przekierowanie do strony rekomendacji (`/recommendations`)

#### 3.5.3. Wylogowanie
1. Użytkownik klika przycisk wylogowania
2. Wysłanie żądania do endpointu `/api/auth/logout`
3. Usunięcie sesji użytkownika
4. Przekierowanie do strony głównej

#### 3.5.4. Resetowanie hasła
1. Użytkownik wypełnia formularz resetowania hasła
2. Walidacja danych po stronie klienta
3. Wysłanie danych do endpointu `/api/auth/reset-password`
4. Walidacja danych po stronie serwera
5. Wygenerowanie i wysłanie linku resetującego hasło przez Supabase Auth
6. Wyświetlenie informacji o wysłaniu emaila

#### 3.5.5. Ustawianie nowego hasła
1. Użytkownik klika w link z emaila
2. Przekierowanie do strony ustawiania nowego hasła z tokenem w URL
3. Użytkownik wypełnia formularz nowego hasła
4. Walidacja danych po stronie klienta
5. Wysłanie danych do endpointu `/api/auth/new-password`
6. Walidacja danych po stronie serwera
7. Aktualizacja hasła w Supabase Auth
8. Przekierowanie do strony logowania

## 4. IMPLEMENTACJA BAZY DANYCH

### 4.1. Polityki dostępu do danych (RLS)

Polityki dostępu do danych (Row Level Security) dla tabel w bazie danych:

```sql
-- Polityka dla tabeli user_preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences"
  ON public.user_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON public.user_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON public.user_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Polityka dla tabeli user_books
ALTER TABLE public.user_books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own books"
  ON public.user_books
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own books"
  ON public.user_books
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own books"
  ON public.user_books
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own books"
  ON public.user_books
  FOR DELETE
  USING (auth.uid() = user_id);
```

### 4.2. Struktura tabel

#### 4.2.1. Tabela `user_preferences`
```sql
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preferences TEXT NOT NULL DEFAULT '',
  preferred_language TEXT NOT NULL DEFAULT 'pl',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT user_preferences_user_id_key UNIQUE (user_id)
);
```

#### 4.2.2. Tabela `user_books`
```sql
CREATE TABLE public.user_books (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  language TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('read', 'to_read', 'rejected')),
  rating BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX user_books_user_id_idx ON public.user_books (user_id);
CREATE INDEX user_books_status_idx ON public.user_books (status);
```

## 5. PODSUMOWANIE

System autentykacji dla AI Book Guide będzie oparty na Supabase Auth, który zapewni bezpieczne zarządzanie użytkownikami, sesjami i hasłami. Integracja z Astro i React pozwoli na płynne doświadczenie użytkownika, z odpowiednią walidacją danych i obsługą błędów.

Główne elementy systemu:
- Formularze rejestracji, logowania i resetowania hasła
- Endpointy API do obsługi autentykacji
- Middleware do ochrony stron wymagających logowania
- Kontekst autentykacji dla komponentów React
- Polityki dostępu do danych w bazie danych

Implementacja tego systemu pozwoli na realizację wszystkich User Stories z PRD:
- US-001: Rejestracja użytkownika
- US-002 i US-002a: Logowanie użytkownika i bezpieczny dostęp
- US-003: Edycja preferencji czytelniczych
- US-004 do US-012: Zarządzanie książkami i rekomendacjami

System wykorzystuje wbudowane mechanizmy Supabase Auth bez konieczności tworzenia dodatkowych tabel dla danych użytkownika, a jednocześnie zapewnia bezpieczeństwo i prywatność danych użytkowników. 