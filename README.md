# finqtool - Cryptocurrency Trading Tools Extension

finqtool is a comprehensive Chrome extension designed specifically for cryptocurrency traders and investors. Built by finqt, it provides essential trading tools, calculators, market data, and note-taking capabilities all within a convenient browser extension popup.

## Features

### Core Functionality

- **Live Market Data**: Real-time cryptocurrency market information with auto-refresh capabilities
- **Financial Calculators**: Professional-grade tools for position sizing, risk management, and profit/loss calculations
- **Basic Calculator**: Standard calculator with mathematical functions and conversions
- **Notes System**: Organized note-taking with categorized templates for trading strategies, analysis, and psychology
- **Trading Rules**: Built-in guidelines and best practices for disciplined trading

### User Experience

- **Multi-language Support**: English and Turkish language options
- **Dark/Light Theme**: Automatic theme detection with manual toggle options
- **Responsive Design**: Optimized for various screen sizes and extension popup constraints
- **Persistent Settings**: User preferences and data stored locally in browser
- **Offline Functionality**: Core calculations and note-taking work without internet connection

### Technical Features

- **Local Data Processing**: All sensitive calculations performed client-side
- **Chrome Storage API**: Secure local data persistence
- **Modern UI Components**: Built with shadcn/ui component library
- **TypeScript**: Full type safety and enhanced developer experience
- **Hot Module Replacement**: Fast development with instant preview

## Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # Reusable UI components (shadcn/ui)
│   ├── BasicCalculator.tsx
│   ├── FinancialCalculator.tsx
│   ├── MarketsTable.tsx
│   ├── Notes.tsx
│   ├── InfoPopup.tsx
│   └── Footer.tsx
├── pages/               # Page components
│   ├── Home.tsx         # Main application page
│   └── Rules.tsx        # Trading rules page
├── hooks/               # Custom React hooks
├── contexts/            # React context providers
├── translations/        # i18n translation files
│   ├── en.json          # English translations
│   └── tr.json          # Turkish translations
├── utils/               # Utility functions
├── constants/           # Application constants
└── types/               # TypeScript type definitions
```

## Technology Stack

### Frontend Framework
- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Full type safety and enhanced developer experience
- **Vite**: Fast build tool with hot module replacement

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality React components built on Radix UI
- **Radix UI**: Accessible component primitives
- **Lucide React**: Modern icon library

### State Management & Data
- **Zustand**: Lightweight state management
- **Chrome Storage API**: Browser extension data persistence
- **React Query**: Data fetching and caching (for market data)

### Internationalization & Theming
- **i18next**: Internationalization framework
- **next-themes**: Theme management for dark/light modes

### Development Tools
- **ESLint**: Code linting and formatting
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing

## Getting Started

### Prerequisites

- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Google Chrome** browser for extension testing

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd finqtool
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
npm run dev
```

4. **Build for production**
   ```bash
   npm run build
   ```

### Chrome Extension Setup

1. **Build the extension**
   ```bash
   npm run build
   ```

2. **Open Chrome and navigate to extensions**
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)

3. **Load the extension**
   - Click "Load unpacked"
   - Select the `dist` folder from your project directory

4. **Test the extension**
   - Click the extension icon in Chrome toolbar
   - The finqtool popup should appear

## Development Workflow

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Create production build
- `npm run build:dev` - Create development build
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality checks

### Code Quality

The project uses ESLint with TypeScript support for maintaining code quality:

- **React Hooks Rules**: Ensures proper hook usage
- **TypeScript Rules**: Enforces type safety
- **Import/Export Rules**: Maintains clean import structure

### Component Architecture

Components follow a modular architecture:

- **Pages**: Route-level components (Home, Rules)
- **Feature Components**: Domain-specific components (Notes, Calculator)
- **UI Components**: Reusable shadcn/ui components
- **Hooks**: Custom logic extraction
- **Utils**: Pure utility functions

## Browser Extension Architecture

### Manifest Configuration

The extension uses Manifest V3 with the following key features:

- **Action API**: Browser toolbar popup interface
- **Storage Permission**: Local data persistence
- **Web Accessible Resources**: Extension page access
- **Content Security Policy**: Security restrictions

