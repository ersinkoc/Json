import { describe, it, expect } from 'vitest';
import { parsePath, stringifyPath, joinPath, isNumericKey } from '../../src/utils/path-parser';

describe('path-parser', () => {
  describe('parsePath', () => {
    it('should parse empty path', () => {
      expect(parsePath('')).toEqual([]);
    });

    it('should parse simple property', () => {
      expect(parsePath('name')).toEqual(['name']);
    });

    it('should parse nested properties', () => {
      expect(parsePath('user.name')).toEqual(['user', 'name']);
    });

    it('should parse array indices', () => {
      expect(parsePath('users[0]')).toEqual(['users', 0]);
    });

    it('should parse nested array', () => {
      expect(parsePath('users[0].name')).toEqual(['users', 0, 'name']);
    });

    it('should parse bracket notation', () => {
      expect(parsePath('["key with spaces"]')).toEqual(['key with spaces']);
    });

    it('should parse quoted keys', () => {
      expect(parsePath('["key"]')).toEqual(['key']);
      expect(parsePath("['key']")).toEqual(['key']);
    });

    it('should parse mixed paths', () => {
      expect(parsePath('a.b[0].c')).toEqual(['a', 'b', 0, 'c']);
    });

    it('should parse deep nesting', () => {
      expect(parsePath('a.b.c.d')).toEqual(['a', 'b', 'c', 'd']);
    });
  });

  describe('stringifyPath', () => {
    it('should stringify empty path', () => {
      expect(stringifyPath([])).toBe('');
    });

    it('should stringify simple property', () => {
      expect(stringifyPath(['name'])).toBe('name');
    });

    it('should stringify nested properties', () => {
      expect(stringifyPath(['user', 'name'])).toBe('user.name');
    });

    it('should stringify array indices', () => {
      expect(stringifyPath(['users', 0])).toBe('users[0]');
    });

    it('should stringify special keys', () => {
      expect(stringifyPath(['key with spaces'])).toBe('["key with spaces"]');
    });
  });

  describe('joinPath', () => {
    it('should join path segments', () => {
      expect(joinPath('a', 'b', 'c')).toBe('a.b.c');
    });

    it('should join with numbers', () => {
      expect(joinPath('users', 0, 'name')).toBe('users[0].name');
    });
  });

  describe('isNumericKey', () => {
    it('should identify numeric keys', () => {
      expect(isNumericKey(0)).toBe(true);
      expect(isNumericKey(42)).toBe(true);
      expect(isNumericKey('0')).toBe(true);
      expect(isNumericKey('42')).toBe(true);
      expect(isNumericKey('name')).toBe(false);
      expect(isNumericKey('-1')).toBe(false);
    });
  });
});
