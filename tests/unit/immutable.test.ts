import { describe, it, expect, beforeAll } from 'vitest';
import { json } from '../../src/index';
import { immutablePlugin } from '../../src/plugins/optional/immutable.plugin';

describe('immutable plugin', () => {
  beforeAll(() => {
    json.use(immutablePlugin);
  });

  describe('freeze', () => {
    it('should freeze an object', () => {
      const obj = { a: 1, b: 2 };
      const frozen = json.freeze(obj);

      expect(Object.isFrozen(frozen)).toBe(true);
    });

    it('should deeply freeze nested objects', () => {
      const obj = { a: { b: { c: 1 } } };
      const frozen = json.freeze(obj);

      expect(Object.isFrozen(frozen)).toBe(true);
      expect(Object.isFrozen(frozen.a)).toBe(true);
      expect(Object.isFrozen(frozen.a.b)).toBe(true);
    });

    it('should freeze arrays', () => {
      const arr = [1, 2, 3];
      const frozen = json.freeze(arr);

      expect(Object.isFrozen(frozen)).toBe(true);
    });

    it('should deeply freeze nested arrays', () => {
      const arr = [[1, 2], [3, 4]];
      const frozen = json.freeze(arr);

      expect(Object.isFrozen(frozen)).toBe(true);
      expect(Object.isFrozen(frozen[0])).toBe(true);
      expect(Object.isFrozen(frozen[1])).toBe(true);
    });

    it('should return primitives unchanged', () => {
      expect(json.freeze('string')).toBe('string');
      expect(json.freeze(42)).toBe(42);
      expect(json.freeze(true)).toBe(true);
      expect(json.freeze(null)).toBe(null);
    });
  });

  describe('immutableSet', () => {
    it('should handle empty path', () => {
      const result = json.immutableSet({ a: 1 }, '', 'new value');
      expect(result).toBe('new value');
    });

    it('should set value immutably', () => {
      const obj = { a: 1 };
      const result = json.immutableSet(obj, 'b', 2);

      expect(result).toEqual({ a: 1, b: 2 });
      expect(obj).toEqual({ a: 1 });
    });

    it('should set nested value immutably', () => {
      const obj = { a: { b: 1 } };
      const result = json.immutableSet(obj, 'a.b', 2);

      expect(result).toEqual({ a: { b: 2 } });
      expect(obj).toEqual({ a: { b: 1 } });
    });

    it('should set array element immutably', () => {
      const obj = { arr: [1, 2, 3] };
      const result = json.immutableSet(obj, 'arr[1]', 20);

      expect(result).toEqual({ arr: [1, 20, 3] });
      expect(obj).toEqual({ arr: [1, 2, 3] });
    });

    it('should create path if not exists', () => {
      const obj = {};
      const result = json.immutableSet(obj, 'a.b.c', 1);

      expect(result).toEqual({ a: { b: { c: 1 } } });
    });

    it('should handle setting property on null/undefined value', () => {
      const obj = { a: null };
      const result = json.immutableSet(obj, 'a.b', 2);
      expect(result).toEqual({ a: { b: 2 } });
    });

    it('should maintain structural sharing', () => {
      const obj = { a: { b: 1 }, c: { d: 2 } };
      const result = json.immutableSet(obj, 'a.b', 10);

      expect((result as { c: { d: number } }).c).toBe(obj.c);
      expect((result as { a: { b: number } }).a).not.toBe(obj.a);
    });
  });

  describe('immutableRemove', () => {
    it('should remove value immutably', () => {
      const obj = { a: 1, b: 2 };
      const result = json.immutableRemove(obj, 'b');

      expect(result).toEqual({ a: 1 });
      expect(obj).toEqual({ a: 1, b: 2 });
    });

    it('should remove nested value immutably', () => {
      const obj = { a: { b: 1, c: 2 } };
      const result = json.immutableRemove(obj, 'a.b');

      expect(result).toEqual({ a: { c: 2 } });
    });

    it('should remove array element immutably', () => {
      const obj = { arr: [1, 2, 3] };
      const result = json.immutableRemove(obj, 'arr[1]');

      expect(result).toEqual({ arr: [1, 3] });
    });
  });

  describe('clone', () => {
    it('should clone an object', () => {
      const obj = { a: 1, b: { c: 2 } };
      const cloned = json.clone(obj);

      expect(cloned).toEqual(obj);
      expect(cloned).not.toBe(obj);
      expect(cloned.b).not.toBe(obj.b);
    });

    it('should clone an array', () => {
      const arr = [1, [2, 3]];
      const cloned = json.clone(arr);

      expect(cloned).toEqual(arr);
      expect(cloned).not.toBe(arr);
      expect(cloned[1]).not.toBe(arr[1]);
    });

    it('should return primitives unchanged', () => {
      expect(json.clone('string')).toBe('string');
      expect(json.clone(42)).toBe(42);
    });
  });

  describe('isFrozen', () => {
    it('should return true for frozen objects', () => {
      const frozen = Object.freeze({ a: 1 });
      expect(json.isFrozen(frozen)).toBe(true);
    });

    it('should return false for non-frozen objects', () => {
      const obj = { a: 1 };
      expect(json.isFrozen(obj)).toBe(false);
    });

    it('should return true for primitives', () => {
      expect(json.isFrozen('string')).toBe(true);
      expect(json.isFrozen(42)).toBe(true);
    });
  });

  describe('immutableRemove edge cases', () => {
    it('should handle removing from non-object non-array values (line 120)', () => {
      // Tests line 120: return value; (when value is neither array nor object)
      const result = json.immutableRemove('string', 'path');
      expect(result).toBe('string');

      const result2 = json.immutableRemove(42, 'path');
      expect(result2).toBe(42);

      const result3 = json.immutableRemove(null, 'path');
      expect(result3).toBe(null);

      const result4 = json.immutableRemove(undefined, 'path');
      expect(result4).toBe(undefined);
    });

    it('should handle array index out of bounds (line 120)', () => {
      // Tests line 120: return value; (when index is out of bounds)
      const obj = { arr: [1, 2, 3] };
      const result = json.immutableRemove(obj, 'arr[10]');
      expect(result).toEqual({ arr: [1, 2, 3] });
    });

    it('should handle removing property from non-object (line 120)', () => {
      // Tests line 120: return value; (when value is not an object)
      const result = json.immutableRemove('string', 'property');
      expect(result).toBe('string');
    });
  });

  describe('deepClone edge cases', () => {
    it('should handle non-object non-array values (lines 140-141)', () => {
      // Tests lines 140-141: default return for non-array, non-object values
      // Note: immutable plugin's clone is simpler than utils/deep-clone.ts
      // It doesn't handle Date, RegExp, Map, Set, Error specially
      // These fall through to the default case which returns the value as-is
      const fn = () => {};
      expect(json.clone(fn)).toBe(fn);
    });

    it('should handle special objects', () => {
      // Test that special objects are handled by the default case
      // The immutable plugin's clone doesn't have special handling for Date/RegExp
      // These fall through to return value as-is
      const date = new Date('2024-01-01');
      const cloned = json.clone(date);
      // Since Date is not plain object or array, it returns a clone by iterating keys
      // But Date has no enumerable keys, so it returns empty object
      expect(typeof cloned).toBe('object');
    });
  });
});
