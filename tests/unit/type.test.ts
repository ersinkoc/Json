import { describe, it, expect, beforeAll } from 'vitest';
import { json } from '../../src/index';
import { typePlugin } from '../../src/plugins/optional/type.plugin';

describe('type plugin', () => {
  beforeAll(() => {
    json.use(typePlugin);
  });

  describe('primitive types', () => {
    it('should infer string type', () => {
      const result = json.infer('hello');
      expect(result).toContain('string');
    });

    it('should infer number type', () => {
      const result = json.infer(42);
      expect(result).toContain('number');
    });

    it('should infer boolean type', () => {
      const result = json.infer(true);
      expect(result).toContain('boolean');
    });

    it('should infer null type', () => {
      const result = json.infer(null);
      expect(result).toContain('null');
    });
  });

  describe('array types', () => {
    it('should infer array of strings', () => {
      const result = json.infer(['a', 'b', 'c']);
      expect(result).toContain('string[]');
    });

    it('should infer array of numbers', () => {
      const result = json.infer([1, 2, 3]);
      expect(result).toContain('number[]');
    });

    it('should infer empty array', () => {
      const result = json.infer([]);
      expect(result).toContain('never[]');
    });
  });

  describe('object types', () => {
    it('should infer simple object', () => {
      const result = json.infer({ name: 'John', age: 30 });
      expect(result).toContain('interface');
      expect(result).toContain('name: string');
      expect(result).toContain('age: number');
    });

    it('should infer nested object', () => {
      const result = json.infer({
        user: {
          name: 'John',
          address: {
            city: 'NYC',
          },
        },
      });
      expect(result).toContain('interface');
      expect(result).toContain('user:');
    });

    it('should infer object with array', () => {
      const result = json.infer({
        items: [1, 2, 3],
      });
      expect(result).toContain('items: number[]');
    });
  });

  describe('options', () => {
    it('should use custom interface name', () => {
      const result = json.infer({ name: 'test' }, { name: 'User' });
      expect(result).toContain('interface User');
    });

    it('should add export keyword', () => {
      const result = json.infer({ name: 'test' }, { export: true });
      expect(result).toContain('export interface');
    });

    it('should handle special key names', () => {
      const result = json.infer({ 'key with spaces': 'value' });
      expect(result).toContain("'key with spaces'");
    });
  });

  describe('complex types', () => {
    it('should infer complex nested structure', () => {
      const data = {
        name: 'Alice',
        age: 30,
        active: true,
        tags: ['admin', 'user'],
        address: {
          city: 'NYC',
          zip: '10001',
        },
      };

      const result = json.infer(data, { name: 'User' });

      expect(result).toContain('interface User');
      expect(result).toContain('name: string');
      expect(result).toContain('age: number');
      expect(result).toContain('active: boolean');
      expect(result).toContain('tags: string[]');
      expect(result).toContain('address:');
      expect(result).toContain('city: string');
      expect(result).toContain('zip: string');
    });
  });

  describe('union types (lines 108-111)', () => {
    it('should infer union types from array with mixed types', () => {
      // Tests lines 108-111: union type handling
      const data = [1, 'string', true, null];
      const result = json.infer(data);
      expect(result).toContain(' | ');
      expect(result).toContain('number');
      expect(result).toContain('string');
      expect(result).toContain('boolean');
      expect(result).toContain('null');
    });

    it('should infer union types from array with objects', () => {
      const data = [{ type: 'a' }, { type: 'b' }];
      const result = json.infer(data);
      // Objects with same structure don't create union
      expect(result).toBeDefined();
    });

    it('should infer union types from array with mixed objects', () => {
      const data = [{ a: 1 }, { b: 2 }];
      const result = json.infer(data);
      expect(result).toContain(' | ');
    });

    it('should infer union with multiple types', () => {
      // Tests union type with complex types
      const data = [{ name: 'John' }, ['array'], 42, 'string', true];
      const result = json.infer(data);
      expect(result).toContain(' | ');
    });
  });

  describe('edge cases', () => {
    it('should handle unknown type (line 136)', () => {
      // Tests line 136: return 'unknown' for default case
      const result = json.infer(undefined);
      expect(result).toContain('unknown');
    });

    it('should handle object with no keys', () => {
      const result = json.infer({});
      // Empty objects produce interface with no properties
      expect(result).toContain('interface');
    });

    it('should handle array with union types and options', () => {
      const data = [1, 'string', true];
      const result = json.infer(data, { name: 'Mixed', export: true });
      // Union types are formatted inline without interface declaration
      expect(result).toContain(' | ');
      expect(result).toContain('number');
      expect(result).toContain('string');
      expect(result).toContain('boolean');
    });

    it('should handle nested objects with union arrays', () => {
      const data = {
        items: [1, 'two'],
      };
      const result = json.infer(data, { name: 'Data' });
      expect(result).toContain('items:');
      expect(result).toContain(' | ');
    });

    it('should handle empty union array', () => {
      const result = json.infer([]);
      expect(result).toContain('never[]');
    });

    it('should handle object without children', () => {
      // When an object has no properties (like Object.create(null) with no keys)
      // it returns an interface with no properties
      const obj = {};
      const result = json.infer(obj);
      expect(result).toContain('interface');
    });
  });
});
