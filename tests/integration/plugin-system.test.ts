import { describe, it, expect, beforeEach } from 'vitest';
import { createJson } from '../../src/kernel';
import { parsePlugin } from '../../src/plugins/core/parse.plugin';
import { stringifyPlugin } from '../../src/plugins/core/stringify.plugin';
import { queryPlugin } from '../../src/plugins/core/query.plugin';
import { transformPlugin } from '../../src/plugins/optional/transform.plugin';
import { diffPlugin } from '../../src/plugins/optional/diff.plugin';
import { patchPlugin } from '../../src/plugins/optional/patch.plugin';
import { schemaPlugin } from '../../src/plugins/optional/schema.plugin';
import type { JsonPlugin } from '../../src/types';

describe('Plugin System Integration', () => {
  describe('Plugin Loading and Dependencies', () => {
    it('should load core plugins successfully', () => {
      const json = createJson({});
      json.use(parsePlugin, stringifyPlugin, queryPlugin);

      expect(json.has('parse')).toBe(true);
      expect(json.has('stringify')).toBe(true);
      expect(json.has('get')).toBe(true);
      expect(json.has('set')).toBe(true);
    });

    it('should load plugins with dependencies', async () => {
      const json = createJson({});
      json.use(diffPlugin);
      // patchPlugin depends on diffPlugin
      const { createPatchPlugin } = await import('../../src/plugins/optional/diff.plugin');
      json.use(createPatchPlugin());

      expect(json.has('diff')).toBe(true);
      expect(json.has('patch')).toBe(true);
      expect(json.has('validatePatch')).toBe(true);
    });

    it('should throw error when dependency is missing', () => {
      const json = createJson({});
      const pluginWithMissingDep: JsonPlugin = {
        name: 'test',
        version: '1.0.0',
        dependencies: ['nonexistent'],
        install: () => {},
      };

      expect(() => json.use(pluginWithMissingDep)).toThrow();
    });

    it('should list loaded plugins', () => {
      const json = createJson({});
      json.use(parsePlugin, stringifyPlugin);

      const plugins = json.listPlugins();
      expect(plugins).toContain('parse');
      expect(plugins).toContain('stringify');
    });

    it('should unload plugins', () => {
      const json = createJson({});
      json.use(parsePlugin);
      expect(json.has('parse')).toBe(true);

      json.unload('parse');
      expect(json.has('parse')).toBe(false);
    });
  });

  describe('Multi-Plugin Workflow', () => {
    let json: ReturnType<typeof createJson>;

    beforeEach(() => {
      json = createJson({});
      json.use(parsePlugin, stringifyPlugin, queryPlugin, transformPlugin);
    });

    it('should parse, query, and transform data', () => {
      const input = '{"user": {"name": "John", "age": 30}}';
      const obj = (json as any).parse(input);

      const name = (json as any).get(obj, 'user.name');
      expect(name).toBe('John');

      // Test omit with array of keys on nested object
      const user = (json as any).get(obj, 'user');
      const transformed = (json as any).omit(user, ['age']);
      expect(transformed).toEqual({ name: 'John' });
    });

    it('should work with merge and query operations', () => {
      const obj1 = { a:1, b: 2 };
      const obj2 = { b:3, c: 4 };

      const merged = (json as any).merge(obj1, obj2);
      expect(merged).toEqual({ a: 1, b: 3, c: 4 });

      expect((json as any).get(merged, 'a')).toBe(1);
      expect((json as any).get(merged, 'c')).toBe(4);
    });

    it('should handle flatten and unflatten workflow', () => {
      const nested = { user: { profile: { name: 'John' } } };
      const flattened = (json as any).flatten(nested);

      expect(flattened).toEqual({ 'user.profile.name': 'John' });

      const unflattened = (json as any).unflatten(flattened);
      expect(unflattened).toEqual(nested);
    });
  });

  describe('Diff and Patch Integration', () => {
    let json: ReturnType<typeof createJson>;

    beforeEach(async () => {
      json = createJson({});
      json.use(parsePlugin, stringifyPlugin, diffPlugin);
      const { createPatchPlugin } = await import('../../src/plugins/optional/diff.plugin');
      json.use(createPatchPlugin());
    });

    it('should create and apply patches', () => {
      const before = { name: 'John', age: 30 };
      const after = { name: 'Jane', age: 31 };

      const patches = (json as any).diff(before, after);
      expect(patches.length).toBeGreaterThan(0);

      const result = (json as any).patch(before, patches);
      expect(result).toEqual(after);
    });

    it('should validate patches', () => {
      const validPatch = [{ op: 'add', path: '/b', value: 2 }];
      const invalidPatch = [{ op: 'invalid', path: '/b' }];

      expect((json as any).validatePatch(validPatch).valid).toBe(true);
      expect((json as any).validatePatch(invalidPatch).valid).toBe(false);
    });

    it('should reverse patches', () => {
      const original = { a:1, b: 2 };
      const patches = [
        { op: 'replace', path: '/a', value: 10 },
        { op: 'remove', path: '/b' },
      ];

      const reversed = (json as any).reversePatch(patches, original);
      const result = (json as any).patch({ a: 10 }, reversed);

      expect(result).toEqual(original);
    });
  });

  describe('Schema Validation Integration', () => {
    let json: ReturnType<typeof createJson>;

    beforeEach(() => {
      json = createJson({});
      json.use(parsePlugin, schemaPlugin);
    });

    it('should validate data against schema', () => {
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
        },
        required: ['name'],
      };

      const validData = { name: 'John', age: 30 };
      const invalidData = { age: 30 };

      expect((json as any).validate(validData, schema).valid).toBe(true);
      expect((json as any).validate(invalidData, schema).valid).toBe(false);
    });

    it('should compile and use validators', () => {
      const schema = {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
        },
      };

      const validator = (json as any).compile(schema);
      expect(validator({ email: 'test@example.com' }).valid).toBe(true);
      expect(validator({ email: 'invalid' }).valid).toBe(false);
    });

    it('should work with type guard', () => {
      interface User {
        name: string;
        age: number;
      }

      const data: unknown = { name: 'John', age: 30 };

      if ((json as any).is<User>(data, {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
        },
        required: ['name', 'age'],
      })) {
        // TypeScript knows data is User here
        expect(data.name.toUpperCase()).toBe('JOHN');
      }
    });
  });

  describe('Event System', () => {
    it('should emit plugin loaded events', () => {
      const json = createJson({});
      const events: string[] = [];

      json.on('plugin:loaded', (data) => {
        if (data && typeof data === 'object' && 'name' in data) {
          events.push(data.name as string);
        }
      });

      json.use(parsePlugin, stringifyPlugin);

      expect(events).toContain('parse');
      expect(events).toContain('stringify');
    });

    it('should emit plugin unloaded events', () => {
      const json = createJson({});
      json.use(parsePlugin);

      const events: string[] = [];
      json.on('plugin:unloaded', (data) => {
        if (data && typeof data === 'object' && 'name' in data) {
          events.push(data.name as string);
        }
      });

      json.unload('parse');

      expect(events).toContain('parse');
    });

    it('should emit kernel initialized event', async () => {
      const json = createJson({});
      let initialized = false;

      json.on('kernel:initialized', () => {
        initialized = true;
      });

      await json.init();

      expect(initialized).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle parse errors gracefully', () => {
      const json = createJson({});
      json.use(parsePlugin);

      expect(() => (json as any).parse('{invalid}')).toThrow();
    });

    it('should use safeParse for error handling', () => {
      const json = createJson({});
      json.use(parsePlugin);

      const result = (json as any).safeParse('{invalid}');
      expect(result.ok).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle method not found', () => {
      const json = createJson({});

      expect(() => (json as any).call('nonexistent')).toThrow();
    });
  });
});
