import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Github, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';

const navItems = [
  { label: 'Documentation', href: '/docs' },
  { label: 'Playground', href: '/playground' },
  { label: 'Examples', href: '/examples' },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { theme, toggle } = useTheme();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 text-sm font-bold text-white">
              {}
            </div>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              @oxog/json
            </span>
          </Link>
          
          <div className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'text-sm font-medium transition-colors',
                  location.pathname.startsWith(item.href)
                    ? 'text-zinc-900 dark:text-zinc-100'
                    : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <a
            href="https://npmjs.com/package/@oxog/json"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:block"
          >
            <Button variant="ghost" size="icon" className="text-zinc-600 dark:text-zinc-400">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM3.5 3.5h8.5v8.5H8.75V6.25H6v5.75H3.5zm10.75 0h6.25v17H12V14.25h2V18.5h7v-3.75h-7V6.25h7V12h-2V8.5h-3.25v6.5H14.5V3.5z"/>
              </svg>
            </Button>
          </a>
          <a
            href="https://github.com/ersinkoc/json"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="ghost" size="icon" className="text-zinc-600 dark:text-zinc-400">
              <Github className="h-5 w-5" />
            </Button>
          </a>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className="text-zinc-600 dark:text-zinc-400"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Button
            size="sm"
            className="hidden sm:flex bg-gradient-to-r from-blue-500 to-violet-500 text-white hover:from-blue-600 hover:to-violet-600"
            onClick={() => {
              navigator.clipboard.writeText('npm install @oxog/json');
            }}
          >
            npm install @oxog/json
          </Button>
          <button
            className="md:hidden text-zinc-600 dark:text-zinc-400"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </nav>
      
      {mobileMenuOpen && (
        <div className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 md:hidden">
          <div className="mx-auto space-y-3 px-4 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'block py-2 text-sm font-medium',
                  location.pathname.startsWith(item.href)
                    ? 'text-zinc-900 dark:text-zinc-100'
                    : 'text-zinc-600 dark:text-zinc-400'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Button className="w-full bg-gradient-to-r from-blue-500 to-violet-500 text-white">
              npm install @oxog/json
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
