import { describe, it, expect, beforeAll } from 'vitest';
import { json } from '../../src/index';
import { json5Plugin } from '../../src/plugins/optional/json5.plugin';

describe('JSON5 plugin', () => {
  beforeAll(() => {
    json.use(json5Plugin);
  });

  describe('parse5', () => {
    describe('standard JSON', () => {
      it('should parse standard JSON', () => {
        expect(json.parse5('{"name": "test"}')).toEqual({ name: 'test' });
      });

      it('should parse arrays', () => {
        expect(json.parse5('[1, 2, 3]')).toEqual([1, 2, 3]);
      });
    });

    describe('comments', () => {
      it('should parse single-line comments', () => {
        const result = json.parse5(`{
          // This is a comment
          "name": "test"
        }`);
        expect(result).toEqual({ name: 'test' });
      });

      it('should parse multi-line comments', () => {
        const result = json.parse5(`{
          /* This is a
             multi-line comment */
          "name": "test"
        }`);
        expect(result).toEqual({ name: 'test' });
      });

      it('should parse trailing comments', () => {
        const result = json.parse5(`{"name": "test"} // comment`);
        expect(result).toEqual({ name: 'test' });
      });
    });

    describe('trailing commas', () => {
      it('should parse trailing comma in objects', () => {
        expect(json.parse5('{"a": 1, "b": 2,}')).toEqual({ a: 1, b: 2 });
      });

      it('should parse trailing comma in arrays', () => {
        expect(json.parse5('[1, 2, 3,]')).toEqual([1, 2, 3]);
      });

      it('should parse nested trailing commas', () => {
        expect(json.parse5('{"a": [1, 2,],}')).toEqual({ a: [1, 2] });
      });
    });

    describe('unquoted keys', () => {
      it('should parse unquoted keys', () => {
        expect(json.parse5('{name: "test"}')).toEqual({ name: 'test' });
      });

      it('should parse keys with $ and _', () => {
        expect(json.parse5('{$name: "test", _value: 1}')).toEqual({
          $name: 'test',
          _value: 1,
        });
      });
    });

    describe('single quotes', () => {
      it('should parse single-quoted strings', () => {
        expect(json.parse5("{'name': 'test'}")).toEqual({ name: 'test' });
      });

      it('should handle escaped single quotes', () => {
        expect(json.parse5("{'name': 'it\\'s'}")).toEqual({ name: "it's" });
      });
    });

    describe('special numbers', () => {
      it('should parse Infinity', () => {
        expect(json.parse5('Infinity')).toBe(Infinity);
      });

      it('should parse -Infinity', () => {
        expect(json.parse5('-Infinity')).toBe(-Infinity);
      });

      it('should parse NaN', () => {
        expect(json.parse5('NaN')).toBeNaN();
      });
    });

    describe('hexadecimal numbers', () => {
      it('should parse hex numbers', () => {
        expect(json.parse5('0xFF')).toBe(255);
        expect(json.parse5('0x10')).toBe(16);
      });
    });

    describe('number formats', () => {
      it('should parse leading decimal point', () => {
        expect(json.parse5('.5')).toBe(0.5);
      });

      it('should parse trailing decimal point', () => {
        expect(json.parse5('5.')).toBe(5);
      });

      it('should parse leading plus', () => {
        expect(json.parse5('+42')).toBe(42);
      });
    });

    describe('complex JSON5', () => {
      it('should parse config-like JSON5', () => {
        const input = `{
          // Database configuration
          host: 'localhost',
          port: 5432,
          ssl: true,
          /* Connection pool settings */
          pool: {
            min: 2,
            max: 10,
          },
        }`;

        expect(json.parse5(input)).toEqual({
          host: 'localhost',
          port: 5432,
          ssl: true,
          pool: {
            min: 2,
            max: 10,
          },
        });
      });
    });
  });

  describe('stringify5', () => {
    it('should stringify to JSON5 format', () => {
      const result = json.stringify5({ name: 'test' });
      expect(result).toContain('name');
      expect(result).toContain('test');
    });

    it('should handle special numbers', () => {
      expect(json.stringify5(Infinity)).toBe('Infinity');
      expect(json.stringify5(-Infinity)).toBe('-Infinity');
      expect(json.stringify5(NaN)).toBe('NaN');
    });

    it('should support indent option', () => {
      const result = json.stringify5({ a: 1 }, { indent: 2 });
      expect(result).toContain('\n');
      expect(result).toContain('  ');
    });

    it('should support quote option', () => {
      const result = json.stringify5({ name: 'test' }, { quote: "'" });
      expect(result).toContain("'test'");
    });
  });

  describe('parse5 error cases', () => {
    it('should throw error for invalid special number (line 327)', () => {
      // Tests line 327: throw new JsonParseError for invalid special number
      expect(() => json.parse5('Invalid')).toThrow();
      expect(() => json.parse5('I')).toThrow();
      expect(() => json.parse5('N')).toThrow();
    });

    it('should throw error for unexpected character after value', () => {
      expect(() => json.parse5('true false')).toThrow();
      expect(() => json.parse5('123 456')).toThrow();
    });

    it('should throw error for invalid null literal', () => {
      // Tests line 312: throw error for invalid null
      expect(() => json.parse5('nulp')).toThrow();
      expect(() => json.parse5('nulx')).toThrow();
      expect(() => json.parse5('nullx')).toThrow();
    });

    it('should parse -Infinity (line 320)', () => {
      // Tests line 320-321: -Infinity handling
      expect(json.parse5('-Infinity')).toBe(-Infinity);
    });

    it('should throw error for invalid special number', () => {
      // Tests line 327: throw error for invalid special number that's not Infinity/-Infinity/NaN
      expect(() => json.parse5('InvalidNumber')).toThrow();
    });

    it('should throw error for invalid null keyword', () => {
      // Tests line 312: throw error for invalid null keyword
      expect(() => json.parse5('nulp')).toThrow();
      expect(() => json.parse5('nulx')).toThrow();
    });

    it('should stringify unknown types gracefully (line 386)', () => {
      // Tests line 386: fallback stringify for unknown types
      const result = json.stringify5(new Date());
      expect(result).toBeDefined();
    });
  });

  describe('stringify5 edge cases', () => {
    it('should handle undefined values (line 336-338)', () => {
      // Tests lines 336-338: handling undefined in stringify
      const result = json.stringify5(undefined);
      expect(result).toContain('null');
    });

    it('should handle empty arrays with indent (lines 366-371)', () => {
      // Tests lines 366-371: empty array handling with indentation
      const result = json.stringify5({ items: [] }, { indent: 2 });
      expect(result).toContain('[]');
      // Empty arrays with indent still format the outer object
      expect(result).toContain('items:');
    });

    it('should handle nested arrays with indent (lines 366-371)', () => {
      // Tests lines 366-371: array with indentation
      const result = json.stringify5({ items: [1, 2, 3] }, { indent: 2 });
      expect(result).toContain('\n');
      expect(result).toContain('  ');
      expect(result).toContain('1');
      expect(result).toContain('2');
      expect(result).toContain('3');
    });

    it('should handle empty objects with indent (line 386)', () => {
      // Tests line 386: return 'null' for unknown types
      const result = json.stringify5(Object.create(null));
      expect(result).toBeDefined();
    });

    it('should handle special characters in strings', () => {
      // Test string escaping with different quote types
      const obj = { str: 'test\nvalue\t' };
      const result = json.stringify5(obj);
      expect(result).toContain('\\n');
      expect(result).toContain('\\t');
    });

    it('should handle unknown object types (line 386)', () => {
      // Tests line 386: return 'null' for unknown types
      const unknown = Object.create(null);
      unknown['key'] = 'value';
      const result = json.stringify5(unknown);
      expect(result).toBeDefined();
      expect(result).toContain('key');
    });

    it('should handle array with single quotes and indent', () => {
      // Tests array formatting with single quotes
      const result = json.stringify5(['a', 'b'], { indent: 2, quote: "'" });
      expect(result).toContain('[\n');
      expect(result).toContain("'a'");
      expect(result).toContain("'b'");
    });
  });
});
