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
});
