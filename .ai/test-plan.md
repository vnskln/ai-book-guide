# Plan Testów - AI Book Guide

## 1. Wprowadzenie i cele testowania

### 1.1 Cel dokumentu
Niniejszy dokument przedstawia kompleksowy plan testów dla aplikacji AI Book Guide. Celem planu jest zapewnienie wysokiej jakości produktu poprzez systematyczne testowanie wszystkich kluczowych funkcjonalności, komponentów i integracji.

### 1.2 Cele testowania
- Weryfikacja zgodności aplikacji z wymaganiami funkcjonalnymi i niefunkcjonalnymi
- Identyfikacja i eliminacja defektów przed wdrożeniem produkcyjnym
- Zapewnienie optymalnej wydajności i responsywności aplikacji
- Weryfikacja bezpieczeństwa danych użytkowników i integracji z zewnętrznymi serwisami
- Potwierdzenie poprawności działania aplikacji w różnych środowiskach i na różnych urządzeniach

## 2. Zakres testów

### 2.1 Komponenty podlegające testowaniu
- Frontend (Astro + React)
  - Strony (Pages)
  - Komponenty UI
  - Integracja z Shadcn/ui
  - Routing i nawigacja
- Backend (Astro API endpoints + Supabase)
  - Endpointy API
  - Integracja z bazą danych Supabase
  - Autoryzacja i uwierzytelnianie
- Integracja z zewnętrznymi serwisami
  - Openrouter.ai (komunikacja z modelami AI)
- Middleware
  - Walidacja danych
  - Obsługa sesji użytkownika

### 2.2 Komponenty wyłączone z testowania
- Wewnętrzna implementacja Supabase
- Wewnętrzna implementacja modeli AI dostępnych przez Openrouter.ai

## 3. Typy testów do przeprowadzenia

### 3.1 Testy jednostkowe
- **Zakres**: Testowanie izolowanych jednostek kodu (funkcje, metody, komponenty)
- **Narzędzia**: Vitest, React Testing Library
- **Priorytet**: Wysoki
- **Obszary**:
  - Serwisy (recommendations.service.ts, openrouter.service.ts, ai.service.ts, user-books.service.ts)
  - Walidatory i schematy (schemas/)
  - Hooki React (hooks/)
  - Komponenty UI (components/ui/)

### 3.2 Testy integracyjne
- **Zakres**: Testowanie interakcji między komponentami i modułami
- **Narzędzia**: Vitest, Supertest
- **Priorytet**: Wysoki
- **Obszary**:
  - Integracja API z bazą danych
  - Integracja frontendu z backendem
  - Przepływ autoryzacji użytkownika
  - Integracja z Openrouter.ai

### 3.3 Testy end-to-end (E2E)
- **Zakres**: Testowanie pełnych ścieżek użytkownika
- **Narzędzia**: Playwright
- **Priorytet**: Średni
- **Obszary**:
  - Rejestracja i logowanie
  - Proces onboardingu
  - Generowanie i zarządzanie rekomendacjami
  - Zarządzanie książkami użytkownika

### 3.4 Testy wydajnościowe
- **Zakres**: Testowanie responsywności i wydajności aplikacji
- **Narzędzia**: Lighthouse, k6
- **Priorytet**: Średni
- **Obszary**:
  - Czas ładowania stron
  - Wydajność API
  - Obsługa równoległych żądań

### 3.5 Testy bezpieczeństwa
- **Zakres**: Testowanie zabezpieczeń aplikacji
- **Narzędzia**: OWASP ZAP, Snyk
- **Priorytet**: Wysoki
- **Obszary**:
  - Autoryzacja i uwierzytelnianie
  - Podatności API
  - Bezpieczeństwo danych użytkownika

### 3.6 Testy dostępności
- **Zakres**: Testowanie zgodności z wytycznymi dostępności
- **Narzędzia**: Axe, Lighthouse
- **Priorytet**: Niski
- **Obszary**:
  - Zgodność z WCAG 2.1
  - Obsługa czytników ekranowych

### 3.7 Testy kompatybilności
- **Zakres**: Testowanie działania aplikacji w różnych środowiskach
- **Narzędzia**: BrowserStack
- **Priorytet**: Niski
- **Obszary**:
  - Przeglądarki (Chrome, Firefox, Safari, Edge)
  - Urządzenia mobilne i desktopowe

## 4. Scenariusze testowe dla kluczowych funkcjonalności

### 4.1 Autoryzacja i uwierzytelnianie
1. **Rejestracja użytkownika**
   - Warunki wstępne: Użytkownik nie posiada konta
   - Kroki:
     1. Przejście do strony rejestracji
     2. Wypełnienie formularza poprawnymi danymi
     3. Zatwierdzenie formularza
   - Oczekiwany rezultat: Utworzenie konta, przekierowanie do procesu onboardingu

2. **Logowanie użytkownika**
   - Warunki wstępne: Użytkownik posiada konto
   - Kroki:
     1. Przejście do strony logowania
     2. Wprowadzenie poprawnych danych logowania
     3. Zatwierdzenie formularza
   - Oczekiwany rezultat: Zalogowanie użytkownika, przekierowanie do strony głównej

