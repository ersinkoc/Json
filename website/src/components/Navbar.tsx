import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FileJson, Github, Package, Menu, X } from 'lucide-react'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/docs', label: 'Docs' },
  { to: '/playground', label: 'Playground' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  return (
    <nav className="sticky top-0 z-50 border-b border-white/6 bg-[#09090b]/85 backdrop-blur-2xl">
      <div className="container-custom flex items-center justify-between h-[4.25rem]">
        <Link to="/" className="flex items-center gap-3 font-semibold text-lg tracking-tight">
          <FileJson size={22} className="text-cyan-400" />
          <span className="text-white">@oxog/<span className="gradient-text">json</span></span>
        </Link>

        <div className="hidden md:flex items-center gap-1.5">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-2 text-sm rounded-lg transition-all ${
                pathname === link.to
                  ? 'text-white bg-white/10 font-medium'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="w-px h-5 bg-white/10 mx-3" />
          <a
            href="https://www.npmjs.com/package/@oxog/json"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-sm text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-all flex items-center gap-1.5"
          >
            <Package size={14} /> npm
          </a>
          <a
            href="https://github.com/ersinkoc/json"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/6 border border-white/10 text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition-all ml-1"
          >
            <Github size={15} /> GitHub
          </a>
        </div>

        <button className="md:hidden text-zinc-400 hover:text-white transition-colors p-2" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/6 bg-[#09090b]/98 backdrop-blur-2xl px-5 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={`block text-sm py-3 px-4 rounded-lg transition-colors ${
                pathname === link.to ? 'text-white bg-white/8 font-medium' : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <a
            href="https://github.com/ersinkoc/json"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white py-3 px-4 rounded-lg hover:bg-white/5 transition-colors"
          >
            <Github size={14} /> GitHub
          </a>
        </div>
      )}
    </nav>
  )
}
