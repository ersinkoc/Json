import React from 'react';
import { CodeBlock } from '@/components/code/code-block';

const examples = [
  {
    title: 'Basic Parse & Stringify',
    category: 'Core',
    description: 'Parse JSON strings and stringify objects.',
    code: `import { json } from '@oxog/json';

// Parse JSON
const data = json.parse('{"name": "Alice", "age": 30}');

// Safe parse (no throw)
const result = json.safeParse('{"valid": true}');
if (result.ok) {
  console.log(result.value);
}

// Stringify with options
const str = json.stringify(data, { indent: 2 });`,
  },
  {
    title: 'Deep Property Access',
    category: 'Query',
    description: 'Get, set, and check nested properties.',
    code: `import { json } from '@oxog/json';

const data = {
  users: [{ name: 'Alice', age: 30 }]
};

// Get nested values
json.get(data, 'users[0].name');     // 'Alice'
json.get(data, 'users[0].age');      // 30
json.get(data, 'users[1].name', 'Unknown'); // 'Unknown'

// Immutable set
const updated = json.set(data, 'users[0].age', 31);

// Check existence
json.has(data, 'users[0].name');     // true

// List all paths
json.paths(data);
// ['users', 'users[0]', 'users[0].name', 'users[0].age']`,
  },
  {
    title: 'JSONPath Queries',
    category: 'Query',
    description: 'Query complex structures with expressions.',
    code: `import { json, pathPlugin } from '@oxog/json';

json.use(pathPlugin);

const data = {
  store: {
    books: [
      { title: 'Book A', price: 10 },
      { title: 'Book B', price: 25 }
    ]
  }
};

// Get all titles
json.query(data, '$.store.books[*].title');
// ['Book A', 'Book B']

// Filter by price
json.query(data, '$.store.books[?(@.price < 15)]');
// [{ title: 'Book A', price: 10 }]`,
  },
  {
    title: 'Transform Operations',
    category: 'Transform',
    description: 'Merge, flatten, and manipulate objects.',
    code: `import { json, transformPlugin } from '@oxog/json';

json.use(transformPlugin);

// Deep merge
const merged = json.merge(
  { a: { b: 1 } },
  { a: { c: 2 } }
);
// { a: { b: 1, c: 2 } }

// Flatten
const flat = json.flatten({ a: { b: { c: 1 } } });
// { 'a.b.c': 1 }

// Pick/omit keys
json.pick({ a: 1, b: 2, c: 3 }, ['a', 'b']);
// { a: 1, b: 2 }

json.omit({ a: 1, b: 2, c: 3 }, ['c']);
// { a: 1, b: 2 }`,
  },
  {
    title: 'Schema Validation',
    category: 'Validation',
    description: 'Validate data against JSON Schema.',
    code: `import { json, schemaPlugin } from '@oxog/json';

json.use(schemaPlugin);

const schema = {
  type: 'object',
  required: ['name', 'email'],
  properties: {
    name: { type: 'string' },
    email: { type: 'string', format: 'email' }
  }
};

const result = json.validate({ name: 'Alice', email: 'a@b.com' }, schema);
// { valid: true }

const compiled = json.compile(schema);
compiled({ name: 'Bob', email: 'bob@c.com' });
// { valid: true, value: ... }`,
  },
  {
    title: 'Diff & Patch',
    category: 'Diff',
    description: 'Generate and apply JSON patches.',
    code: `import { json, diffPlugin, patchPlugin } from '@oxog/json';

json.use(diffPlugin, patchPlugin);

const before = { name: 'Alice', age: 30 };
const after = { name: 'Alice', age: 31, email: 'a@b.com' };

const diff = json.diff(before, after);
// [
//   { op: 'replace', path: '/age', value: 31 },
//   { op: 'add', path: '/email', value: 'a@b.com' }
// ]

const patched = json.patch(before, diff);`,
  },
  {
    title: 'JSON Repair',
    category: 'Repair',
    description: 'Fix malformed JSON automatically.',
    code: `import { json, repairPlugin } from '@oxog/json';

json.use(repairPlugin);

const broken = '{name: "test", items: [1, 2, 3,],}';
const fixed = json.repair(broken);
// '{"name":"test","items":[1,2,3]}'

const parsed = json.parse(fixed);`,
  },
  {
    title: 'JSON5 Support',
    category: 'JSON5',
    description: 'Parse JSON5 format.',
    code: `import { json, json5Plugin } from '@oxog/json';

json.use(json5Plugin);

const json5 = \`{
  // Comments are allowed
  name: 'Unquoted keys',
  items: [1, 2, 3,],  // Trailing comma
}\`;

const parsed = json.parse5(json5);`,
  },
];

const categories = ['All', 'Core', 'Query', 'Transform', 'Validation', 'Diff', 'Repair', 'JSON5'];

export default function ExamplesPage() {
  const [category, setCategory] = React.useState('All');

  const filtered = category === 'All' 
    ? examples 
    : examples.filter(e => e.category === category);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Examples</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Learn @oxog/json with practical examples.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              category === cat
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {filtered.map((example) => (
          <div key={example.title} className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">{example.title}</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{example.description}</p>
            </div>
            <CodeBlock code={example.code} language="typescript" />
          </div>
        ))}
      </div>
    </div>
  );
}
