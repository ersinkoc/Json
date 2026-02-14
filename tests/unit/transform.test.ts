import { describe, it, expect, beforeAll } from 'vitest';
import { json } from '../../src/index';
import { transformPlugin } from '../../src/plugins/optional/transform.plugin';

describe('transform plugin', () => {
  beforeAll(() => {
    json.use(transformPlugin);
  });

  describe('merge', () => {
    it('should merge two objects', () => {
      const result = json.merge({ a: 1 }, { b: 2 });
      expect(result).toEqual({ a: 1, b: 2 });
    });

    it('should merge multiple objects', () => {
      const result = json.merge({ a: 1 }, { b: 2 }, { c: 3 });
      expect(result).toEqual({ a: 1, b: 2, c: 3 });
    });

    it('should deeply merge nested objects', () => {
      const result = json.merge(
        { a: { b: 1 } },
        { a: { c: 2 } }
      );
      expect(result).toEqual({ a: { b: 1, c: 2 } });
    });

    it('should override primitive values', () => {
      const result = json.merge({ a: 1 }, { a: 2 });
      expect(result).toEqual({ a: 2 });
    });

    it('should replace arrays by default', () => {
      const result = json.merge({ arr: [1, 2] }, { arr: [3, 4] });
      expect(result).toEqual({ arr: [3, 4] });
    });
  });

  describe('flatten', () => {
    it('should flatten nested object', () => {
      const result = json.flatten({ a: { b: { c: 1 } } });
      expect(result).toEqual({ 'a.b.c': 1 });
    });

    it('should flatten mixed object', () => {
      const result = json.flatten({ a: { b: 1 }, c: 2 });
      expect(result).toEqual({ 'a.b': 1, c: 2 });
    });

    it('should handle arrays', () => {
      const result = json.flatten({ a: [1, 2, 3] });
      expect(result).toEqual({ 'a[0]': 1, 'a[1]': 2, 'a[2]': 3 });
    });

    it('should use custom separator', () => {
      const result = json.flatten({ a: { b: 1 } }, { separator: '_' });
      expect(result).toEqual({ 'a_b': 1 });
    });
  });

  describe('unflatten', () => {
    it('should unflatten flat object', () => {
      const result = json.unflatten({ 'a.b.c': 1 });
      expect(result).toEqual({ a: { b: { c: 1 } } });
    });

    it('should handle mixed keys', () => {
      const result = json.unflatten({ 'a.b': 1, c: 2 });
      expect(result).toEqual({ a: { b: 1 }, c: 2 });
    });

    it('should use custom separator', () => {
      const result = json.unflatten({ 'a_b': 1 }, '_');
      expect(result).toEqual({ a: { b: 1 } });
    });
  });

  describe('pick', () => {
    it('should pick specified keys', () => {
      const result = json.pick({ a: 1, b: 2, c: 3 }, ['a', 'c']);
      expect(result).toEqual({ a: 1, c: 3 });
    });

    it('should ignore non-existent keys', () => {
      const result = json.pick({ a: 1 }, ['a', 'b']);
      expect(result).toEqual({ a: 1 });
    });

    it('should handle empty pick list', () => {
      const result = json.pick({ a: 1 }, []);
      expect(result).toEqual({});
    });
  });

  describe('omit', () => {
    it('should omit specified keys', () => {
      const result = json.omit({ a: 1, b: 2, c: 3 }, ['b']);
      expect(result).toEqual({ a: 1, c: 3 });
    });

    it('should handle non-existent keys', () => {
      const result = json.omit({ a: 1 }, ['b']);
      expect(result).toEqual({ a: 1 });
    });

    it('should omit all keys', () => {
      const result = json.omit({ a: 1 }, ['a']);
      expect(result).toEqual({});
    });
  });

  describe('sortKeys', () => {
    it('should sort object keys alphabetically', () => {
      const result = json.sortKeys({ c: 3, a: 1, b: 2 });
      expect(Object.keys(result as Record<string, unknown>)).toEqual(['a', 'b', 'c']);
    });

    it('should recursively sort nested objects', () => {
      const result = json.sortKeys({ z: { c: 3, a: 1 }, a: 1 });
      expect(Object.keys(result as Record<string, unknown>)).toEqual(['a', 'z']);
      expect(Object.keys((result as Record<string, Record<string, unknown>>).z)).toEqual(['a', 'c']);
    });

    it('should handle arrays', () => {
      const result = json.sortKeys([{ c: 3, a: 1 }, { b: 2, a: 1 }]);
      expect(Object.keys((result as Record<string, unknown>[])[0])).toEqual(['a', 'c']);
    });
  });

  describe('mapValues', () => {
    it('should transform all values', () => {
      const result = json.mapValues({ a: '  hello  ', b: '  world  ' }, (v) =>
        typeof v === 'string' ? v.trim() : v
      );
      expect(result).toEqual({ a: 'hello', b: 'world' });
    });

    it('should handle nested objects', () => {
      const result = json.mapValues({ a: { b: '  test  ' } }, (v) =>
        typeof v === 'string' ? v.trim() : v
      );
      expect(result).toEqual({ a: { b: 'test' } });
    });
  });

  describe('filterValues', () => {
    it('should filter values by predicate', () => {
      const result = json.filterValues({ a: 1, b: null, c: 3 }, (v) => v !== null);
      expect(result).toEqual({ a: 1, c: 3 });
    });

    it('should handle nested objects', () => {
      const result = json.filterValues({ a: { b: null, c: 1 } }, (v) => v !== null);
      expect(result).toEqual({ a: { c: 1 } });
    });
  });
});
