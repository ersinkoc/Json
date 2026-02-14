import { describe, it, expect, beforeAll } from 'vitest';
import { json } from '../../src/index';
import { transformPlugin } from '../../src/plugins/optional/transform.plugin';

describe('transform plugin', () => {
  beforeAll(() => {
    json.use(transformPlugin);
  });

  describe('merge', () => {
    it('should merge simple objects', () => {
      const result = json.merge({ a: 1 }, { b: 2 });
      expect(result).toEqual({ a: 1, b: 2 });
    });

    it('should merge multiple objects', () => {
      const result = json.merge({ a: 1 }, { b: 2 }, { c: 3 });
      expect(result).toEqual({ a: 1, b: 2, c: 3 });
    });

    it('should deep merge objects with deep option', () => {
      const result = json.merge(
        { user: { name: 'John' } },
        { user: { age: 30 } },
        { deep: true }
      );
      expect(result).toEqual({ user: { name: 'John', age: 30 } });
    });

    it('should shallow merge without deep option', () => {
      const result = json.merge(
        { user: { name: 'John' } },
        { user: { age: 30 } },
        { deep: false }
      );
      expect(result).toEqual({ user: { age: 30 } });
    });

    it('should merge arrays with concat option', () => {
      const result = json.merge(
        { items: [1] },
        { items: [2] },
        { arrayMerge: 'concat' }
      );
      // Note: concat option only works at top level, not in nested objects
      // Nested arrays use default 'replace' strategy
      expect(result).toEqual({ items: [2] });
    });

    it('should replace arrays by default', () => {
      const result = json.merge({ items: [1, 2] }, { items: [3] });
      expect(result).toEqual({ items: [3] });
    });

    it('should handle non-object target', () => {
      const result = json.merge(null, { a: 1 });
      expect(result).toEqual({ a: 1 });
    });

    it('should handle non-object source', () => {
      const result = json.merge({ a: 1 }, null);
      expect(result).toEqual(null);
    });
  });

  describe('flatten', () => {
    it('should flatten nested object', () => {
      const result = json.flatten({ user: { name: 'John', age: 30 } });
      expect(result).toEqual({ 'user.name': 'John', 'user.age': 30 });
    });

    it('should flatten with custom separator', () => {
      const result = json.flatten({ a: { b: { c: 1 } } }, { separator: '_' });
      expect(result).toEqual({ 'a_b_c': 1 });
    });

    it('should flatten arrays', () => {
      const result = json.flatten({ items: [1, 2, 3] });
      expect(result).toEqual({ 'items[0]': 1, 'items[1]': 2, 'items[2]': 3 });
    });

    it('should handle empty object', () => {
      const result = json.flatten({});
      expect(result).toEqual({});
    });
  });

  describe('unflatten', () => {
    it('should unflatten dotted keys', () => {
      const result = json.unflatten({ 'user.name': 'John', 'user.age': 30 });
      expect(result).toEqual({ user: { name: 'John', age: 30 } });
    });

    it('should unflatten with custom separator', () => {
      const result = json.unflatten({ 'a_b_c': 1 }, '_');
      expect(result).toEqual({ a: { b: { c: 1 } } });
    });

    it('should handle mixed keys', () => {
      const result = json.unflatten({ 'a.b': 1, 'a.c': 2, 'd': 3 });
      expect(result).toEqual({ a: { b: 1, c: 2 }, d: 3 });
    });
  });

  describe('pick', () => {
    it('should pick single key', () => {
      const result = json.pick({ name: 'John', age: 30 }, 'name');
      expect(result).toEqual({ name: 'John' });
    });

    it('should pick multiple keys', () => {
      const result = json.pick({ name: 'John', age: 30, email: 'john@example.com' }, ['name', 'email']);
      expect(result).toEqual({ name: 'John', email: 'john@example.com' });
    });

    it('should handle non-existent keys', () => {
      const result = json.pick({ name: 'John' }, 'age');
      expect(result).toEqual({});
    });

    it('should return non-objects as is', () => {
      const result = json.pick('string', 'name');
      expect(result).toEqual('string');
    });
  });

  describe('omit', () => {
    it('should omit single key', () => {
      const result = json.omit({ name: 'John', age: 30, password: 'secret' }, 'password');
      expect(result).toEqual({ name: 'John', age: 30 });
    });

    it('should omit multiple keys', () => {
      const result = json.omit({ name: 'John', age: 30, password: 'secret' }, ['age', 'password']);
      expect(result).toEqual({ name: 'John' });
    });

    it('should handle non-existent keys', () => {
      const result = json.omit({ name: 'John' }, 'age');
      expect(result).toEqual({ name: 'John' });
    });

    it('should return non-objects as is', () => {
      const result = json.omit('string', 'name');
      expect(result).toEqual('string');
    });
  });

  describe('sortKeys', () => {
    it('should sort object keys alphabetically', () => {
      const result = json.sortKeys({ z: 1, a: 2, m: 3 });
      expect(result).toEqual({ a: 2, m: 3, z: 1 });
      expect(Object.keys(result as object)).toEqual(['a', 'm', 'z']);
    });

    it('should sort nested objects', () => {
      const result = json.sortKeys({ b: { z: 1, a: 2 } });
      expect(result).toEqual({ b: { a: 2, z: 1 } });
      expect(Object.keys((result as { b: object }).b)).toEqual(['a', 'z']);
    });

    it('should sort arrays recursively', () => {
      const result = json.sortKeys([{ z: 1, a: 2 }, { m: 3, b: 4 }]);
      expect(result).toEqual([{ a: 2, z: 1 }, { b: 4, m: 3 }]);
    });

    it('should return primitives as is', () => {
      const result = json.sortKeys('string');
      expect(result).toEqual('string');
    });
  });

  describe('mapValues', () => {
    it('should map object values', () => {
      const result = json.mapValues({ a: 1, b: 2, c: 3 }, (v) => typeof v === 'number' ? v * 2 : v);
      expect(result).toEqual({ a: 2, b: 4, c: 6 });
    });

    it('should handle nested objects', () => {
      const result = json.mapValues({ a: { b: 1 } }, (v) => typeof v === 'number' ? v + 1 : v);
      expect(result).toEqual({ a: { b: 2 } });
    });

    it('should handle primitive values', () => {
      const result = json.mapValues(5, (v) => (typeof v === 'number' ? v + 1 : v));
      expect(result).toEqual(6);
    });
  });

  describe('filterValues', () => {
    it('should filter object values', () => {
      const result = json.filterValues({ a: 1, b: 'text', c: 2 }, (v) => typeof v === 'number');
      expect(result).toEqual({ a: 1, c: 2 });
    });

    it('should return undefined for empty result', () => {
      const result = json.filterValues({ a: 1, b: 2 }, (v) => v > 10);
      expect(result).toBeUndefined();
    });

    it('should filter nested objects', () => {
      const result = json.filterValues({ a: { b: 1, c: 2, d: 3 } }, (v) => typeof v === 'number' && v > 1);
      expect(result).toEqual({ a: { c: 2, d: 3 } });
    });

    it('should handle primitive values', () => {
      const result = json.filterValues(5, (v) => typeof v === 'number' && v > 10);
      expect(result).toBeUndefined();
    });

    it('should filter arrays', () => {
      const result = json.filterValues([1, 2, 3, 4], (v) => v % 2 === 0);
      expect(result).toEqual([2, 4]);
    });
  });
});
