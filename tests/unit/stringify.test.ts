import { describe, it, expect } from 'vitest';
import { json } from '../../src/index';

describe('stringify', () => {
  describe('basic types', () => {
    it('should stringify string', () => {
      expect(json.stringify('hello')).toBe('"hello"');
    });

    it('should stringify number', () => {
      expect(json.stringify(42)).toBe('42');
      expect(json.stringify(3.14)).toBe('3.14');
      expect(json.stringify(-1)).toBe('-1');
      expect(json.stringify(0)).toBe('0');
    });

    it('should stringify boolean', () => {
      expect(json.stringify(true)).toBe('true');
      expect(json.stringify(false)).toBe('false');
    });

    it('should stringify null', () => {
      expect(json.stringify(null)).toBe('null');
    });

    it('should stringify undefined as null', () => {
      expect(json.stringify(undefined)).toBe('null');
    });

    it('should handle special numbers', () => {
      expect(json.stringify(Infinity)).toBe('null');
      expect(json.stringify(-Infinity)).toBe('null');
      expect(json.stringify(NaN)).toBe('null');
    });
  });

  describe('objects', () => {
    it('should stringify empty object', () => {
      expect(json.stringify({})).toBe('{}');
    });

    it('should stringify simple object', () => {
      expect(json.stringify({ a: 1 })).toBe('{"a":1}');
    });

    it('should stringify object with multiple keys', () => {
      expect(json.stringify({ a: 1, b: 2 })).toBe('{"a":1,"b":2}');
    });

    it('should stringify nested object', () => {
      expect(json.stringify({ a: { b: 1 } })).toBe('{"a":{"b":1}}');
    });

    it('should skip undefined values', () => {
      expect(json.stringify({ a: 1, b: undefined })).toBe('{"a":1}');
    });

    it('should handle Date objects', () => {
      const date = new Date('2024-01-01T00:00:00.000Z');
      const result = json.stringify({ date });
      expect(result).toContain('"date":"2024-01-01T00:00:00.000Z"');
    });
  });

  describe('arrays', () => {
    it('should stringify empty array', () => {
      expect(json.stringify([])).toBe('[]');
    });

    it('should stringify simple array', () => {
      expect(json.stringify([1, 2, 3])).toBe('[1,2,3]');
    });

    it('should stringify nested array', () => {
      expect(json.stringify([[1, 2], [3, 4]])).toBe('[[1,2],[3,4]]');
    });

    it('should stringify array with mixed types', () => {
      expect(json.stringify([1, 'a', true, null])).toBe('[1,"a",true,null]');
    });
  });

  describe('string escaping', () => {
    it('should escape double quotes', () => {
      expect(json.stringify('say "hi"')).toBe('"say \\"hi\\""');
    });

    it('should escape backslashes', () => {
      expect(json.stringify('path\\to\\file')).toBe('"path\\\\to\\\\file"');
    });

    it('should escape newlines', () => {
      expect(json.stringify('line1\nline2')).toBe('"line1\\nline2"');
    });

    it('should escape tabs', () => {
      expect(json.stringify('col1\tcol2')).toBe('"col1\\tcol2"');
    });

    it('should escape carriage returns', () => {
      expect(json.stringify('line1\r\nline2')).toBe('"line1\\r\\nline2"');
    });

    it('should escape control characters', () => {
      expect(json.stringify('bell\x07')).toBe('"bell\\u0007"');
    });
  });

  describe('indent option', () => {
    it('should pretty print with indent', () => {
      const result = json.stringify({ a: 1 }, { indent: 2 });
      expect(result).toBe('{\n  "a": 1\n}');
    });

    it('should pretty print nested objects', () => {
      const result = json.stringify({ a: { b: 1 } }, { indent: 2 });
      expect(result).toBe('{\n  "a": {\n    "b": 1\n  }\n}');
    });

    it('should pretty print arrays', () => {
      const result = json.stringify([1, 2, 3], { indent: 2 });
      expect(result).toBe('[\n  1,\n  2,\n  3\n]');
    });

    it('should accept string indent', () => {
      const result = json.stringify({ a: 1 }, { indent: '\t' });
      expect(result).toBe('{\n\t"a": 1\n}');
    });
  });

  describe('sortKeys option', () => {
    it('should sort object keys', () => {
      const result = json.stringify({ c: 3, a: 1, b: 2 }, { sortKeys: true });
      expect(result).toBe('{"a":1,"b":2,"c":3}');
    });

    it('should sort nested object keys', () => {
      const result = json.stringify(
        { z: { c: 3, a: 1 }, a: 1 },
        { sortKeys: true }
      );
      expect(result).toBe('{"a":1,"z":{"a":1,"c":3}}');
    });
  });

  describe('circular reference handling', () => {
    it('should throw on circular reference by default', () => {
      const obj: Record<string, unknown> = { a: 1 };
      obj.self = obj;
      expect(() => json.stringify(obj)).toThrow();
    });

    it('should handle circular reference with circular option', () => {
      const obj: Record<string, unknown> = { a: 1 };
      obj.self = obj;
      const result = json.stringify(obj, { circular: '[Circular]' });
      expect(result).toContain('"self":"[Circular]"');
    });
  });

  describe('replacer option', () => {
    it('should apply replacer function', () => {
      const result = json.stringify(
        { name: 'John', password: 'secret' },
        {
          replacer: (key, value) => (key === 'password' ? undefined : value),
        }
      );
      expect(result).toBe('{"name":"John"}');
    });
  });

  describe('edge cases', () => {
    it('should handle bigint', () => {
      const result = json.stringify({ big: BigInt(123) });
      expect(result).toBe('{"big":123}');
    });

    it('should handle function as null', () => {
      const result = json.stringify({ fn: () => {} });
      expect(result).toBe('{"fn":null}');
    });

    it('should handle symbol as null', () => {
      const result = json.stringify({ sym: Symbol('test') });
      expect(result).toBe('{"sym":null}');
    });

    it('should handle empty object with indent', () => {
      const result = json.stringify({}, { indent: 2 });
      expect(result).toBe('{}');
    });

    it('should handle empty array with indent', () => {
      const result = json.stringify([], { indent: 2 });
      expect(result).toBe('[]');
    });

    it('should handle nested empty structures with indent', () => {
      const result = json.stringify({ a: {}, b: [] }, { indent: 2 });
      expect(result).toBe('{\n  "a": {},\n  "b": []\n}');
    });
  });

  describe('replacer edge cases', () => {
    it('should call replacer with empty key at root', () => {
      let calledWithEmpty = false;
      json.stringify({ a: 1 }, {
        replacer: (key, value) => {
          if (key === '') calledWithEmpty = true;
          return value;
        },
      });
      expect(calledWithEmpty).toBe(true);
    });

    it('should handle replacer returning undefined', () => {
      const result = json.stringify({ a: 1, b: 2, c: 3 }, {
        replacer: (key, value) => {
          if (key === 'b') return undefined;
          return value;
        },
      });
      expect(result).toBe('{"a":1,"c":3}');
    });
  });
});
