import { describe, it, expect } from 'vitest';
import { deepClone, shallowClone } from '../../src/utils/deep-clone';

describe('deep-clone', () => {
  describe('deepClone', () => {
    it('should clone primitives', () => {
      expect(deepClone(42)).toBe(42);
      expect(deepClone('str')).toBe('str');
      expect(deepClone(true)).toBe(true);
      expect(deepClone(null)).toBe(null);
      expect(deepClone(undefined)).toBe(undefined);
    });

    it('should clone arrays', () => {
      const arr = [1, 2, 3];
      const cloned = deepClone(arr);
      expect(cloned).toEqual(arr);
      expect(cloned).not.toBe(arr);
      cloned[0] = 100;
      expect(arr[0]).toBe(1);
    });

    it('should clone nested arrays', () => {
      const arr = [[1, 2], [3, 4]];
      const cloned = deepClone(arr);
      expect(cloned).toEqual(arr);
      expect(cloned[0]).not.toBe(arr[0]);
      (cloned[0] as number[])[0] = 100;
      expect((arr[0] as number[])[0]).toBe(1);
    });

    it('should clone objects', () => {
      const obj = { a: 1, b: 2 };
      const cloned = deepClone(obj);
      expect(cloned).toEqual(obj);
      expect(cloned).not.toBe(obj);
      cloned.a = 100;
      expect(obj.a).toBe(1);
    });

    it('should clone nested objects', () => {
      const obj = { a: { b: { c: 1 } } };
      const cloned = deepClone(obj);
      expect(cloned).toEqual(obj);
      expect(cloned.a).not.toBe(obj.a);
      expect(cloned.a.b).not.toBe(obj.a.b);
    });

    it('should clone Date objects', () => {
      const date = new Date('2024-01-01');
      const cloned = deepClone(date);
      expect(cloned).toEqual(date);
      expect(cloned).not.toBe(date);
    });

    it('should clone RegExp objects', () => {
      const regex = /test/gi;
      const cloned = deepClone(regex);
      expect(cloned).toEqual(regex);
      expect(cloned).not.toBe(regex);
      expect(cloned.source).toBe(regex.source);
      expect(cloned.flags).toBe(regex.flags);
    });

    it('should clone Map objects', () => {
      const map = new Map([['a', 1], ['b', 2]]);
      const cloned = deepClone(map);
      expect(cloned).toEqual(map);
      expect(cloned).not.toBe(map);
      cloned.set('c', 3);
      expect(map.has('c')).toBe(false);
    });

    it('should clone Set objects', () => {
      const set = new Set([1, 2, 3]);
      const cloned = deepClone(set);
      expect(cloned).toEqual(set);
      expect(cloned).not.toBe(set);
      cloned.add(4);
      expect(set.has(4)).toBe(false);
    });

    it('should handle mixed structures', () => {
      const obj = {
        num: 1,
        str: 'test',
        arr: [1, { a: 2 }],
        date: new Date(),
        nested: { deep: { value: 42 } }
      };
      const cloned = deepClone(obj);
      expect(cloned).toEqual(obj);
      expect(cloned).not.toBe(obj);
      expect(cloned.arr).not.toBe(obj.arr);
      expect(cloned.nested).not.toBe(obj.nested);
    });
  });

  describe('shallowClone', () => {
    it('should shallow clone arrays', () => {
      const arr = [1, 2, 3];
      const cloned = shallowClone(arr);
      expect(cloned).toEqual(arr);
      expect(cloned).not.toBe(arr);
    });

    it('should shallow clone objects', () => {
      const obj = { a: 1, b: 2 };
      const cloned = shallowClone(obj);
      expect(cloned).toEqual(obj);
      expect(cloned).not.toBe(obj);
    });

    it('should return primitives unchanged', () => {
      expect(shallowClone(42)).toBe(42);
      expect(shallowClone('str')).toBe('str');
      expect(shallowClone(null)).toBe(null);
    });

    it('should not deep clone nested objects', () => {
      const obj = { a: { b: 1 } };
      const cloned = shallowClone(obj);
      expect(cloned.a).toBe(obj.a);
    });
  });
});
