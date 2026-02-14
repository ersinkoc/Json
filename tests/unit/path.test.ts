import { describe, it, expect, beforeAll } from 'vitest';
import { json } from '../../src/index';
import { pathPlugin } from '../../src/plugins/optional/path.plugin';

describe('JSONPath plugin', () => {
  beforeAll(() => {
    json.use(pathPlugin);
  });

  const data = {
    store: {
      books: [
        { title: 'Book A', price: 10, category: 'fiction' },
        { title: 'Book B', price: 25, category: 'science' },
        { title: 'Book C', price: 8, category: 'fiction' },
        { title: 'Book D', price: 15, category: 'history' },
      ],
      location: 'NYC',
    },
    users: [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
    ],
  };

  describe('root selector', () => {
    it('should return entire object with $', () => {
      const result = json.query(data, '$');
      expect(result).toEqual([data]);
    });
  });

  describe('child selector', () => {
    it('should select child property', () => {
      const result = json.query(data, '$.store');
      expect(result).toEqual([data.store]);
    });

    it('should select nested child', () => {
      const result = json.query(data, '$.store.location');
      expect(result).toEqual(['NYC']);
    });
  });

  describe('array access', () => {
    it('should select array by index', () => {
      const result = json.query(data, '$.store.books[0]');
      expect(result).toEqual([data.store.books[0]]);
    });

    it('should select array element property', () => {
      const result = json.query(data, '$.store.books[0].title');
      expect(result).toEqual(['Book A']);
    });
  });

  describe('wildcard selector', () => {
    it('should select all array elements with [*]', () => {
      const result = json.query(data, '$.store.books[*].title');
      expect(result).toEqual(['Book A', 'Book B', 'Book C', 'Book D']);
    });

    it('should select all object properties with .*', () => {
      const result = json.query(data, '$.store.*');
      expect(result).toContainEqual(data.store.books);
      expect(result).toContain('NYC');
    });
  });

  describe('filter expressions', () => {
    it('should filter by condition', () => {
      const result = json.query(data, '$.store.books[?(@.price < 15)]');
      expect(result.length).toBe(2);
      expect(result.map((b: { title: string }) => b.title)).toContain('Book A');
      expect(result.map((b: { title: string }) => b.title)).toContain('Book C');
    });

    it('should filter by equality', () => {
      const result = json.query(data, '$.store.books[?(@.category == "fiction")]');
      expect(result.length).toBe(2);
      expect(result.map((b: { title: string }) => b.title)).toEqual(['Book A', 'Book C']);
    });

    it('should filter and select property', () => {
      const result = json.query(data, '$.store.books[?(@.price > 10)].title');
      expect(result).toEqual(['Book B', 'Book D']);
    });
  });

  describe('bracket notation', () => {
    it('should select property with bracket notation', () => {
      const result = json.query(data, '$["store"]["location"]');
      expect(result).toEqual(['NYC']);
    });

    it('should handle string keys', () => {
      const obj = { 'key with spaces': 'value' };
      const result = json.query(obj, '$["key with spaces"]');
      expect(result).toEqual(['value']);
    });
  });

  describe('edge cases', () => {
    it('should handle non-existent path', () => {
      const result = json.query(data, '$.nonexistent');
      expect(result).toEqual([]);
    });

    it('should handle empty result', () => {
      const result = json.query(data, '$.store.books[?(@.price > 100)]');
      expect(result).toEqual([]);
    });
  });
});
