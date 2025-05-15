# AI Book Guide

An intelligent book recommendation system that helps readers choose their next book using advanced AI technology.

## Project Description

AI Book Guide is a smart book recommendation system powered by Claude 3.5 Sonnet. It helps readers choose their next book based on their reading preferences and history. The system generates personalized suggestions, providing a brief plot outline without spoilers, and learns from user feedback to improve recommendations over time.

## Key Features
- Personalized book recommendations
- Simple rating system (thumbs up/down)
- Intelligent suggestions with plot outlines (no spoilers)
- Book list management:
  - Read books with ratings
  - To-read list of accepted suggestions
  - Rejected suggestions list
- Customizable reading preferences

## Tech Stack
- [Astro](https://astro.build/) v5.5.5 - Modern web framework for building fast, content-focused websites
- [React](https://react.dev/) v19.0.0 - UI library for building interactive components
- [TypeScript](https://www.typescriptlang.org/) v5 - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) v4.0.17 - Utility-first CSS framework
- [Shadcn/ui](https://ui.shadcn.com/) - Accessible and customizable UI components
- [Supabase](https://supabase.io/) - Backend-as-a-Service with PostgreSQL database
- [OpenRouter.ai](https://openrouter.ai/) - API access to Claude 3.5 Sonnet and other AI models

## Testing Stack
- [Vitest](https://vitest.dev/) v1.4.0 - Unit and integration testing framework
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) v14.2.1 - Testing React components
- [Playwright](https://playwright.dev/) v1.42.1 - End-to-end testing

## Getting Started Locally

### Prerequisites
- Node.js v22.14.0 (as specified in `.nvmrc`)
- npm (comes with Node.js)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/10xDevs/ai-book-guide.git
cd ai-book-guide
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your Supabase and OpenRouter API keys
```

4. Run the development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

6. Open your browser and navigate to:
```
http://localhost:3000
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run astro` - Run Astro CLI commands
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run test` - Run Vitest tests
- `npm run test:ui` - Run Vitest with UI
- `npm run test:coverage` - Run tests with coverage
- `npm run test:e2e` - Run Playwright end-to-end tests
- `npm run test:e2e:ui` - Run Playwright tests with UI

## Project Scope

### MVP Features
- User account management (registration, login)
- Reading preferences profile (max 1000 characters)
- Book management (add, rate, remove books)
- Single book suggestion generation on demand
- Suggestion acceptance or rejection
- Management of to-read and rejected books lists

### Out of MVP Scope
- Bulk book import
- Multiple simultaneous suggestions
- Integration with external book platforms
- Mobile applications
- Social features
- Advanced filters and book categorization
- Tags and genre system

## Project Status

This project is currently in active development. The core user authentication, book management, and recommendation features have been implemented. The application includes:

- User registration and login
- User preferences management
- Book management (add, rate, view)
- Book recommendation system
- Personalized reading lists (read, to-read, rejected)

We are using Supabase for authentication and database management with a fully typed interface.

## License

MIT

## Project Structure

```
.
├── src/
│   ├── components/ # UI components (Astro & React)
│   │   └── ui/     # Shadcn/ui components
│   ├── db/         # Supabase clients and types
│   ├── hooks/      # React hooks
│   ├── layouts/    # Astro layouts
│   ├── lib/        # Services and helpers
│   ├── middleware/ # Astro middleware
│   ├── pages/      # Astro pages
│   │   ├── api/    # API endpoints
│   │   ├── my-books/  # Book management pages
│   │   ├── profile/   # User profile pages
│   │   └── recommendations/ # Recommendation pages
│   ├── styles/     # Global styles
│   └── types.ts    # Shared types (Entities, DTOs)
├── public/         # Public assets
├── e2e/           # End-to-end tests
└── supabase/      # Supabase configuration and migrations
```

## AI Development Support

This project is configured with AI development tools to enhance the development experience, providing guidelines for:

- Project structure
- Coding practices
- Frontend development
- Styling with Tailwind
- Accessibility best practices
- Astro and React guidelines

### Cursor IDE

The project includes AI rules in `.cursor/rules/` directory that help Cursor IDE understand the project structure and provide better code suggestions.
