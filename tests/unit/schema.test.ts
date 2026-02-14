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

    it('should validate format - hostname', () => {
      const schema: JsonSchema = { type: 'string', format: 'hostname' };
      expect(json.validate('example.com', schema).valid).toBe(true);
      expect(json.validate('.invalid.com', schema).valid).toBe(false);
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

  describe('format validation', () => {
    it('should validate format - email', () => {
      const schema: JsonSchema = { type: 'string', format: 'email' };
      expect(json.validate('test@example.com', schema).valid).toBe(true);
      expect(json.validate('invalid-email', schema).valid).toBe(false);
    });

    it('should validate format - hostname', () => {
      const schema: JsonSchema = { type: 'string', format: 'hostname' };
      expect(json.validate('example.com', schema).valid).toBe(true);
      expect(json.validate('.invalid.com', schema).valid).toBe(false);
    });

    it('should validate format - date', () => {
      const schema: JsonSchema = { type: 'string', format: 'date' };
      expect(json.validate('2024-01-01', schema).valid).toBe(true);
      expect(json.validate('2024-13-01', schema).valid).toBe(false);
    });

    it('should validate format - date-time', () => {
      const schema: JsonSchema = { type: 'string', format: 'date-time' };
      expect(json.validate('2024-01-01T00:00:00Z', schema).valid).toBe(true);
      // Date-time without timezone (Z or offset) should be invalid per RFC 3339
      expect(json.validate('2024-01-01T00:00:00', schema).valid).toBe(false);
    });

    it('should validate format - uuid', () => {
      const schema: JsonSchema = { type: 'string', format: 'uuid' };
      // Standard UUID format: 8-4-4-4-12 hex digits
      expect(json.validate('a0eebc99-9c0b-4ef8-bb6d-6bb9bd480a4c', schema).valid).toBe(true);
      expect(json.validate('a0eebc99-9c0b-4ef8-bb6d-6bb9-bd480-a4c6-d2cd26190a', schema).valid).toBe(false); // Too many hyphens
      expect(json.validate('not-a-uuid', schema).valid).toBe(false);
    });

    it('should validate format - regex', () => {
      const schema: JsonSchema = { type: 'string', format: 'regex' };
      expect(json.validate('^[a-z]+$', schema).valid).toBe(true);
      expect(json.validate('[invalid', schema).valid).toBe(false);
    });

    it('should validate format - hostname', () => {
      const schema: JsonSchema = { type: 'string', format: 'hostname' };
      expect(json.validate('example.com', schema).valid).toBe(true);
      expect(json.validate('.invalid.com', schema).valid).toBe(false);
    });

    it('should validate format - ipv4', () => {
      const schema: JsonSchema = { type: 'string', format: 'ipv4' };
      expect(json.validate('127.0.0.1', schema).valid).toBe(true);
      expect(json.validate('256.0.0.1', schema).valid).toBe(false);
    });

    it('should validate format - ipv6', () => {
      const schema: JsonSchema = { type: 'string', format: 'ipv6' };
      expect(json.validate('2001:db8::1', schema).valid).toBe(true);
      expect(json.validate('2001::db8::1', schema).valid).toBe(false);
    });
  });

  describe('patternProperties validation', () => {
    it('should validate patternProperties', () => {
      const schema: JsonSchema = {
        type: 'object',
        // No properties defined - all validation via patternProperties
        patternProperties: {
          '^test_': { type: 'string' },
          '^\\d+$': { type: 'number' }
        }
      };
      // test_name matches '^test_' (string), 123 matches '^\\d+$' (number) - both valid
      expect(json.validate({ test_name: 'value', other_key: 123 }, schema).valid).toBe(true);
      // test_name matches '^test_' but value is number - invalid
      expect(json.validate({ test_name: 123 }, schema).valid).toBe(false);
      // 456 matches '^\\d+$' but value is string - invalid
      expect(json.validate({ 456: 'invalid' }, schema).valid).toBe(false);
    });

    it('should validate patternProperties with properties', () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          // Explicitly defined properties take precedence
          name: { type: 'string' }
        },
        patternProperties: {
          // Keys matching this pattern but not in properties must be strings
          '^test_': { type: 'string' }
        }
      };
      // name is in properties (string), test_foo matches pattern (string) - valid
      expect(json.validate({ name: 'John', test_foo: 'bar' }, schema).valid).toBe(true);
      // test_foo matches pattern but value is number - invalid
      expect(json.validate({ name: 'John', test_foo: 123 }, schema).valid).toBe(false);
    });
  });

  describe('if/then/else validation', () => {
    it('should validate if/then conditional', () => {
      const schema: JsonSchema = {
        if: {
          type: 'object',
          properties: {
            if: { const: 'yes' }
          },
          required: ['if']
        },
        then: {
          type: 'object',
          properties: {
            result: { type: 'string' }
          },
          required: ['result']
        }
      };
      // if condition matches (has property 'if' with value 'yes'), then applies (result required as string)
      expect(json.validate({ if: 'yes', result: 'value' }, schema).valid).toBe(true);
      // if condition doesn't match, but no else clause, so it should pass (no additional constraints)
      expect(json.validate({ if: 'no', result: 'value' }, schema).valid).toBe(true);
    });

    it('should validate if/else conditional', () => {
      const schema: JsonSchema = {
        if: {
          type: 'object',
          properties: {
            if: { const: 'yes' }
          },
          required: ['if']
        },
        then: {
          type: 'object',
          properties: {
            result: { type: 'string' }
          },
          required: ['result']
        },
        else: {
          type: 'object',
          properties: {
            result: { type: 'number' }
          },
          required: ['result']
        }
      };
      // if matches, then applies (result must be string)
      expect(json.validate({ if: 'yes', result: 'value' }, schema).valid).toBe(true);
      // if doesn't match, else applies (result must be number)
      expect(json.validate({ if: 'no', result: 123 }, schema).valid).toBe(true);
    });
  });

  describe('contains validation for arrays', () => {
    it('should validate contains for arrays', () => {
      const schema: JsonSchema = {
        type: 'array',
        contains: { const: 'found' }
      };
      expect(json.validate(['a', 'found', 'b'], schema).valid).toBe(true);
      expect(json.validate(['a', 'b'], schema).valid).toBe(false);
    });
  });

  describe('exclusiveMaximum validation', () => {
    it('should validate exclusiveMaximum', () => {
      const schema: JsonSchema = { type: 'number', exclusiveMaximum: 100 };
      expect(json.validate(99, schema).valid).toBe(true);
      expect(json.validate(100, schema).valid).toBe(false);
    });
  });

  describe('additionalProperties validation', () => {
    it('should validate additionalProperties with schema', () => {
      const schema: JsonSchema = {
        type: 'object',
        properties: { name: { type: 'string' } },
        additionalProperties: { type: 'number' }
      };
      // name is in properties (string), age is additional but matches additionalProperties (number)
      expect(json.validate({ name: 'John', age: 30 }, schema).valid).toBe(true);
      // name is in properties (string), extra is additional but doesn't match additionalProperties (string vs number)
      expect(json.validate({ name: 'John', age: 30, extra: 'data' }, schema).valid).toBe(false);
    });
  });

  describe('additionalProperties with patternProperties', () => {
    it('should validate additionalProperties with patternProperties', () => {
      const schema: JsonSchema = {
        type: 'object',
        patternProperties: {
          '^test_': { type: 'string' }
        }
      };
      expect(json.validate({ test_1: 'value', other: 'data' }, schema).valid).toBe(true);
    });
  });

  describe('null type validation with constraints', () => {
    it('should validate null with minLength', () => {
      const schema: JsonSchema = { type: 'null', minLength: 5 };
      expect(json.validate(null, schema).valid).toBe(true);
    });

    it('should validate null with maxLength', () => {
      const schema: JsonSchema = { type: 'null', maxLength: 5 };
      expect(json.validate(null, schema).valid).toBe(true);
    });

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
