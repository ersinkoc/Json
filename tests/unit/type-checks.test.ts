import { describe, it, expect } from 'vitest';
import { isObject, isArray, isPlainObject, isString, isNumber, isBoolean, isNull, isUndefined, isPrimitive, isInteger, isFinite, isSafeInteger, isJsonValue, getType } from '../../src/utils/type-checks';

describe('type-checks', () => {
  describe('isObject', () => {
    it('should return true for objects', () => {
      expect(isObject({})).toBe(true);
      expect(isObject({ a: 1 })).toBe(true);
      expect(isObject([])).toBe(false);
      expect(isObject(null)).toBe(false);
      expect(isObject(undefined)).toBe(false);
      expect(isObject(1)).toBe(false);
      expect(isObject('str')).toBe(false);
    });
  });

  describe('isArray', () => {
    it('should return true for arrays', () => {
      expect(isArray([])).toBe(true);
      expect(isArray([1, 2, 3])).toBe(true);
      expect(isArray({})).toBe(false);
      expect(isArray(null)).toBe(false);
    });
  });

  describe('isPlainObject', () => {
    it('should return true for plain objects', () => {
      expect(isPlainObject({})).toBe(true);
      expect(isPlainObject({ a: 1 })).toBe(true);
      expect(isPlainObject(Object.create(null))).toBe(true);
      expect(isPlainObject(new Date())).toBe(false);
      expect(isPlainObject([])).toBe(false);
      expect(isPlainObject(null)).toBe(false);
    });
  });

  describe('isString', () => {
    it('should return true for strings', () => {
      expect(isString('')).toBe(true);
      expect(isString('hello')).toBe(true);
      expect(isString(1)).toBe(false);
      expect(isString(null)).toBe(false);
    });
  });

  describe('isNumber', () => {
    it('should return true for valid numbers', () => {
      expect(isNumber(0)).toBe(true);
      expect(isNumber(42)).toBe(true);
      expect(isNumber(-1)).toBe(true);
      expect(isNumber(3.14)).toBe(true);
      expect(isNumber(NaN)).toBe(false);
      expect(isNumber(Infinity)).toBe(true);
      expect(isNumber('42')).toBe(false);
    });
  });

  describe('isBoolean', () => {
    it('should return true for booleans', () => {
      expect(isBoolean(true)).toBe(true);
      expect(isBoolean(false)).toBe(true);
      expect(isBoolean(1)).toBe(false);
      expect(isBoolean('true')).toBe(false);
    });
  });

  describe('isNull', () => {
    it('should return true for null', () => {
      expect(isNull(null)).toBe(true);
      expect(isNull(undefined)).toBe(false);
      expect(isNull(0)).toBe(false);
      expect(isNull('')).toBe(false);
    });
  });

  describe('isUndefined', () => {
    it('should return true for undefined', () => {
      expect(isUndefined(undefined)).toBe(true);
      expect(isUndefined(null)).toBe(false);
      expect(isUndefined(void 0)).toBe(true);
    });
  });

  describe('isPrimitive', () => {
    it('should return true for primitives', () => {
      expect(isPrimitive(null)).toBe(true);
      expect(isPrimitive(undefined)).toBe(false);
      expect(isPrimitive(42)).toBe(true);
      expect(isPrimitive('str')).toBe(true);
      expect(isPrimitive(true)).toBe(true);
      expect(isPrimitive({})).toBe(false);
      expect(isPrimitive([])).toBe(false);
    });
  });

  describe('isInteger', () => {
    it('should return true for integers', () => {
      expect(isInteger(42)).toBe(true);
      expect(isInteger(0)).toBe(true);
      expect(isInteger(-1)).toBe(true);
      expect(isInteger(3.14)).toBe(false);
      expect(isInteger(NaN)).toBe(false);
      expect(isInteger('42')).toBe(false);
    });
  });

  describe('isFinite', () => {
    it('should return true for finite numbers', () => {
      expect(isFinite(42)).toBe(true);
      expect(isFinite(0)).toBe(true);
      expect(isFinite(Infinity)).toBe(false);
      expect(isFinite(-Infinity)).toBe(false);
      expect(isFinite(NaN)).toBe(false);
      expect(isFinite('42')).toBe(false);
    });
  });

  describe('isSafeInteger', () => {
    it('should return true for safe integers', () => {
      expect(isSafeInteger(42)).toBe(true);
      expect(isSafeInteger(Number.MAX_SAFE_INTEGER)).toBe(true);
      expect(isSafeInteger(Number.MIN_SAFE_INTEGER)).toBe(true);
      expect(isSafeInteger(Number.MAX_SAFE_INTEGER + 1)).toBe(false);
      expect(isSafeInteger(3.14)).toBe(false);
      expect(isSafeInteger('42')).toBe(false);
    });
  });

  describe('isJsonValue', () => {
    it('should return true for valid JSON values', () => {
      expect(isJsonValue(null)).toBe(true);
      expect(isJsonValue(42)).toBe(true);
      expect(isJsonValue('str')).toBe(true);
      expect(isJsonValue(true)).toBe(true); // boolean is valid JSON
      expect(isJsonValue([])).toBe(true);
      expect(isJsonValue({})).toBe(true);
      expect(isJsonValue({ a: 1 })).toBe(true);
      expect(isJsonValue([1, 'a', null])).toBe(true);
    });

    it('should return false for invalid JSON values', () => {
      expect(isJsonValue(undefined)).toBe(false);
      expect(isJsonValue(NaN)).toBe(false);
      expect(isJsonValue(Infinity)).toBe(false);
      expect(isJsonValue(() => {})).toBe(false);
      expect(isJsonValue(Symbol('test'))).toBe(false);
    });
  });

  describe('getType', () => {
    it('should return correct type', () => {
      expect(getType(null)).toBe('null');
      expect(getType([])).toBe('array');
      expect(getType({})).toBe('object');
      expect(getType(42)).toBe('number');
      expect(getType('str')).toBe('string');
      expect(getType(true)).toBe('boolean');
      expect(getType(undefined)).toBe('undefined');
    });
  });
});
