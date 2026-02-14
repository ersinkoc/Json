import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Github, Play, Check, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CodeBlock } from '@/components/code/code-block';

const heroCode = `import { json } from '@oxog/json';

// Parse JSON safely
const data = json.parse('{"name": "Alice", "age": 30}');

// Deep property access with dot notation
json.get(data, 'name');              // 'Alice'
json.get(data, 'users[0].email');    // Deep array access

// Immutable updates
const updated = json.set(data, 'age', 31);

// Safe parse - never throws
const result = json.safeParse('{"valid": true}');
if (result.ok) {
  console.log(result.value);
}`;

const quickStartCode = `// Install
npm install @oxog/json

// Usage
import { json } from '@oxog/json';

// Core API (always available)
json.parse(text, options?)
json.stringify(value, options?)
json.get(obj, path, fallback?)
json.set(obj, path, value)
json.has(obj, path)
json.remove(obj, path)`;

const pluginsCode = `import { 
  pathPlugin,
  transformPlugin,
  schemaPlugin,
  diffPlugin,
  repairPlugin 
} from '@oxog/json/plugins';

// Load only what you need
json.use(pathPlugin, transformPlugin);

// JSONPath queries
json.query(data, '$.store.books[*].title');

// Transform operations
json.merge({ a: 1 }, { b: 2 });
json.flatten({ a: { b: 1 } });

// Schema validation
json.validate(data, schema);

// Diff & Patch
const diff = json.diff(before, after);`;

const coreFeatures = [
  { icon: '⚡', title: 'Zero Dependencies', description: 'Everything implemented from scratch.' },
  { icon: '🔌', title: 'Plugin Architecture', description: 'Load only what you need.' },
  { icon: '🔒', title: 'TypeScript First', description: 'Full type safety.' },
  { icon: '🚀', title: 'Universal Runtime', description: 'Node.js, browsers, edge.' },
];

const plugins = [
  { name: 'JSONPath', description: 'Query with JSONPath', icon: '🔍' },
  { name: 'Transform', description: 'Merge, flatten, pick', icon: '🔄' },
  { name: 'Schema', description: 'JSON Schema validation', icon: '✅' },
  { name: 'Diff/Patch', description: 'RFC 6902 JSON Patch', icon: '📝' },
  { name: 'Repair', description: 'Fix broken JSON', icon: '🔧' },
  { name: 'JSON5', description: 'JSON5 support', icon: '📄' },
  { name: 'Stream', description: 'Streaming JSON', icon: '🌊' },
  { name: 'Type', description: 'TypeScript inference', icon: '💎' },
];

const stats = [
  { value: '0', label: 'Dependencies' },
  { value: '10+', label: 'Plugins' },
  { value: '373', label: 'Tests' },
  { value: '35KB', label: 'Bundle' },
];

const apiMethods = [
  { name: 'parse', desc: 'Parse JSON string to value' },
  { name: 'safeParse', desc: 'Parse without throwing' },
  { name: 'stringify', desc: 'Serialize to JSON string' },
  { name: 'get', desc: 'Deep property access' },
  { name: 'set', desc: 'Immutable deep set' },
  { name: 'has', desc: 'Check path exists' },
  { name: 'remove', desc: 'Remove at path' },
  { name: 'paths', desc: 'List all paths' },
];

const cliCode = `# Format JSON
npx @oxog/json format data.json

# Get value by path
npx @oxog/json get data.json "users[0].name"

# Diff two files
npx @oxog/json diff before.json after.json

# Validate against schema
npx @oxog/json validate data.json --schema schema.json

# Repair broken JSON
npx @oxog/json repair broken.json -o fixed.json`;

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-zinc-950 text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/50 via-zinc-950 to-violet-950/50" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      
      <div className="relative mx-auto max-w-7xl px-4 py-20 md:py-32">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            v1.0.0 Released
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            JSON Toolkit for<br />
            <span className="text-gradient">Modern TypeScript</span>
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-8">
            Parse, query, transform, validate, diff, stream, and repair JSON.
            Zero dependencies. Plugin architecture. Full TypeScript support.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/docs">
              <Button size="lg" className="gap-2 bg-gradient-to-r from-blue-500 to-violet-500 text-white hover:from-blue-600 hover:to-violet-600">
                Get Started <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/playground">
              <Button size="lg" variant="outline" className="gap-2 border-zinc-700 text-white hover:bg-zinc-800">
                <Play className="w-4 h-4" /> Playground
              </Button>
            </Link>
            <a href="https://github.com/ersinkoc/json" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="ghost" className="gap-2 text-zinc-400 hover:text-white">
                <Github className="w-4 h-4" /> GitHub
              </Button>
            </a>
          </div>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <CodeBlock code={heroCode} language="typescript" title="index.ts" />
        </div>
      </div>
    </section>
  );
}

