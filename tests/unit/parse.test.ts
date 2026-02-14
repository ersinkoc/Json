import { describe, it, expect } from 'vitest';
import { json } from '../../src/index';

describe('parse', () => {
  describe('basic parsing', () => {
    it('should parse valid JSON string', () => {
      expect(json.parse('"hello"')).toBe('hello');
    });

    it('should parse valid JSON number', () => {
      expect(json.parse('42')).toBe(42);
      expect(json.parse('-3.14')).toBe(-3.14);
      expect(json.parse('0')).toBe(0);
    });

    it('should parse valid JSON boolean', () => {
      expect(json.parse('true')).toBe(true);
      expect(json.parse('false')).toBe(false);
    });

    it('should parse null', () => {
      expect(json.parse('null')).toBe(null);
    });

    it('should parse empty object', () => {
      expect(json.parse('{}')).toEqual({});
    });

    it('should parse empty array', () => {
      expect(json.parse('[]')).toEqual([]);
    });

    it('should parse simple object', () => {
      expect(json.parse('{"name":"John","age":30}')).toEqual({
        name: 'John',
        age: 30,
      });
    });

    it('should parse simple array', () => {
      expect(json.parse('[1,2,3]')).toEqual([1, 2, 3]);
    });

    it('should parse nested object', () => {
      expect(json.parse('{"a":{"b":{"c":1}}}')).toEqual({
        a: { b: { c: 1 } },
      });
    });

    it('should parse nested array', () => {
      expect(json.parse('[[1,2],[3,4]]')).toEqual([[1, 2], [3, 4]]);
    });

    it('should parse mixed structure', () => {
      const result = json.parse('{"users":[{"name":"Alice"},{"name":"Bob"}]}');
      expect(result).toEqual({
        users: [{ name: 'Alice' }, { name: 'Bob' }],
      });
    });
  });

  describe('string parsing', () => {
    it('should handle escape sequences', () => {
      expect(json.parse('"\\n"')).toBe('\n');
      expect(json.parse('"\\t"')).toBe('\t');
      expect(json.parse('"\\r"')).toBe('\r');
      expect(json.parse('"\\""')).toBe('"');
      expect(json.parse('"\\\\"')).toBe('\\');
      expect(json.parse('"\\/"')).toBe('/');
      expect(json.parse('"\\b"')).toBe('\b');
      expect(json.parse('"\\f"')).toBe('\f');
    });

    it('should handle unicode escapes', () => {
      expect(json.parse('"\\u0041"')).toBe('A');
      expect(json.parse('"\\u0030"')).toBe('0');
    });

    it('should handle empty string', () => {
      expect(json.parse('""')).toBe('');
    });
  });

  describe('number parsing', () => {
    it('should parse integers', () => {
      expect(json.parse('0')).toBe(0);
      expect(json.parse('42')).toBe(42);
      expect(json.parse('-42')).toBe(-42);
    });

    it('should parse floats', () => {
      expect(json.parse('3.14')).toBe(3.14);
      expect(json.parse('-3.14')).toBe(-3.14);
      expect(json.parse('0.5')).toBe(0.5);
    });

    it('should parse scientific notation', () => {
      expect(json.parse('1e2')).toBe(100);
      expect(json.parse('1E2')).toBe(100);
      expect(json.parse('1e+2')).toBe(100);
      expect(json.parse('1e-2')).toBe(0.01);
      expect(json.parse('1.5e2')).toBe(150);
    });
  });

  describe('whitespace handling', () => {
    it('should ignore leading whitespace', () => {
      expect(json.parse('   42')).toBe(42);
      expect(json.parse('\n\t42')).toBe(42);
    });

    it('should ignore trailing whitespace', () => {
      expect(json.parse('42   ')).toBe(42);
      expect(json.parse('42\n\t')).toBe(42);
    });

    it('should ignore whitespace in objects', () => {
      expect(json.parse('{ "a" : 1 }')).toEqual({ a: 1 });
    });

    it('should ignore whitespace in arrays', () => {
      expect(json.parse('[ 1 , 2 , 3 ]')).toEqual([1, 2, 3]);
    });
  });

  describe('error handling', () => {
    it('should throw on invalid JSON', () => {
      expect(() => json.parse('{')).toThrow();
      expect(() => json.parse('[')).toThrow();
      expect(() => json.parse('undefined')).toThrow();
    });

    it('should throw on trailing characters', () => {
      expect(() => json.parse('42 extra')).toThrow();
    });
  });

  describe('options', () => {
    it('should respect maxDepth option', () => {
      const deep = '{"a":' + '{"b":'.repeat(20) + '1' + '}'.repeat(21);
      expect(() => json.parse(deep, { maxDepth: 10 })).toThrow();
    });

    it('should respect maxLength option', () => {
      const long = 'a'.repeat(1000);
      expect(() => json.parse(`"${long}"`, { maxLength: 100 })).toThrow();
    });
  });
});

describe('safeParse', () => {
  it('should return ok result for valid JSON', () => {
    const result = json.safeParse('{"valid":true}');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ valid: true });
    }
  });

  it('should return error result for invalid JSON', () => {
    const result = json.safeParse('{broken');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('JSON_PARSE_ERROR');
    }
  });
});

describe('reviver', () => {
  it('should apply reviver function', () => {
    const result = json.parse('{"date":"2024-01-01"}', {
      reviver: (key, value) => {
        if (key === 'date') {
          return new Date(value as string);
        }
        return value;
      },
    });

    expect(result.date).toBeInstanceOf(Date);
  });
});
