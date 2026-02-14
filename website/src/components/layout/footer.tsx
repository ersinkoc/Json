import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Heart, ExternalLink } from 'lucide-react';

const footerLinks = {
  Documentation: [
    { label: 'Getting Started', href: '/docs' },
    { label: 'API Reference', href: '/docs/api' },
    { label: 'Examples', href: '/examples' },
    { label: 'CLI Tool', href: '/docs/cli' },
  ],
  Plugins: [
    { label: 'JSONPath', href: '/docs/plugins/path' },
    { label: 'Transform', href: '/docs/plugins/transform' },
    { label: 'Schema', href: '/docs/plugins/schema' },
    { label: 'All Plugins', href: '/docs/plugins' },
  ],
  Resources: [
    { label: 'GitHub', href: 'https://github.com/ersinkoc/json', external: true },
    { label: 'npm', href: 'https://npmjs.com/package/@oxog/json', external: true },
    { label: 'Playground', href: '/playground' },
    { label: 'Changelog', href: 'https://github.com/ersinkoc/json/blob/main/CHANGELOG.md', external: true },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 text-sm font-bold text-white">
                {}
              </div>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                @oxog/json
              </span>
            </Link>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              Zero-dependency JSON toolkit for TypeScript.
            </p>
            <div className="flex gap-3">
              <a
                href="https://github.com/ersinkoc/json"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors text-zinc-600 dark:text-zinc-400"
              >
                <Github className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com/ersinkoc"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors text-zinc-600 dark:text-zinc-400"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>
          
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="mb-4 font-semibold text-zinc-900 dark:text-zinc-100">{title}</h4>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a 
                        href={link.href} 
                        className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors inline-flex items-center gap-1"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link.label}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <Link 
                        to={link.href}
                        className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-zinc-200 dark:border-zinc-800 pt-8 md:flex-row">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Made with <Heart className="inline h-4 w-4 text-red-500" /> by Ersin KOÇ
          </p>
          <p className="text-sm text-zinc-500">
            MIT License © {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
