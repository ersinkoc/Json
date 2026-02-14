# @oxog/json Website

Modern, responsive website for the @oxog/json TypeScript JSON toolkit library.

![Website Preview](./docs/preview.png)

## Features

- **Modern Design**: Clean UI with gradient backgrounds, glass morphism effects, and smooth animations
- **Fully Responsive**: Mobile-first design that works beautifully on all devices
- **Interactive Playground**: Try the library directly in your browser
- **Comprehensive Documentation**: Clear API reference and usage examples
- **Type-Safe**: Built with TypeScript for type safety throughout
- **Fast**: Built with Vite for lightning-fast development and production builds

## Tech Stack

- **React 18+**: Modern React with hooks and concurrent features
- **TypeScript**: Full type safety and excellent developer experience
- **React Router DOM**: Client-side routing with HashRouter
- **Tailwind CSS v4+**: Utility-first CSS framework with custom theme
- **Lucide React**: Beautiful, consistent icons
- **Vite**: Next-generation frontend tooling

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone https://github.com/oxog/json
cd json/website
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
website/
├── public/              # Static assets
├── src/
│   ├── components/
│   │   ├── ui/         # Reusable UI components (Button, Card, CodeBlock)
│   │   ├── layout/     # Layout components (Navbar, Footer)
│   │   ├── Hero.tsx    # Hero section component
│   │   └── Features.tsx # Features section component
│   ├── pages/          # Page components
│   │   ├── home.tsx    # Home page
│   │   ├── docs.tsx    # Documentation page
│   │   └── playground.tsx # Interactive playground
│   ├── index.css       # Global styles and Tailwind imports
│   ├── App.tsx         # Main app with routing
│   └── main.tsx        # Application entry point
├── index.html          # HTML template
├── tailwind.config.ts  # Tailwind configuration
├── tsconfig.json       # TypeScript configuration
└── vite.config.ts      # Vite configuration
```

## Components

### UI Components

- **Button**: Versatile button component with variants (primary, secondary, outline, ghost, danger) and sizes
- **Card**: Flexible card component with header, content, and footer sections
- **CodeBlock**: Syntax-highlighted code block with copy functionality

### Layout Components

- **Navbar**: Responsive navigation with mobile menu and smooth scroll
- **Footer**: Comprehensive footer with links and social icons

### Page Components

- **Hero**: Eye-catching hero section with stats and CTAs
- **Features**: Feature cards showcasing library capabilities
- **Documentation**: Complete API documentation with examples
- **Playground**: Interactive playground for trying the library

## Customization

### Theme Colors

Edit `tailwind.config.ts` to customize the color scheme:

```typescript
colors: {
  primary: { /* ... */ },
  accent: { /* ... */ },
}
```

### Styling

Global styles are in `src/index.css`. Key features:
- Custom animations (fade-in, slide-up, float, etc.)
- Glass morphism effects
- Custom scrollbar styling
- Gradient text utilities

## Building for Production

```bash
npm run build
# or
yarn build
# or
pnpm build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
# or
yarn preview
# or
pnpm preview
```

## Deployment

The site can be deployed to any static hosting service:

- **Vercel**: `vercel deploy`
- **Netlify**: Connect your repo and deploy
- **GitHub Pages**: Use the `gh-pages` branch
- **Cloudflare Pages**: Connect your repo

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_APP_TITLE=@oxog/json
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT

## Support

- Documentation: [https://oxog.github.io/json](https://oxog.github.io/json)
- Issues: [GitHub Issues](https://github.com/oxog/json/issues)
- Discussions: [GitHub Discussions](https://github.com/oxog/json/discussions)
