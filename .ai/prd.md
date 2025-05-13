# Dokument wymagań produktu (PRD) - AI Book Guide

## 1. Przegląd produktu

AI Book Guide to inteligentny system rekomendacji książek, który pomaga czytelnikom w wyborze kolejnej lektury. System wykorzystuje zaawansowany model AI (Claude 3.5 Sonnet) do generowania spersonalizowanych sugestii na podstawie preferencji czytelniczych użytkownika oraz historii przeczytanych książek.

Główne cechy produktu:
- Spersonalizowane rekomendacje książek
- Prosty system oceniania (kciuk w górę/dół)
- Inteligentne sugestie z zarysem fabuły bez spoilerów
- Zarządzanie listami książek:
  - Lista przeczytanych: książki już przeczytane wraz z ich oceną
  - Lista do przeczytania: zaakceptowane sugestie czekające na przeczytanie
  - Lista odrzuconych: sugestie, które nie spełniły oczekiwań użytkownika
- Możliwość dostosowania preferencji czytelniczych

## 2. Problem użytkownika

### Problem podstawowy
Współcześni czytelnicy stoją przed wyzwaniem wyboru kolejnej książki ze względu na ogromną liczbę dostępnych tytułów na rynku. Proces wyboru jest czasochłonny i często frustrujący, co może prowadzić do:
- Przypadkowych wyborów niedopasowanych do preferencji
- Rezygnacji z czytania z powodu trudności w znalezieniu odpowiedniej książki
- Straty czasu na czytanie książek, które nie spełniają oczekiwań

### Rozwiązanie
AI Book Guide rozwiązuje ten problem poprzez:
- Automatyczne generowanie trafnych sugestii na podstawie preferencji opisanych przez użytkownika, ocen przeczytanych książek, oraz odrzuconych sugestii książek
- Dostarczanie krótkiego zarysu fabuły pomagającego w podjęciu decyzji
- Uczenie się i doskonalenie rekomendacji na podstawie ocen użytkownika
- Oszczędność czasu dzięki szybkiemu procesowi rekomendacji

## 3. Wymagania funkcjonalne

### System kont użytkowników
- Rejestracja i logowanie użytkowników
- Profil użytkownika z opisem preferencji czytelniczych (max 1000 znaków) oraz preferowanym językiem rekomendowanych książek
- Możliwość edycji preferencji w dowolnym momencie

### Zarządzanie książkami
- Dodawanie przeczytanych książek (tytuł, autor, język)
- Ocenianie książek systemem kciuka w górę/dół
- Usuwanie książek z listy przeczytanych
- Zarządzanie listą książek do przeczytania
- Zarządzanie listą książek odrzuconych

### System rekomendacji
- Generowanie pojedynczej sugestii na żądanie
- Sugestia jest wynikiem zapytania do modelu Claude 3.5 Sonnet, które zawiera w kontekście preferencje użytkownika, listę przeczytanych książek wraz z ocenami, oraz listę książek odrzuconych przez użytkownika
- Sugestie tylko w językach znanych użytkownikowi
- Krótki zarys fabuły bez spoilerów
- Uzasadnienie rekomendacji
- Możliwość akceptacji lub odrzucenia sugestii

## 4. Granice produktu

### Poza zakresem MVP
- Import wielu przeczytanych książek jednocześnie
- Generowanie wielu sugestii naraz
- Integracje z zewnętrznymi platformami książkowymi
- Aplikacje mobilne
- Społecznościowe funkcje
- Zaawansowane filtry i kategoryzacja książek
- System tagów i gatunków

### Ograniczenia techniczne
- Tylko aplikacja webowa
- Maksymalna długość opisu preferencji: 1000 znaków

## 5. Historyjki użytkowników

### Zarządzanie kontem

US-001: Rejestracja użytkownika
- Jako nowy użytkownik chcę utworzyć konto w systemie
- Kryteria akceptacji:
  - Formularz rejestracji zawiera: email, hasło, potwierdzenie hasła
  - Walidacja unikalności adresu email
  - Walidacja siły hasła
  - Potwierdzenie utworzenia konta
  - Udana rejestracja przekierowuje do onboardingu, gdzie użytkownik podaje swoje preferencje czytelniczne i preferowany język

US-002: Logowanie użytkownika
- Jako zarejestrowany użytkownik chcę się zalogować do systemu
- Kryteria akceptacji:
  - Formularz logowania z polami email i hasło
  - Obsługa błędnych danych logowania
  - Przekierowanie do głównego widoku po poprawnym logowaniu

