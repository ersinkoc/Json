import { describe, it, expect, beforeAll } from 'vitest';
import { json } from '../../src/index';
import { diffPlugin, patchPlugin } from '../../src/plugins/optional/diff.plugin';

describe('diff and patch plugins', () => {
  beforeAll(() => {
    json.use(diffPlugin, patchPlugin);
  });

  describe('diff', () => {
    it('should detect added property', () => {
      const before = { a: 1 };
      const after = { a: 1, b: 2 };
      const diff = json.diff(before, after);

      expect(diff).toContainEqual({
        op: 'add',
        path: '/b',
        value: 2,
      });
    });

    it('should detect removed property', () => {
      const before = { a: 1, b: 2 };
      const after = { a: 1 };
      const diff = json.diff(before, after);

      expect(diff).toContainEqual({
        op: 'remove',
        path: '/b',
      });
    });

    it('should detect replaced value', () => {
      const before = { a: 1 };
      const after = { a: 2 };
      const diff = json.diff(before, after);

      expect(diff).toContainEqual({
        op: 'replace',
        path: '/a',
        value: 2,
      });
    });

    it('should detect nested changes', () => {
      const before = { a: { b: 1 } };
      const after = { a: { b: 2 } };
      const diff = json.diff(before, after);

      expect(diff).toContainEqual({
        op: 'replace',
        path: '/a/b',
        value: 2,
      });
    });

    it('should detect array changes', () => {
      const before = [1, 2, 3];
      const after = [1, 4, 3];
      const diff = json.diff(before, after);

      expect(diff).toContainEqual({
        op: 'replace',
        path: '/1',
        value: 4,
      });
    });

    it('should return empty array for identical objects', () => {
      const obj = { a: 1, b: { c: 2 } };
      const diff = json.diff(obj, obj);
      expect(diff).toEqual([]);
    });
  });

  describe('patch', () => {
    it('should apply add operation', () => {
      const obj = { a: 1 };
      const operations = [{ op: 'add' as const, path: '/b', value: 2 }];
      const result = json.patch(obj, operations);

      expect(result).toEqual({ a: 1, b: 2 });
    });

    it('should apply remove operation', () => {
      const obj = { a: 1, b: 2 };
      const operations = [{ op: 'remove' as const, path: '/b' }];
      const result = json.patch(obj, operations);

      expect(result).toEqual({ a: 1 });
    });

    it('should apply replace operation', () => {
      const obj = { a: 1 };
      const operations = [{ op: 'replace' as const, path: '/a', value: 2 }];
      const result = json.patch(obj, operations);

      expect(result).toEqual({ a: 2 });
    });

    it('should apply multiple operations', () => {
      const obj = { a: 1, b: 2 };
      const operations = [
        { op: 'replace' as const, path: '/a', value: 10 },
        { op: 'add' as const, path: '/c', value: 3 },
        { op: 'remove' as const, path: '/b' },
      ];
      const result = json.patch(obj, operations);

      expect(result).toEqual({ a: 10, c: 3 });
    });

    it('should apply test operation successfully', () => {
      const obj = { a: 1 };
      const operations = [{ op: 'test' as const, path: '/a', value: 1 }];
      const result = json.patch(obj, operations);

      expect(result).toEqual({ a: 1 });
    });

    it('should fail test operation on mismatch', () => {
      const obj = { a: 1 };
      const operations = [{ op: 'test' as const, path: '/a', value: 2 }];

      expect(() => json.patch(obj, operations)).toThrow();
    });
  });

  describe('validatePatch', () => {
    it('should validate correct operations', () => {
      const operations = [
        { op: 'add' as const, path: '/a', value: 1 },
        { op: 'remove' as const, path: '/b' },
      ];
      const result = json.validatePatch(operations);

      expect(result.valid).toBe(true);
    });

    it('should detect missing op field', () => {
      const operations = [{ path: '/a', value: 1 }];
      const result = json.validatePatch(operations as any);

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should detect invalid op', () => {
      const operations = [{ op: 'invalid' as const, path: '/a' }];
      const result = json.validatePatch(operations);

      expect(result.valid).toBe(false);
    });

    it('should detect missing path', () => {
      const operations = [{ op: 'add' as const, value: 1 }];
      const result = json.validatePatch(operations as any);

      expect(result.valid).toBe(false);
    });

    it('should detect missing value for add operation', () => {
      const operations = [{ op: 'add' as const, path: '/a' }];
      const result = json.validatePatch(operations as any);

      expect(result.valid).toBe(false);
    });
  });

  describe('reversePatch', () => {
    it('should reverse add operation to remove', () => {
      const original = { a: 1 };
      const operations = [{ op: 'add' as const, path: '/b', value: 2 }];
      const reversed = json.reversePatch(operations, original);

      expect(reversed).toContainEqual({
        op: 'remove',
        path: '/b',
      });
    });

    it('should reverse remove operation to add', () => {
      const original = { a: 1, b: 2 };
      const operations = [{ op: 'remove' as const, path: '/b' }];
      const reversed = json.reversePatch(operations, original);

      expect(reversed).toContainEqual({
        op: 'add',
        path: '/b',
        value: 2,
      });
    });

    it('should reverse replace operation', () => {
      const original = { a: 1 };
      const operations = [{ op: 'replace' as const, path: '/a', value: 2 }];
      const reversed = json.reversePatch(operations, original);

      expect(reversed).toContainEqual({
        op: 'replace',
        path: '/a',
        value: 1,
      });
    });
  });
});
