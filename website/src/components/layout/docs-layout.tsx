import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Book,
  Code,
  Puzzle,
  Zap,
  ShieldCheck,
  Terminal,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarItems = [
  {
    title: 'Getting Started',
    items: [
      { label: 'Introduction', href: '/docs' },
      { label: 'Installation', href: '/docs/installation' },
      { label: 'Quick Start', href: '/docs/quick-start' },
    ],
  },
  {
    title: 'Core API',
    items: [
      { label: 'parse()', href: '/docs/api/parse' },
      { label: 'stringify()', href: '/docs/api/stringify' },
      { label: 'get()/set()', href: '/docs/api/query' },
    ],
  },
  {
    title: 'Plugins',
    items: [
      { label: 'Overview', href: '/docs/plugins' },
      { label: 'JSONPath', href: '/docs/plugins/path' },
      { label: 'Transform', href: '/docs/plugins/transform' },
      { label: 'Schema', href: '/docs/plugins/schema' },
      { label: 'All Plugins', href: '/docs/plugins/all' },
    ],
  },
  {
    title: 'Advanced',
    items: [
      { label: 'CLI Tool', href: '/docs/cli' },
      { label: 'Streaming', href: '/docs/streaming' },
      { label: 'TypeScript', href: '/docs/typescript' },
    ],
  },
];

export function DocsLayout() {
  const location = useLocation();

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <aside className="hidden lg:block w-64 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 overflow-y-auto sticky top-16 h-[calc(100vh-4rem)]">
        <div className="p-4 space-y-6">
          {sidebarItems.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-xs uppercase text-zinc-500 dark:text-zinc-400 mb-2 px-2">
                {section.title}
              </h3>
              <nav className="space-y-1">
                {section.items.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      'flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors',
                      location.pathname === item.href
                        ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100'
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>
      </aside>
      
      <main className="flex-1 max-w-4xl">
        <article className="prose prose-zinc dark:prose-invert max-w-none p-8">
          <Outlet />
        </article>
      </main>
      
      <aside className="hidden xl:block w-48 p-4 sticky top-16 h-[calc(100vh-4rem)]">
        <OnThisPage />
      </aside>
    </div>
  );
}

function OnThisPage() {
  return (
    <div className="text-sm">
      <h4 className="font-semibold text-zinc-500 dark:text-zinc-400 mb-2">On this page</h4>
      <nav className="space-y-1 text-zinc-600 dark:text-zinc-400">
        <a href="#" className="block hover:text-zinc-900 dark:hover:text-zinc-100">
          Overview
        </a>
      </nav>
    </div>
  );
}
