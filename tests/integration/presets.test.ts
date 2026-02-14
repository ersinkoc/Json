import { describe, it, expect } from 'vitest';
import { createJson } from '../../src/kernel';
import { parsePlugin } from '../../src/plugins/core/parse.plugin';
import { stringifyPlugin } from '../../src/plugins/core/stringify.plugin';
import { queryPlugin } from '../../src/plugins/core/query.plugin';
import { transformPlugin } from '../../src/plugins/optional/transform.plugin';
import { diffPlugin, patchPlugin } from '../../src/plugins/optional/diff.plugin';
import { schemaPlugin } from '../../src/plugins/optional/schema.plugin';
import { typePlugin } from '../../src/plugins/optional/type.plugin';
import { json5Plugin } from '../../src/plugins/optional/json5.plugin';
import { repairPlugin } from '../../src/plugins/optional/repair.plugin';
import { pathPlugin } from '../../src/plugins/optional/path.plugin';

/**
 * Factory functions for common JSON kernel presets
 */
export const presets = {
  /**
   * Core parsing and stringifying functionality
   */
  core: () => {
    const json = createJson({});
    json.use(parsePlugin, stringifyPlugin);
    return json;
  },

  /**
   * All core features including querying
   */
  full: () => {
    const json = createJson({});
    json.use(parsePlugin, stringifyPlugin, queryPlugin, transformPlugin);
    return json;
  },

  /**
   * Complete feature set with all plugins
   */
  all: () => {
    const json = createJson({});
    json.use(
      parsePlugin,
      stringifyPlugin,
      queryPlugin,
      transformPlugin,
      diffPlugin,
      patchPlugin,
      schemaPlugin,
      typePlugin,
      json5Plugin,
      repairPlugin,
      pathPlugin
    );
    return json;
  },
};

describe('Presets', () => {
  describe('Core Preset', () => {
    it('should provide parse and stringify', () => {
      const json = presets.core();

      const obj = (json as any).parse('{"name":"John"}');
      expect(obj).toEqual({ name: 'John' });

      const str = (json as any).stringify({ name: 'John' });
      expect(str).toBe('{"name":"John"}');
    });
  });

  describe('Full Preset', () => {
    it('should provide core and transform features', () => {
      const json = presets.full();

      const obj1 = { a:1 };
      const obj2 = { b: 2 };
      const merged = (json as any).merge(obj1, obj2);

      expect(merged).toEqual({ a: 1, b: 2 });
    });

    it('should support query operations', () => {
      const json = presets.full();

      const data = { user: { name: 'John', age: 30 } };
      const name = (json as any).get(data, 'user.name');

      expect(name).toBe('John');
    });

    it('should support transform operations', () => {
      const json = presets.full();

      const data = { z: 1, a: 2, m: 3 };
      const sorted = (json as any).sortKeys(data);

      expect((json as any).stringify(sorted)).toBe('{"a":2,"m":3,"z":1}');
    });
  });

  describe('All Preset', () => {
    it('should provide all available features', () => {
      const json = presets.all();

      // Parse and query
      const data = (json as any).parse('{"user":{"name":"John"}}');
      expect((json as any).get(data, 'user.name')).toBe('John');

      // Transform
      const merged = (json as any).merge({ a: 1 }, { b: 2 });
      expect(merged).toEqual({ a: 1, b: 2 });

      // Diff and patch
      const patches = (json as any).diff({ a: 1 }, { a: 2 });
      expect(patches.length).toBeGreaterThan(0);

      // Schema validation
      const schema = { type: 'object' };
      expect((json as any).validate({}, schema).valid).toBe(true);

      // Type inference
      const type = (json as any).infer({ name: 'John', age: 30 });
      expect(type).toContain('name: string');
      expect(type).toContain('age: number');

      // JSON5
      const json5Data = (json as any).parse5('{name: "John"}');
      expect(json5Data).toEqual({ name: 'John' });

      // Repair
      const repaired = (json as any).repair('{name: "John",}');
      expect((json as any).safeParse(repaired).ok).toBe(true);

      // Path query
      const pathResult = (json as any).query({ user: { name: 'John' } }, '$.user.name');
      expect(pathResult).toEqual(['John']);
    });
  });

  describe('Custom Kernel Creation', () => {
    it('should create kernel with custom configuration', () => {
      const json = createJson({
        parse: {
          maxDepth: 100,
          maxLength: 1_000_000,
        },
      });
      json.use(parsePlugin);

      const data = (json as any).parse('{"a":{"b":{"c":1}}}');
      expect(data).toEqual({ a: { b: { c: 1 } } });
    });

    it('should create kernel with custom context', () => {
      interface Context {
        userId: string;
      }

      const json = createJson<Context>({}, { userId: 'test-user' });
      json.use(parsePlugin);

      const context = json.getContext();
      expect(context.userId).toBe('test-user');
    });

    it('should create minimal kernel for specific use case', () => {
      // Read-only kernel - parse only
      const reader = createJson({});
      reader.use(parsePlugin);

      const data = reader.parse('{"readonly": true}');
      expect(data.readonly).toBe(true);

      // Write-only kernel - stringify only
      const writer = createJson({});
      writer.use(stringifyPlugin);

      const output = writer.stringify({ data: 'output' });
      expect(output).toBe('{"data":"output"}');
    });

    it('should create validation-focused kernel', () => {
      const validator = createJson({});
      validator.use(parsePlugin, schemaPlugin);

      const schema = {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          age: { type: 'number', minimum: 0 },
        },
        required: ['email', 'age'],
      };

      const data = validator.parse('{"email":"test@example.com","age":30}');
      const result = (validator as any).validate(data, schema);

      expect(result.valid).toBe(true);
    });

    it('should create transformation-focused kernel', () => {
      const transformer = createJson({});
      transformer.use(parsePlugin, stringifyPlugin, queryPlugin, transformPlugin);

      const input = transformer.parse('{"items":[{"id":1,"name":"A"},{"id":2,"name":"B"}]}');

      // Pick specific fields
      const simplified = (transformer as any).pick(input, 'items');
      expect(simplified).toEqual({ items: [{ id: 1, name: 'A' }, { id: 2, name: 'B' }] });

      // Flatten structure
      const flattened = (transformer as any).flatten(input);
      expect(flattened).toHaveProperty('items[0].id');
    });
  });
});
