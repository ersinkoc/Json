import { useState } from 'react'
import { LazyCodeBlock } from '@/components/LazyCodeBlock'
import { ChevronRight, BookOpen, Puzzle, Box, AlertTriangle, Rocket } from 'lucide-react'

const THEME = 'tokyo-night'

/* ─── Sidebar Sections ─── */

const sections = [
  { id: 'getting-started', label: 'Getting Started', icon: Rocket },
  { id: 'core-api', label: 'Core API', icon: Box },
  { id: 'deep-access', label: 'Deep Access', icon: ChevronRight },
  { id: 'plugins', label: 'Plugins', icon: Puzzle },
  { id: 'presets', label: 'Presets', icon: BookOpen },
  { id: 'factory', label: 'Factory', icon: Box },
  { id: 'errors', label: 'Errors', icon: AlertTriangle },
]

/* ─── Docs Page ─── */

export default function Docs() {
  const [active, setActive] = useState('getting-started')

  const scrollTo = (id: string) => {
    setActive(id)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="container-custom py-16 sm:py-20">
      <div className="flex gap-12">
        {/* Sidebar */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-28">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Documentation</h3>
            <nav className="space-y-1">
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={`flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                    active === s.id ? 'text-white bg-white/8' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/4'
                  }`}
                >
                  <s.icon size={14} />
                  {s.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Documentation</h1>
          <p className="text-zinc-400 mb-14 text-base leading-relaxed">Complete API reference for @oxog/json</p>

          {/* Getting Started */}
          <section id="getting-started" className="mb-20 scroll-mt-28">
            <h2 className="text-2xl font-bold text-white mb-5 flex items-center gap-3">
              <Rocket size={20} className="text-cyan-400" /> Getting Started
            </h2>
            <p className="text-zinc-400 mb-8 leading-relaxed text-base">
              Install the package and start using it in your project. Zero dependencies, works everywhere.
            </p>
            <LazyCodeBlock code="npm install @oxog/json" language="bash" theme={THEME} copyButton />

            <div className="mt-8">
              <LazyCodeBlock
                code={`import { json } from '@oxog/json';

const data = json.parse('{"hello": "world"}');
console.log(data); // { hello: "world" }`}
                language="typescript"
                theme={THEME}
                lineNumbers
                copyButton
              />
            </div>
          </section>

          {/* Core API */}
          <section id="core-api" className="mb-20 scroll-mt-28">
            <h2 className="text-2xl font-bold text-white mb-5 flex items-center gap-3">
              <Box size={20} className="text-violet-400" /> Core API
            </h2>
            <p className="text-zinc-400 mb-8 leading-relaxed text-base">
              Parse and stringify JSON with enhanced options like depth limits and circular reference handling.
            </p>
            <LazyCodeBlock
              code={`import { json } from '@oxog/json';

// Parse with options
json.parse(text, { reviver?, maxDepth?, maxLength? })

// Safe parse — never throws
const result = json.safeParse(text);
// Returns { ok: true, value } | { ok: false, error }

// Stringify with options
json.stringify(value, {
  indent?: number,    // Pretty print indentation
  replacer?,          // Custom replacer function
  circular?: boolean, // Handle circular references
  sortKeys?: boolean  // Sort object keys alphabetically
})`}
              language="typescript"
              theme={THEME}
              lineNumbers
              copyButton
              showLanguageBadge
            />
          </section>

          {/* Deep Access */}
          <section id="deep-access" className="mb-20 scroll-mt-28">
            <h2 className="text-2xl font-bold text-white mb-5 flex items-center gap-3">
              <ChevronRight size={20} className="text-emerald-400" /> Deep Property Access
            </h2>
            <p className="text-zinc-400 mb-8 leading-relaxed text-base">
              Access deeply nested properties with dot-notation paths. Safe and type-aware.
            </p>
            <LazyCodeBlock
              code={`import { json } from '@oxog/json';

const data = {
  users: [
    { name: 'Alice', settings: { theme: 'dark' } }
  ]
};

json.get(data, 'users.0.name');          // "Alice"
json.get(data, 'users.0.email', 'N/A'); // "N/A" (fallback)
json.set(data, 'users.0.role', 'admin');
json.has(data, 'users.0.settings.theme'); // true
json.remove(data, 'users.0.settings.theme');
json.paths(data);
// ["users", "users.0", "users.0.name", "users.0.settings"]`}
              language="typescript"
              theme={THEME}
              lineNumbers
              copyButton
              showLanguageBadge
            />
          </section>

          {/* Plugins */}
          <section id="plugins" className="mb-20 scroll-mt-28">
            <h2 className="text-2xl font-bold text-white mb-5 flex items-center gap-3">
              <Puzzle size={20} className="text-rose-400" /> Plugins
            </h2>
            <p className="text-zinc-400 mb-8 leading-relaxed text-base">
              Extend functionality with tree-shakable plugins. Each plugin adds new methods to the json instance.
            </p>
            <LazyCodeBlock
              code={`import { json } from '@oxog/json';
import {
  pathPlugin,       // JSONPath: json.query(data, '$.store.books[*].title')
  transformPlugin,  // merge, flatten, unflatten, pick, omit, sortKeys
  diffPlugin,       // json.diff(before, after) → RFC 6902 patch
  patchPlugin,      // json.patch(obj, ops)
  schemaPlugin,     // json.validate(data, schema), json.compile(schema)
  streamPlugin,     // json.stream.parse(readable)
  repairPlugin,     // json.repair(text) → fixed JSON
  json5Plugin,      // json.parse5(text), json.stringify5(value)
  typePlugin,       // json.infer(data, { name }) → TypeScript interface
  immutablePlugin   // json.freeze(obj), json.immutableSet(obj, path, val)
} from '@oxog/json/plugins';

json.use(diffPlugin, schemaPlugin, repairPlugin);

// Now you can use:
const changes = json.diff(objA, objB);
const isValid = json.validate(data, schema);
const fixed = json.repair(brokenJson);`}
              language="typescript"
              theme={THEME}
              lineNumbers
              copyButton
              showLanguageBadge
            />
          </section>

          {/* Presets */}
          <section id="presets" className="mb-20 scroll-mt-28">
            <h2 className="text-2xl font-bold text-white mb-5 flex items-center gap-3">
              <BookOpen size={20} className="text-amber-400" /> Presets
            </h2>
            <p className="text-zinc-400 mb-8 leading-relaxed text-base">
              Pre-configured plugin bundles for common use cases.
            </p>
            <LazyCodeBlock
              code={`import { json } from '@oxog/json';
import { preset } from '@oxog/json/plugins';

json.use(preset.full);        // All plugins
json.use(preset.minimal);     // transform + repair
json.use(preset.validation);  // schema + type`}
              language="typescript"
              theme={THEME}
              lineNumbers
              copyButton
              showLanguageBadge
            />
          </section>

          {/* Factory */}
          <section id="factory" className="mb-20 scroll-mt-28">
            <h2 className="text-2xl font-bold text-white mb-5 flex items-center gap-3">
              <Box size={20} className="text-blue-400" /> Factory
            </h2>
            <p className="text-zinc-400 mb-8 leading-relaxed text-base">
              Create isolated json instances with custom default options.
            </p>
            <LazyCodeBlock
              code={`import { createJson } from '@oxog/json';

const j = createJson({
  parse: { maxDepth: 50 }
});

j.parse(deeplyNestedJson);`}
              language="typescript"
              theme={THEME}
              lineNumbers
              copyButton
              showLanguageBadge
            />
          </section>

          {/* Errors */}
          <section id="errors" className="mb-20 scroll-mt-28">
            <h2 className="text-2xl font-bold text-white mb-5 flex items-center gap-3">
              <AlertTriangle size={20} className="text-orange-400" /> Error Codes
            </h2>
            <p className="text-zinc-400 mb-8 leading-relaxed text-base">
              All errors include a machine-readable code for programmatic error handling.
            </p>
            <div className="overflow-x-auto rounded-xl border border-white/8">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/8 bg-white/[0.03]">
                    <th className="text-left px-6 py-4 text-zinc-400 font-medium">Code</th>
                    <th className="text-left px-6 py-4 text-zinc-400 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['JSON_PARSE_ERROR', 'Invalid JSON input'],
                    ['JSON_PATH_ERROR', 'Invalid property path'],
                    ['JSON_SCHEMA_ERROR', 'Schema validation failed'],
                    ['PLUGIN_ERROR', 'Plugin runtime error'],
                  ].map(([code, desc]) => (
                    <tr key={code} className="border-b border-white/5 last:border-0">
                      <td className="px-6 py-4 font-mono text-cyan-300 text-xs">{code}</td>
                      <td className="px-6 py-4 text-zinc-400">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
