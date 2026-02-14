import React from 'react';
import { CodeBlock } from '@/components/code/code-block';

const plugins = [
  {
    name: 'Core',
    description: 'Always loaded. Parse, stringify, and query.',
    code: `import { json } from '@oxog/json';

// Core methods always available
json.parse('{"a": 1}');
json.stringify({ a: 1 });
json.get(data, 'path.to.value');`,
  },
  {
    name: 'JSONPath',
    description: 'Query complex structures with expressions.',
    code: `import { pathPlugin } from '@oxog/json/plugins';
json.use(pathPlugin);

// Query with expressions
json.query(data, '$.store.books[*].title');
json.query(data, '$.users[?(@.age > 18)]');`,
  },
  {
    name: 'Transform',
    description: 'Merge, flatten, pick, omit, sort.',
    code: `import { transformPlugin } from '@oxog/json/plugins';
json.use(transformPlugin);

json.merge({ a: 1 }, { b: 2 });
json.flatten({ a: { b: { c: 1 } } });
json.pick(obj, ['name', 'email']);`,
  },
  {
    name: 'Schema',
    description: 'JSON Schema validation (draft-07).',
    code: `import { schemaPlugin } from '@oxog/json/plugins';
json.use(schemaPlugin);

const result = json.validate(data, schema);
// { valid: true } or { valid: false, errors: [...] }`,
  },
  {
    name: 'Diff & Patch',
    description: 'RFC 6902 JSON Patch.',
    code: `import { diffPlugin, patchPlugin } from '@oxog/json/plugins';
json.use(diffPlugin, patchPlugin);

const diff = json.diff(before, after);
const patched = json.patch(obj, operations);`,
  },
  {
    name: 'Repair',
    description: 'Fix broken JSON automatically.',
    code: `import { repairPlugin } from '@oxog/json/plugins';
json.use(repairPlugin);

const fixed = json.repair('{name: "test",}');
// '{"name":"test"}'`,
  },
];

export function PluginsSection() {
  const [activePlugin, setActivePlugin] = React.useState(0);

  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
            Powerful Plugins
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Load only what you need. Tree-shake the rest.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-2">
            {plugins.map((plugin, i) => (
              <button
                key={plugin.name}
                onClick={() => setActivePlugin(i)}
                className={`w-full text-left p-4 rounded-xl transition-all ${
                  activePlugin === i
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                <div className="font-semibold mb-1">{plugin.name}</div>
                <div className={`text-sm ${
                  activePlugin === i
                    ? 'text-zinc-300 dark:text-zinc-700'
                    : 'text-zinc-500 dark:text-zinc-500'
                }`}>
                  {plugin.description}
                </div>
              </button>
            ))}
          </div>

          <div className="sticky top-24">
            <CodeBlock
              code={plugins[activePlugin].code}
              language="typescript"
              title="example.ts"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

const stats = [
  { value: '0', label: 'Dependencies' },
  { value: '12+', label: 'Plugins' },
  { value: '263', label: 'Tests' },
  { value: '~35KB', label: 'Bundle Size' },
];

export function StatsSection() {
  return (
    <section className="py-16 bg-gradient-to-r from-zinc-900 to-zinc-800 dark:from-zinc-950 dark:to-zinc-900">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-zinc-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CTASection() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
            Install @oxog/json and start building in seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigator.clipboard.writeText('npm install @oxog/json')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium hover:scale-105 transition-transform"
            >
              npm install @oxog/json
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
