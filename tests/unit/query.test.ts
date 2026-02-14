import { describe, it, expect } from 'vitest';
import { json } from '../../src/index';

describe('query plugin', () => {
  describe('get', () => {
    const data = {
      users: [
        { name: 'Alice', age: 30, address: { city: 'NYC' } },
        { name: 'Bob', age: 25 },
      ],
      settings: {
        theme: 'dark',
      },
    };

    it('should get top-level property', () => {
      expect(json.get(data, 'settings')).toEqual({ theme: 'dark' });
    });

    it('should get nested property', () => {
      expect(json.get(data, 'settings.theme')).toBe('dark');
    });

    it('should get array element', () => {
      expect(json.get(data, 'users[0]')).toEqual({
        name: 'Alice',
        age: 30,
        address: { city: 'NYC' },
      });
    });

    it('should get nested array property', () => {
      expect(json.get(data, 'users[0].name')).toBe('Alice');
    });

    it('should get deeply nested property', () => {
      expect(json.get(data, 'users[0].address.city')).toBe('NYC');
    });

    it('should return undefined for missing path', () => {
      expect(json.get(data, 'nonexistent')).toBeUndefined();
    });

    it('should return fallback for missing path', () => {
      expect(json.get(data, 'nonexistent', 'default')).toBe('default');
    });

    it('should handle null values', () => {
      expect(json.get({ a: null }, 'a')).toBe(null);
    });

    it('should handle bracket notation for objects', () => {
      expect(json.get({ 'key with spaces': 'value' }, '["key with spaces"]')).toBe('value');
    });
  });

  describe('set', () => {
    it('should set top-level property', () => {
      const data = { a: 1 };
      const result = json.set(data, 'b', 2);
      expect(result).toEqual({ a: 1, b: 2 });
      expect(data).toEqual({ a: 1 }); // Original unchanged
    });

    it('should set nested property', () => {
      const data = { a: { b: 1 } };
      const result = json.set(data, 'a.b', 2);
      expect(result).toEqual({ a: { b: 2 } });
      expect(data).toEqual({ a: { b: 1 } }); // Original unchanged
    });

    it('should set array element', () => {
      const data = { arr: [1, 2, 3] };
      const result = json.set(data, 'arr[1]', 20);
      expect(result).toEqual({ arr: [1, 20, 3] });
    });

    it('should create path if not exists', () => {
      const data = {};
      const result = json.set(data, 'a.b.c', 1);
      expect(result).toEqual({ a: { b: { c: 1 } } });
    });

    it('should maintain structural sharing', () => {
      const data = { a: { b: 1 }, c: { d: 2 } };
      const result = json.set(data, 'a.b', 10);
      expect((result as { a: { b: number } }).a.b).toBe(10);
      expect((result as { c: { d: number } }).c.d).toBe(2);
      expect(data.a.b).toBe(1);
    });
  });

  describe('has', () => {
    const data = { a: { b: 1 }, arr: [1, 2, 3] };

    it('should return true for existing path', () => {
      expect(json.has(data, 'a')).toBe(true);
      expect(json.has(data, 'a.b')).toBe(true);
      expect(json.has(data, 'arr[0]')).toBe(true);
    });

    it('should return false for non-existing path', () => {
      expect(json.has(data, 'nonexistent')).toBe(false);
      expect(json.has(data, 'a.c')).toBe(false);
      expect(json.has(data, 'arr[10]')).toBe(false);
    });

    it('should return false for non-numeric array index with bracket notation', () => {
      // Array index must be numeric - bracket notation with string returns false
      expect(json.has({ arr: [1, 2, 3] }, 'arr["abc"]')).toBe(false);
    });

    it('should return true for null values', () => {
      expect(json.has({ a: null }, 'a')).toBe(true);
    });

    it('should return false for path through primitive value', () => {
      expect(json.has({ a: 1 }, 'a.b')).toBe(false);
      expect(json.has({ a: 'string' }, 'a[0]')).toBe(false);
      expect(json.has({ a: true }, 'a.x')).toBe(false);
    });
  });

  describe('remove', () => {
    it('should remove top-level property', () => {
      const data = { a: 1, b: 2 };
      const result = json.remove(data, 'b');
      expect(result).toEqual({ a: 1 });
    });

    it('should remove nested property', () => {
      const data = { a: { b: 1, c: 2 } };
      const result = json.remove(data, 'a.b');
      expect(result).toEqual({ a: { c: 2 } });
    });

    it('should remove array element', () => {
      const data = { arr: [1, 2, 3] };
      const result = json.remove(data, 'arr[1]');
      expect(result).toEqual({ arr: [1, 3] });
    });

    it('should not modify original', () => {
      const data = { a: 1, b: 2 };
      json.remove(data, 'b');
      expect(data).toEqual({ a: 1, b: 2 });
    });

    it('should handle removing nested array elements', () => {
      const data = { arr: [[1, 2], [3, 4]] };
      const result = json.remove(data, 'arr[0][1]');
      expect(result).toEqual({ arr: [[1], [3, 4]] });
    });

    it('should return unchanged if path does not exist in array', () => {
      const data = { arr: [1, 2, 3] };
      const result = json.remove(data, 'arr[10]');
      expect(result).toEqual({ arr: [1, 2, 3] });
    });

    it('should handle removing from nested arrays', () => {
      const data = { matrix: [[1, 2, 3], [4, 5, 6]] };
      const result = json.remove(data, 'matrix[1][0]');
      expect(result).toEqual({ matrix: [[1, 2, 3], [5, 6]] });
    });

    it('should handle removing non-existent nested property', () => {
      const data = { a: { b: 1 } };
      const result = json.remove(data, 'a.x.y');
      expect(result).toEqual({ a: { b: 1 } });
    });

    it('should return unchanged when removing from primitive value', () => {
      const data = { a: 1 };
      const result = json.remove(data, 'a.b');
      expect(result).toEqual({ a: 1 });
    });

    it('should handle removing with negative array index', () => {
      const data = { arr: [1, 2, 3] };
      const result = json.remove(data, 'arr[-1]');
      expect(result).toEqual({ arr: [1, 2, 3] });
    });

    it('should handle removing nested path with invalid array index', () => {
      const data = { arr: [{ x: 1 }] };
      const result = json.remove(data, 'arr[10].x');
      expect(result).toEqual({ arr: [{ x: 1 }] });
    });

    it('should handle removing with non-numeric array index', () => {
      const data = { arr: [1, 2, 3] };
      const result = json.remove(data, 'arr[abc]');
      expect(result).toEqual({ arr: [1, 2, 3] });
    });

    it('should return undefined when removing with empty path', () => {
      const data = { a: 1 };
      const result = json.remove(data, '');
      expect(result).toBeUndefined();
    });

    it('should handle removing from non-existent nested path with primitive', () => {
      const data = { a: 5 };
      const result = json.remove(data, 'a.b.c');
      expect(result).toEqual({ a: 5 });
    });
  });

  describe('paths', () => {
    it('should list all paths in simple object', () => {
      const data = { a: 1, b: 2 };
      const paths = json.paths(data);
      expect(paths).toContain('a');
      expect(paths).toContain('b');
    });

    it('should list nested paths', () => {
      const data = { a: { b: { c: 1 } } };
      const paths = json.paths(data);
      expect(paths).toContain('a');
      expect(paths).toContain('a.b');
      expect(paths).toContain('a.b.c');
    });

    it('should list array paths', () => {
      const data = { arr: [1, 2, 3] };
      const paths = json.paths(data);
      expect(paths).toContain('arr');
      expect(paths).toContain('arr[0]');
      expect(paths).toContain('arr[1]');
      expect(paths).toContain('arr[2]');
    });

    it('should handle empty object', () => {
      const paths = json.paths({});
      expect(paths).toEqual([]);
    });
  });
});
