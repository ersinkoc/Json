import { Link } from 'react-router-dom'
import { Github, Package } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-white/6 py-16 sm:py-20">
      <div className="container-custom">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-12 mb-14">
          <div className="col-span-2 sm:col-span-1">
            <span className="text-white font-semibold text-sm">@oxog/json</span>
            <p className="text-zinc-500 text-xs mt-3 leading-relaxed">
              Zero-dependency JSON toolkit for TypeScript.
            </p>
          </div>
          <div>
            <h4 className="text-zinc-400 font-medium text-xs uppercase tracking-wider mb-4">Pages</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">Home</Link></li>
              <li><Link to="/docs" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">Docs</Link></li>
              <li><Link to="/playground" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">Playground</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-zinc-400 font-medium text-xs uppercase tracking-wider mb-4">Links</h4>
            <ul className="space-y-3">
              <li><a href="https://github.com/ersinkoc/json" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors flex items-center gap-2"><Github size={13} /> GitHub</a></li>
              <li><a href="https://www.npmjs.com/package/@oxog/json" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors flex items-center gap-2"><Package size={13} /> npm</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-zinc-400 font-medium text-xs uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><span className="text-zinc-500 text-sm">MIT License</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/6 pt-8 text-center text-xs text-zinc-600">
          &copy; {new Date().getFullYear()} @oxog/json — Built with React, Tailwind CSS &amp; Vite
        </div>
      </div>
    </footer>
  )
}
