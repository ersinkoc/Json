import React from 'react';
import { Link } from 'react-router-dom';
import { CodeBlock } from '@/components/code/code-block';

const installCode = `npm install @oxog/json

# or
pnpm add @oxog/json
yarn add @oxog/json
bun add @oxog/json`;

const basicCode = `import { json } from '@oxog/json';

// Parse JSON
const data = json.parse('{"name": "Alice", "age": 30}');

// Safe parse (no throw)
const result = json.safeParse('{"valid": true}');
if (result.ok) {
  console.log(result.value);
} else {
  console.log(result.error);
}

// Stringify with options
const str = json.stringify(data, { indent: 2 });`;

const queryCode = `import { json } from '@oxog/json';

const data = {
  users: [
    { name: 'Alice', age: 30 },
    { name: 'Bob', age: 25 }
  ]
};

// Deep get
json.get(data, 'users[0].name');           // 'Alice'
json.get(data, 'users[1].age');            // 25
json.get(data, 'users[5].name', 'Unknown'); // 'Unknown'

// Deep set (immutable)
const updated = json.set(data, 'users[0].age', 31);

// Check existence
json.has(data, 'users[0].name');           // true

// Remove
const removed = json.remove(data, 'users[1]');

// List all paths
json.paths(data);`;

const pluginsCode = `import { json } from '@oxog/json';
import {
  pathPlugin,
  transformPlugin,
  schemaPlugin,
  diffPlugin,
  repairPlugin
} from '@oxog/json/plugins';

// Load individual plugins
json.use(pathPlugin, transformPlugin);

// Or use presets
import { preset } from '@oxog/json/plugins';
json.use(preset.full);      // All plugins
json.use(preset.minimal);   // transform + repair`;

const plugins = [
  { name: 'pathPlugin', desc: 'JSONPath queries' },
  { name: 'transformPlugin', desc: 'Merge, flatten, pick, omit' },
  { name: 'schemaPlugin', desc: 'JSON Schema validation' },
  { name: 'diffPlugin', desc: 'JSON diff' },
  { name: 'patchPlugin', desc: 'JSON patch' },
  { name: 'repairPlugin', desc: 'Fix broken JSON' },
  { name: 'json5Plugin', desc: 'JSON5 support' },
  { name: 'typePlugin', desc: 'TypeScript inference' },
  { name: 'streamPlugin', desc: 'Streaming JSON' },
  { name: 'immutablePlugin', desc: 'Immutable operations' },
];

export default function DocsPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Documentation</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
          @oxog/json is a zero-dependency JSON toolkit. Parse, query, transform,
          validate, diff, and repair JSON with a single import.
        </p>
      </div>

      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-4">Installation</h2>
        <CodeBlock code={installCode} language="bash" title="Terminal" />
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-4">Basic Usage</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          Core methods are always available without loading any plugins:
        </p>
        <CodeBlock code={basicCode} language="typescript" title="basic.ts" />
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-4">Query API</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          Access and modify nested data with dot and bracket notation:
        </p>
        <CodeBlock code={queryCode} language="typescript" title="query.ts" />
        <div className="mt-4 p-4 rounded bg-zinc-100 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700">
          <p className="text-sm dark:text-zinc-300 mb-2">
            💡 <strong className="dark:text-zinc-200">Editor theme sync</strong> The code examples adapt to your editor's theme (light/dark).
          </p>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-4">Plugins</h2>
        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
          Load additional functionality with plugins:
        </p>
        <CodeBlock code={pluginsCode} language="typescript" title="plugins.ts" />
        
        <div className="mt-8 grid sm:grid-cols-2 gap-4">
          {plugins.map((p) => (
            <div key={p.name} className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
              <code className="text-sm font-mono text-blue-500">{p.name}</code>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-4">Core API Reference</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg">
            <thead className="bg-zinc-100 dark:bg-zinc-800">
              <tr>
                <th className="text-left py-2 px-3 font-medium">Method</th>
                <th className="text-left py-2 px-3 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="text-zinc-600 dark:text-zinc-400">
              {[
                ['parse(text, options?)', 'Parse JSON string to value'],
                ['safeParse(text)', 'Parse without throwing'],
                ['stringify(value, options?)', 'Serialize to JSON string'],
                ['get(obj, path, fallback?)', 'Get value at path'],
                ['set(obj, path, value)', 'Set value at path (immutable)'],
                ['has(obj, path)', 'Check if path exists'],
                ['remove(obj, path)', 'Remove value at path'],
                ['paths(obj)', 'List all paths'],
              ].map(([method, desc]) => (
                <tr key={method} className="border-t border-zinc-200 dark:border-zinc-700">
                  <td className="py-2 px-3">
                    <code className="text-blue-500 font-mono text-xs">{method}</code>
                  </td>
                  <td className="py-2 px-3">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Next Steps</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <Link to="/examples" className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-blue-500 transition-colors">
            <h3 className="font-semibold mb-1">Examples</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Browse code examples</p>
          </Link>
          <Link to="/playground" className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-blue-500 transition-colors">
            <h3 className="font-semibold mb-1">Playground</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Try it in browser</p>
          </Link>
          <a href="https://github.com/ersinkoc/json" target="_blank" rel="noopener noreferrer" className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-blue-500 transition-colors">
            <h3 className="font-semibold mb-1">GitHub</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">View source code</p>
          </a>
        </div>
      </section>
    </div>
  );
}