3. **Resetowanie hasła**
   - Warunki wstępne: Użytkownik posiada konto
   - Kroki:
     1. Przejście do strony resetowania hasła
     2. Wprowadzenie adresu email
     3. Zatwierdzenie formularza
   - Oczekiwany rezultat: Wysłanie maila z linkiem do resetowania hasła

### 4.2 Onboarding
1. **Uzupełnienie preferencji czytelniczych**
   - Warunki wstępne: Użytkownik jest zalogowany, nie ma uzupełnionych preferencji
   - Kroki:
     1. Wypełnienie formularza preferencji
     2. Zatwierdzenie formularza
   - Oczekiwany rezultat: Zapisanie preferencji, przekierowanie do strony rekomendacji

### 4.3 Rekomendacje książek
1. **Generowanie nowej rekomendacji**
   - Warunki wstępne: Użytkownik jest zalogowany, ma uzupełnione preferencje
   - Kroki:
     1. Kliknięcie przycisku "Generuj rekomendację"
     2. Oczekiwanie na wynik
   - Oczekiwany rezultat: Wyświetlenie nowej rekomendacji książki

2. **Akceptacja rekomendacji**
   - Warunki wstępne: Użytkownik ma wygenerowaną rekomendację
   - Kroki:
     1. Kliknięcie przycisku "Akceptuj"
   - Oczekiwany rezultat: Zmiana statusu rekomendacji na "zaakceptowana", dodanie książki do listy "do przeczytania"

3. **Odrzucenie rekomendacji**
   - Warunki wstępne: Użytkownik ma wygenerowaną rekomendację
   - Kroki:
     1. Kliknięcie przycisku "Odrzuć"
   - Oczekiwany rezultat: Zmiana statusu rekomendacji na "odrzucona", dodanie książki do listy "odrzucone"

4. **Przeglądanie historii rekomendacji**
   - Warunki wstępne: Użytkownik ma historię rekomendacji
   - Kroki:
     1. Przejście do zakładki "Historia rekomendacji"
   - Oczekiwany rezultat: Wyświetlenie listy wszystkich rekomendacji z odpowiednimi statusami

### 4.4 Zarządzanie książkami użytkownika
1. **Dodawanie książki do kolekcji**
   - Warunki wstępne: Użytkownik jest zalogowany
   - Kroki:
     1. Przejście do zakładki "Moje książki"
     2. Kliknięcie przycisku "Dodaj książkę"
     3. Wypełnienie formularza
     4. Zatwierdzenie formularza
   - Oczekiwany rezultat: Dodanie książki do kolekcji użytkownika

2. **Zmiana statusu książki**
   - Warunki wstępne: Użytkownik ma książki w kolekcji
   - Kroki:
     1. Przejście do zakładki "Moje książki"
     2. Wybranie książki
     3. Zmiana statusu (przeczytana/do przeczytania/odrzucona)
   - Oczekiwany rezultat: Aktualizacja statusu książki

3. **Ocena przeczytanej książki**
   - Warunki wstępne: Użytkownik ma książkę o statusie "przeczytana"
   - Kroki:
     1. Przejście do zakładki "Moje książki"
     2. Wybranie książki
     3. Dodanie oceny (pozytywna/negatywna)
   - Oczekiwany rezultat: Zapisanie oceny książki

## 5. Środowisko testowe

### 5.1 Środowiska
- **Deweloperskie**: Lokalne środowisko programistów
- **Testowe**: Dedykowane środowisko dla QA
- **Staging**: Środowisko przedprodukcyjne
- **Produkcyjne**: Środowisko końcowe

### 5.2 Konfiguracja środowiska testowego
- Astro 5 + React 19
- Supabase (lokalna instancja dla testów)
- Mock dla Openrouter.ai API
- Baza danych PostgreSQL (lokalna lub w kontenerze)

### 5.3 Wymagania sprzętowe
- Serwer z min. 4GB RAM, 2 vCPU
- Klienty testowe: różne urządzenia i przeglądarki

## 6. Narzędzia do testowania

### 6.1 Narzędzia do testów automatycznych
- **Vitest**: Testy jednostkowe i integracyjne
- **React Testing Library**: Testy komponentów React
- **Playwright**: Testy E2E
- **k6**: Testy wydajnościowe
- **Lighthouse**: Testy wydajności i dostępności
- **Axe**: Testy dostępności
- **OWASP ZAP**: Testy bezpieczeństwa
- **Snyk**: Analiza podatności

### 6.2 Narzędzia do testów manualnych
- **Postman/Insomnia**: Testowanie API
- **DevTools**: Inspekcja i debugowanie
- **BrowserStack**: Testowanie na różnych przeglądarkach i urządzeniach

### 6.3 Narzędzia do zarządzania testami
- **GitHub Issues**: Śledzenie błędów i zadań
- **GitHub Actions**: CI/CD
- **Allure**: Raportowanie wyników testów

