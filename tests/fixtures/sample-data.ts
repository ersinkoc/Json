/**
 * Sample JSON data fixtures for testing
 */

export const simpleObject = {
  name: 'John Doe',
  age: 30,
  email: 'john@example.com',
};

export const nestedObject = {
  user: {
    profile: {
      name: 'Jane Doe',
      age: 28,
      address: {
        city: 'Istanbul',
        country: 'Turkey',
      },
    },
    settings: {
      theme: 'dark',
      notifications: true,
    },
  },
};

export const arrayData = {
  items: [
    { id: 1, name: 'Item 1', price: 10.99 },
    { id: 2, name: 'Item 2', price: 24.99 },
    { id: 3, name: 'Item 3', price: 5.99 },
  ],
};

export const complexData = {
  users: [
    {
      id: 1,
      name: 'Alice',
      email: 'alice@example.com',
      roles: ['admin', 'user'],
      metadata: {
        created: '2024-01-01T00:00:00Z',
        updated: '2024-01-15T00:00:00Z',
      },
    },
    {
      id: 2,
      name: 'Bob',
      email: 'bob@example.com',
      roles: ['user'],
      metadata: {
        created: '2024-01-02T00:00:00Z',
        updated: '2024-01-10T00:00:00Z',
      },
    },
  ],
  settings: {
    pagination: { limit: 10, offset: 0 },
    filters: { active: true, verified: true },
  },
};

export const jsonStrings = {
  valid: '{"name":"John","age":30}',
  invalid: '{name: "John", age: 30}',
  withComments: '{/* comment */ "name": "John"}',
  withTrailingComma: '{"name":"John","age":30,}',
  withSingleQuotes: "{'name':'John','age':30}",
};

export const largeObject = Object.fromEntries(
  Array.from({ length: 100 }, (_, i) => [`key${i}`, `value${i}`])
);

export const deepNesting = (() => {
  const result: Record<string, unknown> = {};
  let current = result;
  for (let i = 0; i < 50; i++) {
    current[`level${i}`] = {};
    current = current[`level${i}`] as Record<string, unknown>;
  }
  current.value = 'deep';
  return result;
})();

export const specialCharacters = {
  unicode: { message: 'Hello 世界! 🌍' },
  escaped: { text: 'Line 1\nLine 2\tTabbed' },
  quotes: { text: 'He said "Hello"' },
};

export const edgeCases = {
  empty: {},
  emptyArray: [],
  nullValues: { a: null, b: 'value' },
  mixedTypes: {
    string: 'text',
    number: 42,
    float: 3.14,
    boolean: true,
    null: null,
    array: [1, 2, 3],
    object: { nested: true },
  },
  largeNumbers: {
    maxSafe: Number.MAX_SAFE_INTEGER,
    minSafe: Number.MIN_SAFE_INTEGER,
    float: 0.1 + 0.2,
  },
};

export const circularReferenceExample = {
  // Note: Cannot directly create circular reference in JSON
  // This represents what would cause circular reference in JS
  name: 'Circular',
  self: '[Circular]',
};

export const schemaExamples = {
  userSchema: {
    type: 'object',
    properties: {
      name: { type: 'string', minLength: 1 },
      email: { type: 'string', format: 'email' },
      age: { type: 'number', minimum: 0, maximum: 150 },
    },
    required: ['name', 'email'],
  },

  addressSchema: {
    type: 'object',
    properties: {
      street: { type: 'string' },
      city: { type: 'string' },
      zipCode: { type: 'string', pattern: '^\\d{5}$' },
      country: { type: 'string', enum: ['US', 'CA', 'TR'] },
    },
    required: ['street', 'city', 'country'],
  },

  arraySchema: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        name: { type: 'string' },
      },
      required: ['id', 'name'],
    },
    minItems: 1,
    maxItems: 100,
  },
};

export const diffExamples = {
  before: { name: 'John', age: 30, city: 'NYC' },
  after: { name: 'Jane', age: 31, city: 'LA' },

  add: { a: 1 },
  addResult: { a: 1, b: 2 },

  remove: { a: 1, b: 2, c: 3 },
  removeResult: { a: 1, c: 3 },

  replace: { value: 'old' },
  replaceResult: { value: 'new' },
};
