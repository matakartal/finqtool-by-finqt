# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- `npm run dev` - Start development server with hot reload on port 8080
- `npm run build` - Create production build for Chrome extension
- `npm run build:dev` - Create development build
- `npm run lint` - Run ESLint for code quality checks
- `npm run preview` - Preview production build locally

### Chrome Extension Development
After building, load the `dist` folder as an unpacked extension in Chrome at `chrome://extensions/`

## Project Architecture

### Chrome Extension Structure
This is a React-based Chrome extension built with Vite, optimized for browser extension deployment. Key architectural decisions:

- **Router**: Uses `HashRouter` instead of `BrowserRouter` for Chrome extension compatibility
- **Storage**: Dual storage system - Chrome storage API with localStorage fallback (`src/utils/storage.ts`)
- **Build Output**: Configured for Chrome extension with relative paths and specific chunk splitting

### State Management
- **Zustand**: Primary state management for application state
- **React Query**: Data fetching and caching for market data
- **Chrome Storage**: Persistent user settings and notes storage

### UI Framework
- **shadcn/ui**: Component library built on Radix UI primitives
- **Tailwind CSS**: Utility-first styling with custom crypto-themed color palette
- **Theme System**: CSS variables-based theming with light/dark mode support

### Key Directories
- `src/components/` - React components (UI components in `ui/` subdirectory)
- `src/pages/` - Route-level components (Home, Rules, NotFoundPage)
- `src/hooks/` - Custom React hooks including theme management
- `src/utils/storage.ts` - Chrome extension storage abstraction
- `src/translations/` - i18n files for English and Turkish
- `src/types/` - TypeScript type definitions

### Core Features
- **Financial Calculators**: Position sizing, P&L calculations
- **Market Data**: Real-time crypto market information
- **Notes System**: Template-based note-taking with categories
- **Trading Rules**: Built-in trading guidelines and best practices
- **Multi-language**: English and Turkish support via i18next

### Extension-Specific Considerations
- All routing uses hash-based navigation for extension compatibility
- Storage operations are async and handle both Chrome storage and localStorage
- Build process optimized for extension deployment with manual chunk splitting
- Components designed for popup constraints (fixed dimensions)

### Important Files
- `vite.config.ts` - Extension-optimized build configuration
- `src/App.tsx` - Main application wrapper with providers
- `src/utils/storage.ts` - Storage abstraction for Chrome extension
- `src/types/chrome.d.ts` - Chrome extension API type definitions