### Data Persistence

- **Chrome Storage API**: Synchronous local storage
- **Settings Persistence**: User preferences and theme settings
- **Notes Storage**: Trading notes and templates
- **Offline Support**: All data stored locally

### Security Considerations

- **Local Processing**: Sensitive calculations never leave the browser
- **CSP Headers**: Restricted script execution
- **Storage Isolation**: Extension data isolated from web pages

## Internationalization

The application supports multiple languages through i18next:

### Supported Languages
- **English** (en) - Default language
- **Turkish** (tr) - Full translation coverage

### Translation Structure
```
src/translations/
├── en.json    # English translations
└── tr.json    # Turkish translations
```

### Adding New Languages

1. Create new translation file in `src/translations/`
2. Add language detection logic in `src/i18n.ts`
3. Update language selector component

## Theming System

### Theme Implementation

- **CSS Variables**: Dynamic theme values
- **Tailwind Integration**: Theme-aware utility classes
- **Automatic Detection**: System preference detection
- **Manual Override**: User theme selection

### Theme Variables

```css
:root {
  --primary: 142.1 76.2% 36.3%;
  --background: 0 0% 100%;
  /* ... other variables */
}

.dark {
  --primary: 142.4 71.8% 29.2%;
  --background: 0 0% 3.9%;
  /* ... dark mode overrides */
}
```

## Component Documentation

### Key Components

#### Notes System
- **Template-based creation**: Pre-built templates for different note types
- **Category organization**: Color-coded categories for easy identification
- **Rich text editing**: Multi-line text areas with character limits
- **Local persistence**: Notes stored in browser storage

#### Financial Calculators
- **Position Sizing**: Risk-based position calculations
- **Profit/Loss**: P&L calculations with percentage returns
- **Risk Management**: Stop-loss and take-profit calculators
- **Local computation**: All calculations performed client-side

#### Market Data
- **Real-time updates**: Auto-refreshing market data
- **Multiple pairs**: Support for major cryptocurrency pairs
- **Compact display**: Efficient data presentation in popup constraints

## Deployment

### Chrome Web Store

1. **Prepare extension package**
   ```bash
   npm run build
   ```

2. **Create ZIP file**
   ```bash
   cd dist
   zip -r ../finqtool-extension.zip .
   ```

3. **Upload to Chrome Web Store**
   - Visit [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
   - Create new item and upload ZIP file
   - Fill out store listing information

### Development Deployment

For development and testing:
- Use `npm run build:dev` for development builds
- Load unpacked extension in Chrome for testing
- Use Chrome DevTools for debugging

## Contributing

### Development Guidelines

1. **Code Style**: Follow ESLint configuration
2. **TypeScript**: Use strict type checking
3. **Component Structure**: Follow established patterns
4. **Testing**: Test extension in multiple browsers

### Pull Request Process

1. Fork the repository
2. Create feature branch
3. Make changes with proper commit messages
4. Test thoroughly in extension environment
5. Submit pull request with detailed description

## Troubleshooting

### Common Issues

**Extension not loading**
- Ensure `dist` folder contains built files
- Check manifest.json for syntax errors
- Verify all required permissions

**Theme not switching**
- Check browser support for CSS custom properties
- Verify theme context is properly initialized
- Clear browser cache and reload extension

**Data not persisting**
- Check Chrome Storage permissions
- Verify storage quota limits
- Test in incognito mode to rule out conflicts

### Debug Mode

Enable Chrome DevTools for extension debugging:

1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "background page" or "inspect popup"
4. Use Console and Sources tabs for debugging

## License

This project is proprietary software developed by finqt. All rights reserved.

## Support

For support, questions, or feedback:

- **Email**: info@finqt.com
- **Website**: https://finqt.dev
- **Project URL**: https://finqt.dev/projects/029c7194-14e7-4fba-9e67-c1acdc455845

## Changelog

### Version 1.0.0
- Initial release
- Core trading tools and calculators
- Notes system with templates
- Multi-language support
- Dark/light theme
- Chrome extension functionality
