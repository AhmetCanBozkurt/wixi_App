# Wixi Worklines Frontend

A modern React application for Worklines ProConsulting - Educational consultancy for Germany.

**Based on:** vo-template design, converted from Next.js to React + Vite

## Features

- ⚡ **Vite** - Fast build tool and development server
- ⚛️ **React 18** - Latest version with modern features
- 🔷 **TypeScript** - Type safety and better developer experience
- 🎨 **TailwindCSS** - Utility-first CSS framework
- 🧭 **React Router** - Client-side routing
- 🔧 **ESLint** - Code linting and quality
- 💅 **Prettier** - Code formatting
- 📁 **Organized Structure** - Clean folder organization

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── hooks/         # Custom React hooks
├── services/      # API services and utilities
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
├── contexts/      # React contexts
└── assets/        # Static assets
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking

## Development

### Code Quality

This project uses ESLint and Prettier for code quality and formatting:

- ESLint configuration is in `.eslintrc.cjs`
- Prettier configuration is in `.prettierrc`
- Pre-commit hooks can be added for automatic formatting

### Styling

The project uses TailwindCSS for styling with a well-organized CSS architecture:

- **TailwindCSS Configuration**: `tailwind.config.js`
- **PostCSS Configuration**: `postcss.config.js`
- **Main Styles**: `src/style.css` - Contains Tailwind imports and custom component classes
- **CSS Variables**: `src/styles/variables.css` - Custom properties for theming
- **Global Styles**: `src/styles/globals.css` - Additional utilities and animations
- **CSS Documentation**: `src/styles/README.md` - Complete CSS architecture guide

#### Custom Component Classes
- `.btn-primary` / `.btn-secondary` - Button styles
- `.input-field` - Form input styling
- `.card` - Card container
- `.nav-link` - Navigation links with active/inactive states

#### CSS Variables
The project uses CSS custom properties for consistent theming, including colors, spacing, shadows, and typography. Dark mode support is included through automatic system preference detection.

### Routing

React Router is configured in `src/App.tsx` with the following routes:

- `/` - Home page
- `/about` - About page
- `/contact` - Contact page
- `*` - 404 Not Found page

## Production Build

To create a production build:

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Environment Variables

Create a `.env` file in the root directory for environment variables:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting and formatting
5. Submit a pull request

## License

This project is licensed under the MIT License.