US-002a: Bezpieczny dostęp
- Opis: Jako użytkownik chcę mieć możliwość rejestracji i logowania się do systemu w sposób zapewniający bezpieczeństwo moich danych.
- Kryteria akceptacji:
  - Logowanie i rejestracja odbywają się na dedykowanych stronach.
  - Logowanie wymaga podania adresu email i hasła.
  - Rejestracja wymaga podania adresu email, hasła i potwierdzenia hasła.
  - Dostęp do wszystkich funkcjonalności wymaga rejestracji i zalogowania
  - Użytkownik może się wylogować z systemu poprzez przycisk w prawym górnym rogu.
  - Nie korzystamy z zewnętrznych serwisów logowania (np. Google, GitHub).
  - Odzyskiwanie hasła powinno być możliwe.

US-003: Edycja preferencji czytelniczych
- Jako użytkownik chcę zaktualizować swoje preferencje czytelnicze
- Kryteria akceptacji:
  - Dostęp do formularza edycji z profilu użytkownika
  - Wyświetlenie aktualnych preferencji
  - Walidacja długości tekstu (max 1000 znaków)
  - Potwierdzenie zapisania zmian


### Zarządzanie książkami

US-004: Dodawanie przeczytanej książki
- Jako użytkownik chcę dodać przeczytaną książkę do swojej listy
- Kryteria akceptacji:
  - Formularz z polami: tytuł, autor, język
  - Wszystkie pola są wymagane
  - Możliwość dodania oceny (kciuk w górę/dół)
  - Potwierdzenie dodania książki

US-005: Ocenianie książki
- Jako użytkownik chcę ocenić przeczytaną książkę
- Kryteria akceptacji:
  - Prosty system oceny (kciuk w górę/dół)
  - Możliwość zmiany oceny
  - Natychmiastowa aktualizacja widoku

US-006: Usuwanie książki
- Jako użytkownik chcę usunąć książkę z mojej listy przeczytanych książek
- Kryteria akceptacji:
  - Przycisk usuwania przy każdej książce
  - Potwierdzenie przed usunięciem
  - Aktualizacja listy po usunięciu

### System rekomendacji

US-007: Generowanie sugestii
- Jako użytkownik chcę otrzymać sugestię kolejnej książki
- Kryteria akceptacji:
  - Przycisk "Zasugeruj mi kolejną książkę"
  - Wyświetlenie sugestii z zarysem fabuły i uzasadnieniem

US-008: Obsługa sugestii
- Jako użytkownik chcę zaakceptować lub odrzucić sugestię
- Kryteria akceptacji:
  - Przyciski akceptacji i odrzucenia
  - Po akceptacji książka trafia na listę "do przeczytania"
  - Po odrzuceniu książka trafia na likstę "odrzucone"

US-009: Zarządzanie listą "do przeczytania"
- Jako użytkownik chcę przenieść książkę z listy "do przeczytania" na "przeczytane"
- Kryteria akceptacji:
  - Możliwość oznaczenia książki jako przeczytanej
  - Wymagana ocena przy przeniesieniu
  - Aktualizacja obu list

US-010: Usuwanie książki z listy "do przeczytania"
- Jako użytkownik chcę usunąć książkę z listy "do przeczytania" bez jej przeczytania
- Kryteria akceptacji:
  - Przycisk usuwania przy każdej książce na liście "do przeczytania"
  - Potwierdzenie przed usunięciem
  - Możliwość przeniesienia usuwanej książki na listę "odrzucone"
  - Aktualizacja odpowiednich list

US-011: Usuwanie książki z listy "odrzuconych"
- Jako użytkownik chcę usunąć książkę z listy "odrzuconych"
- Kryteria akceptacji:
  - Możliwość usunięcia książki z listy "odrzuconych"
  - Aktualizacja listy

US-012: Przeniesienie książki z listy "odrzuconych" na listę "do przeczytania"
- Jako użytkownik chcę przenieść książkę z listy "odrzuconych" na listę "do przeczytania"
- Kryteria akceptacji:
  - Możliwość przeniesienia książki z listy "odrzuconych" na listę "do przeczytania"
  - Aktualizacja obu list

## 6. Metryki sukcesu

### Główne wskaźniki
1. Współczynnik akceptacji sugestii
   - Cel: 75% sugestii zaakceptowanych przez użytkowników
   - Pomiar: liczba zaakceptowanych sugestii / całkowita liczba wygenerowanych sugestii

3. Jakość rekomendacji
   - Procent przeczytanych książek z pozytywną oceną

### Wskaźniki techniczne
1. Użyteczność
   - Procent ukończonych rejestracji
   - Procent użytkowników, którzy dodali min. 3 książki
   - Procent użytkowników, którzy zaakceptowali min. q sugestię