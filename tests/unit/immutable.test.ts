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
});