## 7. Harmonogram testów

### 7.1 Fazy testowania
1. **Planowanie testów**: Tydzień 1
2. **Implementacja testów jednostkowych**: Tydzień 2-3
3. **Implementacja testów integracyjnych**: Tydzień 3-4
4. **Implementacja testów E2E**: Tydzień 4-5
5. **Testy wydajnościowe i bezpieczeństwa**: Tydzień 5-6
6. **Testy regresyjne**: Tydzień 6
7. **Raportowanie i poprawki**: Tydzień 7

### 7.2 Kamienie milowe
- Zakończenie implementacji testów jednostkowych: Koniec tygodnia 3
- Zakończenie implementacji testów integracyjnych: Koniec tygodnia 4
- Zakończenie implementacji testów E2E: Koniec tygodnia 5
- Zakończenie testów wydajnościowych i bezpieczeństwa: Koniec tygodnia 6
- Finalne raportowanie: Koniec tygodnia 7

## 8. Kryteria akceptacji testów

### 8.1 Kryteria wejścia
- Kod przeszedł code review
- Środowisko testowe jest skonfigurowane
- Dokumentacja funkcjonalna jest dostępna
- Przypadki testowe są przygotowane

### 8.2 Kryteria wyjścia
- 95% pokrycia testami jednostkowymi
- Wszystkie testy integracyjne przechodzą
- Wszystkie testy E2E przechodzą
- Brak krytycznych i wysokich błędów
- Wydajność aplikacji spełnia wymagania (czas ładowania strony < 3s)
- Aplikacja spełnia podstawowe wymagania dostępności

### 8.3 Kryteria zawieszenia i wznowienia
- **Zawieszenie**: Wykrycie krytycznego błędu uniemożliwiającego dalsze testowanie
- **Wznowienie**: Naprawienie krytycznego błędu i weryfikacja poprawki

## 9. Role i odpowiedzialności w procesie testowania

### 9.1 Kierownik testów
- Planowanie i koordynacja procesu testowania
- Raportowanie postępów i wyników
- Zarządzanie zasobami testowymi

### 9.2 Inżynierowie QA
- Implementacja testów automatycznych
- Wykonywanie testów manualnych
- Raportowanie błędów

### 9.3 Deweloperzy
- Implementacja testów jednostkowych
- Naprawianie zgłoszonych błędów
- Code review testów automatycznych

### 9.4 DevOps
- Konfiguracja środowiska testowego
- Konfiguracja CI/CD dla testów
- Monitorowanie wydajności

## 10. Procedury raportowania błędów

### 10.1 Klasyfikacja błędów
- **Krytyczny**: Błąd uniemożliwiający korzystanie z kluczowych funkcjonalności
- **Wysoki**: Błąd znacząco utrudniający korzystanie z aplikacji
- **Średni**: Błąd wpływający na doświadczenie użytkownika, ale nie blokujący
- **Niski**: Drobne błędy kosmetyczne lub sugestie usprawnień

### 10.2 Szablon zgłoszenia błędu
- **Tytuł**: Krótki, opisowy tytuł błędu
- **Środowisko**: Informacje o środowisku testowym
- **Kroki reprodukcji**: Dokładne kroki do odtworzenia błędu
- **Aktualny rezultat**: Co się dzieje obecnie
- **Oczekiwany rezultat**: Co powinno się dziać
- **Załączniki**: Zrzuty ekranu, logi, nagrania
- **Priorytet/Ważność**: Klasyfikacja błędu

### 10.3 Cykl życia błędu
1. **Zgłoszony**: Błąd został zgłoszony
2. **Potwierdzony**: Błąd został zweryfikowany przez zespół QA
3. **W trakcie naprawy**: Deweloper pracuje nad naprawą
4. **Naprawiony**: Deweloper oznaczył błąd jako naprawiony
5. **Weryfikacja**: QA weryfikuje poprawkę
6. **Zamknięty**: Błąd został naprawiony i zweryfikowany

## 11. Zarządzanie ryzykiem

### 11.1 Identyfikacja ryzyk
- Integracja z zewnętrznymi API (Openrouter.ai)
- Wydajność przy dużym obciążeniu
- Bezpieczeństwo danych użytkownika
- Kompatybilność z różnymi przeglądarkami

### 11.2 Strategie mitygacji ryzyka
- Implementacja mechanizmów retry i fallback dla zewnętrznych API
- Testy wydajnościowe i optymalizacja kodu
- Regularne testy bezpieczeństwa i audyty
- Testy kompatybilności na różnych przeglądarkach i urządzeniach

## 12. Załączniki

### 12.1 Szablony przypadków testowych
- Szablon dla testów jednostkowych
- Szablon dla testów integracyjnych
- Szablon dla testów E2E

### 12.2 Narzędzia i konfiguracje
- Konfiguracja Vitest
- Konfiguracja Playwright
- Konfiguracja CI/CD dla testów

### 12.3 Metryki i raportowanie
- Szablon raportu z testów
- Definicje metryk jakości 