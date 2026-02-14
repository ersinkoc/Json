import { describe, it, expect, beforeAll } from 'vitest';
import { json } from '../../src/index';
import { schemaPlugin } from '../../src/plugins/optional/schema.plugin';
import type { JsonSchema } from '../../src/types';

describe('schema plugin', () => {
  beforeAll(() => {
    json.use(schemaPlugin);
  });

  describe('type validation', () => {
    it('should validate string type', () => {
      const schema: JsonSchema = { type: 'string' };
      expect(json.validate('hello', schema).valid).toBe(true);
      expect(json.validate(42, schema).valid).toBe(false);
    });

    it('should validate number type', () => {
      const schema: JsonSchema = { type: 'number' };
      expect(json.validate(42, schema).valid).toBe(true);
      expect(json.validate('42', schema).valid).toBe(false);
    });

    it('should validate integer type', () => {
      const schema: JsonSchema = { type: 'integer' };
      expect(json.validate(42, schema).valid).toBe(true);
      expect(json.validate(3.14, schema).valid).toBe(false);
    });

    it('should validate boolean type', () => {
      const schema: JsonSchema = { type: 'boolean' };
      expect(json.validate(true, schema).valid).toBe(true);
      expect(json.validate('true', schema).valid).toBe(false);
    });

    it('should validate array type', () => {
      const schema: JsonSchema = { type: 'array' };
      expect(json.validate([1, 2, 3], schema).valid).toBe(true);
      expect(json.validate({ 0: 1 }, schema).valid).toBe(false);
    });

    it('should validate object type', () => {
      const schema: JsonSchema = { type: 'object' };
      expect(json.validate({ a: 1 }, schema).valid).toBe(true);
      expect(json.validate([1, 2], schema).valid).toBe(false);
    });

    it('should validate null type', () => {
      const schema: JsonSchema = { type: 'null' };
      expect(json.validate(null, schema).valid).toBe(true);
      expect(json.validate(undefined, schema).valid).toBe(false);
    });

    it('should validate multiple types', () => {
      const schema: JsonSchema = { type: ['string', 'number'] };
      expect(json.validate('hello', schema).valid).toBe(true);
      expect(json.validate(42, schema).valid).toBe(true);
      expect(json.validate(true, schema).valid).toBe(false);
    });
  });

  describe('string validation', () => {
    it('should validate minLength', () => {
      const schema: JsonSchema = { type: 'string', minLength: 3 };
      expect(json.validate('abc', schema).valid).toBe(true);
      expect(json.validate('ab', schema).valid).toBe(false);
    });

    it('should validate maxLength', () => {
      const schema: JsonSchema = { type: 'string', maxLength: 5 };
      expect(json.validate('abc', schema).valid).toBe(true);
      expect(json.validate('abcdef', schema).valid).toBe(false);
    });

    it('should validate pattern', () => {
      const schema: JsonSchema = { type: 'string', pattern: '^[a-z]+$' };
      expect(json.validate('hello', schema).valid).toBe(true);
      expect(json.validate('Hello', schema).valid).toBe(false);
    });

    it('should validate format - email', () => {
      const schema: JsonSchema = { type: 'string', format: 'email' };
      expect(json.validate('test@example.com', schema).valid).toBe(true);
      expect(json.validate('invalid-email', schema).valid).toBe(false);
    });

    it('should validate format - uri', () => {
      const schema: JsonSchema = { type: 'string', format: 'uri' };
      expect(json.validate('https://example.com', schema).valid).toBe(true);
      expect(json.validate('not-a-uri', schema).valid).toBe(false);
    });
  });

  describe('number validation', () => {
    it('should validate minimum', () => {
      const schema: JsonSchema = { type: 'number', minimum: 0 };
      expect(json.validate(5, schema).valid).toBe(true);
      expect(json.validate(-1, schema).valid).toBe(false);
    });

    it('should validate maximum', () => {
      const schema: JsonSchema = { type: 'number', maximum: 100 };
      expect(json.validate(50, schema).valid).toBe(true);
      expect(json.validate(101, schema).valid).toBe(false);
    });

    it('should validate exclusiveMinimum', () => {
      const schema: JsonSchema = { type: 'number', exclusiveMinimum: 0 };
      expect(json.validate(1, schema).valid).toBe(true);
      expect(json.validate(0, schema).valid).toBe(false);
    });

    it('should validate multipleOf', () => {
      const schema: JsonSchema = { type: 'number', multipleOf: 5 };
      expect(json.validate(15, schema).valid).toBe(true);
      expect(json.validate(13, schema).valid).toBe(false);
    });
  });

  describe('array validation', () => {
    it('should validate minItems', () => {
      const schema: JsonSchema = { type: 'array', minItems: 2 };
      expect(json.validate([1, 2], schema).valid).toBe(true);
      expect(json.validate([1], schema).valid).toBe(false);
    });

    it('should validate maxItems', () => {
      const schema: JsonSchema = { type: 'array', maxItems: 3 };
      expect(json.validate([1, 2, 3], schema).valid).toBe(true);
      expect(json.validate([1, 2, 3, 4], schema).valid).toBe(false);
    });

    it('should validate uniqueItems', () => {
      const schema: JsonSchema = { type: 'array', uniqueItems: true };
      expect(json.validate([1, 2, 3], schema).valid).toBe(true);
      expect(json.validate([1, 2, 1], schema).valid).toBe(false);
    });

    it('should validate items schema', () => {
      const schema: JsonSchema = {
        type: 'array',
        items: { type: 'number' },
      };
      expect(json.validate([1, 2, 3], schema).valid).toBe(true);
      expect(json.validate([1, 'two', 3], schema).valid).toBe(false);
    });
  });

  describe('object validation', () => {
    it('should validate required properties', () => {
      const schema: JsonSchema = {
        type: 'object',
        required: ['name', 'email'],
      };
      expect(
        json.validate({ name: 'John', email: 'john@example.com' }, schema)
          .valid
      ).toBe(true);
      expect(json.validate({ name: 'John' }, schema).valid).toBe(false);
    });

    it('should validate property types', () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
        },
      };
      expect(
        json.validate({ name: 'John', age: 30 }, schema).valid
      ).toBe(true);
      expect(
        json.validate({ name: 'John', age: '30' }, schema).valid
      ).toBe(false);
    });

    it('should validate additionalProperties false', () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: { name: { type: 'string' } },
        additionalProperties: false,
      };
      expect(json.validate({ name: 'John' }, schema).valid).toBe(true);
      expect(json.validate({ name: 'John', extra: 'value' }, schema).valid).toBe(
        false
      );
    });

    it('should validate minProperties', () => {
      const schema: JsonSchema = { type: 'object', minProperties: 2 };
      expect(json.validate({ a: 1, b: 2 }, schema).valid).toBe(true);
      expect(json.validate({ a: 1 }, schema).valid).toBe(false);
    });

    it('should validate maxProperties', () => {
      const schema: JsonSchema = { type: 'object', maxProperties: 2 };
      expect(json.validate({ a: 1, b: 2 }, schema).valid).toBe(true);
      expect(json.validate({ a: 1, b: 2, c: 3 }, schema).valid).toBe(false);
    });
  });

  describe('enum and const', () => {
    it('should validate enum', () => {
      const schema: JsonSchema = { enum: ['red', 'green', 'blue'] };
      expect(json.validate('red', schema).valid).toBe(true);
      expect(json.validate('yellow', schema).valid).toBe(false);
    });

    it('should validate const', () => {
      const schema: JsonSchema = { const: 'fixed' };
      expect(json.validate('fixed', schema).valid).toBe(true);
      expect(json.validate('other', schema).valid).toBe(false);
    });
  });

  describe('composition', () => {
    it('should validate allOf', () => {
      const schema: JsonSchema = {
        allOf: [
          { type: 'object', properties: { a: { type: 'number' } } },
          { type: 'object', properties: { b: { type: 'string' } } },
        ],
      };
      expect(json.validate({ a: 1, b: 'hello' }, schema).valid).toBe(true);
    });

    it('should validate anyOf', () => {
      const schema: JsonSchema = {
        anyOf: [{ type: 'string' }, { type: 'number' }],
      };
      expect(json.validate('hello', schema).valid).toBe(true);
      expect(json.validate(42, schema).valid).toBe(true);
      expect(json.validate(true, schema).valid).toBe(false);
    });

    it('should validate oneOf', () => {
      const schema: JsonSchema = {
        oneOf: [{ type: 'string', minLength: 5 }, { type: 'string', maxLength: 3 }],
      };
      expect(json.validate('abc', schema).valid).toBe(true);
      expect(json.validate('abcdef', schema).valid).toBe(true);
      expect(json.validate('abcd', schema).valid).toBe(false);
    });

    it('should validate not', () => {
      const schema: JsonSchema = { not: { type: 'string' } };
      expect(json.validate(42, schema).valid).toBe(true);
      expect(json.validate('hello', schema).valid).toBe(false);
    });
  });

  describe('compile', () => {
    it('should compile schema for faster validation', () => {
      const schema: JsonSchema = { type: 'string', minLength: 3 };
      const validate = json.compile(schema);

      expect(validate('hello').valid).toBe(true);
      expect(validate('hi').valid).toBe(false);
    });
  });

  describe('is type guard', () => {
    it('should work as type guard', () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: { name: { type: 'string' } },
        required: ['name'],
      };

      const data: unknown = { name: 'John' };

      if (json.is<{ name: string }>(data, schema)) {
        expect(data.name).toBe('John');
      }
    });
  });
});
