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

    it('should handle objects that are not plain objects, arrays, or special types (lines 44-45)', () => {
      // Tests lines 44-45: default return for other object types
      class CustomClass {
        constructor(public value: number) {}
      }

      const customObj = new CustomClass(42);
      const cloned = deepClone(customObj);
      // For objects that are not plain objects, arrays, Date, RegExp, Map, or Set,
      // the function returns the value as-is (lines 44-45)
      expect(cloned).toBe(customObj);
    });

    it('should handle objects with custom prototypes', () => {
      // Tests default case for objects with custom prototypes
      const proto = { customMethod: () => {} };
      const obj = Object.create(proto);
      obj.value = 42;
      const cloned = deepClone(obj);
      // Objects with custom prototypes fall through to default case
      expect(cloned).toBe(obj);
    });

    it('should handle typed arrays', () => {
      // Tests default case for typed arrays
      const int8Array = new Int8Array([1, 2, 3]);
      const cloned = deepClone(int8Array);
      expect(cloned).toBe(int8Array);
    });

    it('should handle WeakMap and WeakSet', () => {
      // Tests default case for WeakMap and WeakSet
      const weakMap = new WeakMap();
      const weakSet = new WeakSet();
      expect(deepClone(weakMap)).toBe(weakMap);
      expect(deepClone(weakSet)).toBe(weakSet);
    });

    it('should handle Promise objects', () => {
      // Tests default case for Promise
      const promise = Promise.resolve(42);
      const cloned = deepClone(promise);
      expect(cloned).toBe(promise);
    });

    it('should handle functions (lines 44-45)', () => {
      // Tests lines 44-45: functions return as-is
      function testFunction() {
        return 42;
      }
      const arrowFunction = () => 42;
      const asyncFunction = async () => 42;

      expect(deepClone(testFunction)).toBe(testFunction);
      expect(deepClone(arrowFunction)).toBe(arrowFunction);
      expect(deepClone(asyncFunction)).toBe(asyncFunction);
    });

    it('should handle symbols', () => {
      // Tests default case for symbols
      const sym = Symbol('test');
      expect(deepClone(sym)).toBe(sym);
    });

    it('should handle boxed primitives', () => {
      // Tests default case for boxed primitives
      const boxedString = new String('test');
      const boxedNumber = new Number(42);
      const boxedBoolean = new Boolean(true);

      // These are objects but not plain objects, so they fall through
      expect(deepClone(boxedString)).toBe(boxedString);
      expect(deepClone(boxedNumber)).toBe(boxedNumber);
      expect(deepClone(boxedBoolean)).toBe(boxedBoolean);
    });

    it('should handle Error objects', () => {
      // Tests default case for Error objects
      const error = new Error('test error');
      const cloned = deepClone(error);
      // Error objects are not plain objects, arrays, Date, RegExp, Map, or Set
      expect(cloned).toBe(error);
    });

    it('should handle global objects', () => {
      // Tests default case for global objects
      expect(deepClone(globalThis)).toBe(globalThis);
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
