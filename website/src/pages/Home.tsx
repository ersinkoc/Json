import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LazyCodeBlock } from '@/components/LazyCodeBlock'
import {
  Package,
  Zap,
  Shield,
  Layers,
  GitBranch,
  Terminal,
  Copy,
  Check,
  ExternalLink,
  Puzzle,
  Wrench,
  ChevronRight,
  ArrowRight,
  BookOpen,
  Play,
} from 'lucide-react'

/* ─── Copy Button ─── */

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
      className="p-2 rounded-md hover:bg-white/10 transition-colors text-zinc-500 hover:text-zinc-200"
    >
      {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
    </button>
  )
}

/* ─── Hero ─── */

function Hero() {
  const cmd = 'npm install @oxog/json'
  return (
    <section className="relative overflow-hidden pt-24 sm:pt-36 pb-28 sm:pb-36">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-cyan-500/[0.07] rounded-full blur-[140px]" />
        <div className="absolute top-[5%] left-[15%] w-[500px] h-[500px] bg-violet-500/[0.05] rounded-full blur-[120px]" />
      </div>

      <div className="container-custom relative flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-medium mb-10 animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          v1.0 — Production Ready
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-8xl font-extrabold tracking-tight leading-[1.05] mb-8 animate-slide-up">
          <span className="text-white">JSON </span>
          <span className="gradient-text">Swiss Army Knife</span>
          <br />
          <span className="text-zinc-500 text-2xl sm:text-3xl lg:text-4xl font-medium mt-4 block">for TypeScript</span>
        </h1>

        <p className="max-w-2xl text-base sm:text-lg text-zinc-400 mb-12 animate-fade-in leading-relaxed" style={{ animationDelay: '0.2s' }}>
          Parse, query, transform, diff, validate, stream, and repair — all with{' '}
          <strong className="text-white font-semibold">zero dependencies</strong> and a micro-kernel plugin architecture.
        </p>

        <div className="flex items-center gap-4 pl-6 pr-4 py-4 mb-12 rounded-xl bg-white/[0.06] border border-white/10 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <Terminal size={16} className="text-zinc-600 shrink-0" />
          <code className="text-sm text-cyan-300 font-medium select-all">{cmd}</code>
          <CopyBtn text={cmd} />
        </div>

        <div className="flex flex-wrap gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <Link
            to="/docs"
            className="group inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 hover:brightness-110 transition-all"
          >
            <BookOpen size={16} /> Documentation <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            to="/playground"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-white/6 border border-white/10 text-zinc-300 font-semibold text-sm hover:bg-white/10 hover:border-white/15 hover:text-white transition-all"
          >
            <Play size={16} /> Playground
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ─── Features ─── */

const features = [
  { icon: Zap, title: 'Zero Dependencies', desc: 'Lightweight and fast. No external packages, no supply-chain worries.', color: 'text-amber-400', bg: 'bg-amber-400/10' },
  { icon: Shield, title: '100% Type-Safe', desc: 'Written entirely in TypeScript with full inference and strict types.', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { icon: Layers, title: 'Plugin Architecture', desc: 'Micro-kernel design — load only what you need with tree-shakable plugins.', color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
  { icon: GitBranch, title: 'Diff & Patch', desc: 'RFC 6902 compliant diff and patch operations out of the box.', color: 'text-violet-400', bg: 'bg-violet-400/10' },
  { icon: Wrench, title: 'JSON Repair', desc: 'Automatically fix malformed JSON from LLM outputs and user input.', color: 'text-rose-400', bg: 'bg-rose-400/10' },
  { icon: Puzzle, title: 'Presets', desc: 'Use full, minimal, or validation presets — or compose your own plugin stack.', color: 'text-blue-400', bg: 'bg-blue-400/10' },
]

function Features() {
  return (
    <section id="features" className="py-28 sm:py-32">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-5 text-white">
            Everything you need for <span className="gradient-text">JSON</span>
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto text-base leading-relaxed">
            A complete toolkit that replaces dozens of micro-libraries with one cohesive, well-tested package.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title} className="p-8 rounded-xl bg-white/[0.04] border border-white/8 hover:border-white/15 transition-all duration-300 hover:bg-white/[0.06]">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${f.bg} mb-6`}>
                <f.icon size={22} className={f.color} />
              </div>
              <h3 className="font-semibold text-white text-base mb-3">{f.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Plugins ─── */

const plugins = [
  { name: 'pathPlugin', desc: 'JSONPath queries', example: "json.query(data, '$.store.books[*].title')" },
  { name: 'transformPlugin', desc: 'merge, flatten, pick, omit, mapValues', example: 'json.merge(a, b)' },
  { name: 'diffPlugin', desc: 'RFC 6902 diff', example: 'json.diff(before, after)' },
  { name: 'patchPlugin', desc: 'Apply JSON patches', example: 'json.patch(obj, ops)' },
  { name: 'schemaPlugin', desc: 'JSON Schema validation', example: 'json.validate(data, schema)' },
  { name: 'streamPlugin', desc: 'Streaming JSON parsing', example: 'json.stream.parse(readable)' },
  { name: 'repairPlugin', desc: 'Fix broken JSON', example: 'json.repair(malformed)' },
  { name: 'json5Plugin', desc: 'JSON5 support', example: 'json.parse5(text)' },
  { name: 'typePlugin', desc: 'Infer TS interfaces', example: "json.infer(data, { name: 'User' })" },
  { name: 'immutablePlugin', desc: 'Immutable operations', example: 'json.freeze(obj)' },
]

function Plugins() {
  return (
    <section className="py-28 sm:py-32 bg-white/[0.015]">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-5 text-white">
            <span className="gradient-text">10 Plugins</span>, One Ecosystem
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto text-base leading-relaxed">
            Load only what you need. Every plugin is tree-shakable and extends the{' '}
            <code className="text-cyan-400 font-mono text-sm bg-cyan-400/10 px-2 py-1 rounded-md">json</code>{' '}
            instance.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {plugins.map((p) => (
            <div key={p.name} className="group px-7 py-6 rounded-xl bg-white/[0.04] border border-white/8 hover:border-white/15 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <ChevronRight size={14} className="text-cyan-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                <span className="font-mono text-sm font-semibold text-white">{p.name}</span>
              </div>
              <p className="text-sm text-zinc-400 pl-[29px] mb-2">{p.desc}</p>
              <code className="text-xs text-cyan-300/80 pl-[29px] block truncate font-mono">{p.example}</code>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── Code Examples ─── */

const examples = [
  {
    title: 'Parse & Stringify',
    code: `import { json } from '@oxog/json';

// Safe parsing with result type
const result = json.safeParse('{"name": "world"}');
if (result.ok) {
  console.log(result.value);
}

// Pretty print with sorted keys
json.stringify(data, { indent: 2, sortKeys: true });`,
  },
  {
    title: 'Deep Access',
    code: `import { json } from '@oxog/json';

const data = { users: [{ name: 'Alice', age: 30 }] };

json.get(data, 'users.0.name');       // "Alice"
json.set(data, 'users.0.role', 'admin');
json.has(data, 'users.0.email');      // false
json.remove(data, 'users.0.age');`,
  },
  {
    title: 'Plugins',
    code: `import { json } from '@oxog/json';
import { diffPlugin, schemaPlugin } from '@oxog/json/plugins';

json.use(diffPlugin, schemaPlugin);

const changes = json.diff(
  { name: 'Alice', age: 30 },
  { name: 'Alice', age: 31, role: 'admin' }
);

const valid = json.validate(data, {
  type: 'object',
  properties: { name: { type: 'string' } },
  required: ['name']
});`,
  },
]

function Examples() {
  const [tab, setTab] = useState(0)
  return (
    <section className="py-28 sm:py-32">
      <div className="container-custom">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-5 text-white">See it in action</h2>
          <p className="text-zinc-400 max-w-xl mx-auto text-base leading-relaxed">
            Clean, intuitive API that feels natural from the first line.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="flex gap-1.5 mb-8 p-2 rounded-xl bg-white/[0.04] border border-white/8 w-fit">
            {examples.map((ex, i) => (
              <button
                key={ex.title}
                onClick={() => setTab(i)}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  tab === i ? 'bg-white/10 text-white shadow-sm border border-white/10' : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                }`}
              >
                {ex.title}
              </button>
            ))}
          </div>

          <LazyCodeBlock
            code={examples[tab].code}
            language="typescript"
            theme="tokyo-night"
            lineNumbers
            copyButton
            showLanguageBadge
          />
        </div>
      </div>
    </section>
  )
}

/* ─── CTA ─── */

function CTA() {
  return (
    <section className="relative overflow-hidden py-32 sm:py-40">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-cyan-500/[0.06] rounded-full blur-[140px]" />
      </div>
      <div className="container-custom relative text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-5 text-white">
          Ready to simplify your <span className="gradient-text">JSON workflow</span>?
        </h2>
        <p className="text-zinc-400 max-w-lg mx-auto mb-12 text-base leading-relaxed">
          Install in seconds. Replace a dozen packages with one.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <a
            href="https://www.npmjs.com/package/@oxog/json"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 hover:brightness-110 transition-all"
          >
            <Package size={16} /> Install from npm
          </a>
          <a
            href="https://github.com/ersinkoc/json"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-white/6 border border-white/10 text-zinc-300 font-semibold text-sm hover:bg-white/10 hover:border-white/15 hover:text-white transition-all"
          >
            <ExternalLink size={16} /> View on GitHub
          </a>
        </div>
      </div>
    </section>
  )
}

/* ─── Page ─── */

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <Plugins />
      <Examples />
      <CTA />
    </>
  )
}