export function FeaturesSection() {
  return (
    <section className="py-20 bg-zinc-100 dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            A comprehensive JSON toolkit with a tiny footprint.
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {coreFeatures.map((f) => (
            <div key={f.title} className="p-6 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-2">{f.title}</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function QuickStartSection() {
  return (
    <section className="py-20 bg-white dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-6">
              Quick Start
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
              Get up and running in seconds. Core methods are always available.
            </p>
            <ul className="space-y-3 mb-8">
              {['Parse with reviver, max depth, max length', 'Stringify with indent, replacer, circular', 'Deep property access with dot notation', 'Immutable updates with structural sharing'].map((item) => (
                <li key={item} className="flex items-start gap-2 text-zinc-700 dark:text-zinc-300">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link to="/docs">
              <Button className="gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900">
                Read the Docs <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <CodeBlock code={quickStartCode} language="typescript" title="Terminal" />
        </div>
      </div>
    </section>
  );
}

export function StatsSection() {
  return (
    <section className="py-16 bg-zinc-900 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-zinc-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PluginsSection() {
  return (
    <section className="py-20 bg-zinc-100 dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
            Powerful Plugins
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Load only what you need. Each plugin adds specific functionality.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {plugins.map((p) => (
            <div key={p.name} className="p-4 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-blue-500 transition-colors">
              <span className="text-2xl">{p.icon}</span>
              <h3 className="font-semibold text-zinc-900 dark:text-white mt-2">{p.name}</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{p.description}</p>
            </div>
          ))}
        </div>

        <CodeBlock code={pluginsCode} language="typescript" title="example.ts" />
      </div>
    </section>
  );
}

export function ApiSection() {
  return (
    <section className="py-20 bg-white dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-4">
            Core API Reference
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            These methods are always available without loading any plugins.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-700">
                <th className="text-left py-3 px-4 font-semibold text-zinc-900 dark:text-white">Method</th>
                <th className="text-left py-3 px-4 font-semibold text-zinc-900 dark:text-white">Description</th>
              </tr>
            </thead>
            <tbody>
              {apiMethods.map((m) => (
                <tr key={m.name} className="border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900">
                  <td className="py-3 px-4">
                    <code className="text-blue-500 font-mono">{m.name}()</code>
                  </td>
                  <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">{m.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

export function CLISection() {
  return (
    <section className="py-20 bg-zinc-100 dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <CodeBlock code={cliCode} language="bash" title="Terminal" />
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Terminal className="w-6 h-6 text-zinc-600 dark:text-zinc-400" />
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">CLI Tool</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-white mb-6">
              Powerful Command Line
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
              Everything from the library is available as CLI commands.
            </p>
            <ul className="space-y-2 text-zinc-600 dark:text-zinc-400">
              <li>• Format, minify, and validate JSON</li>
              <li>• Query with JSONPath expressions</li>
              <li>• Generate and apply patches</li>
              <li>• Repair malformed JSON</li>
              <li>• Generate TypeScript types</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-violet-600">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-lg text-white/80 mb-8">
          Install @oxog/json and start building in seconds.
        </p>
        <button
          onClick={() => navigator.clipboard.writeText('npm install @oxog/json')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-zinc-900 font-medium hover:bg-zinc-100 transition-colors"
        >
          npm install @oxog/json
        </button>
      </div>
    </section>
  );
}
