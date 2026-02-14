import { describe, it, expect, beforeAll } from 'vitest';
import { json } from '../../src/index';
import { repairPlugin } from '../../src/plugins/optional/repair.plugin';

describe('repair plugin', () => {
  beforeAll(() => {
    json.use(repairPlugin);
  });

  describe('trailing commas', () => {
    it('should fix trailing comma in object', () => {
      const input = '{"a": 1, "b": 2,}';
      const repaired = json.repair(input);
      expect(json.parse(repaired)).toEqual({ a: 1, b: 2 });
    });

    it('should fix trailing comma in array', () => {
      const input = '[1, 2, 3,]';
      const repaired = json.repair(input);
      expect(json.parse(repaired)).toEqual([1, 2, 3]);
    });

    it('should fix multiple trailing commas', () => {
      const input = '{"a": [1, 2,], "b": {"c": 1,},}';
      const repaired = json.repair(input);
      expect(json.parse(repaired)).toEqual({ a: [1, 2], b: { c: 1 } });
    });
  });

  describe('single quotes', () => {
    it('should convert single quotes to double quotes', () => {
      const input = "{'name': 'test'}";
      const repaired = json.repair(input);
      expect(json.parse(repaired)).toEqual({ name: 'test' });
    });

    it('should handle nested single quotes', () => {
      const input = "{'a': {'b': 'value'}}";
      const repaired = json.repair(input);
      expect(json.parse(repaired)).toEqual({ a: { b: 'value' } });
    });
  });

  describe('unquoted keys', () => {
    it('should add quotes to unquoted keys', () => {
      const input = '{name: "test", value: 42}';
      const repaired = json.repair(input);
      expect(json.parse(repaired)).toEqual({ name: 'test', value: 42 });
    });

    it('should handle nested unquoted keys', () => {
      const input = '{data: {name: "test"}}';
      const repaired = json.repair(input);
      expect(json.parse(repaired)).toEqual({ data: { name: 'test' } });
    });
  });

  describe('comments', () => {
    it('should remove single-line comments', () => {
      const input = '{"a": 1 // comment\n}';
      const repaired = json.repair(input);
      expect(json.parse(repaired)).toEqual({ a: 1 });
    });

    it('should remove multi-line comments', () => {
      const input = '{"a": /* comment */ 1}';
      const repaired = json.repair(input);
      expect(json.parse(repaired)).toEqual({ a: 1 });
    });

    it('should not remove comments inside strings', () => {
      const input = '{"a": "not // a comment"}';
      const repaired = json.repair(input);
      expect(json.parse(repaired)).toEqual({ a: 'not // a comment' });
    });

    it('should handle escape sequences in strings', () => {
      const input = '{"a": "value with \\"quotes\\" and \\\\ backslashes"}';
      const repaired = json.repair(input);
      expect(json.parse(repaired)).toEqual({ a: 'value with "quotes" and \\ backslashes' });
    });
  });

  describe('complex repairs', () => {
    it('should fix multiple issues at once', () => {
      const input = "{name: 'test', items: [1, 2, 3,], /* todo */ }";
      const repaired = json.repair(input);
      expect(json.parse(repaired)).toEqual({ name: 'test', items: [1, 2, 3] });
    });

    it('should fix unquoted string values', () => {
      const input = '{status: active}';
      const repaired = json.repair(input);
      expect(json.parse(repaired)).toEqual({ status: 'active' });
    });
  });

  describe('valid JSON passthrough', () => {
    it('should not modify valid JSON', () => {
      const input = '{"name": "test", "value": 42}';
      const repaired = json.repair(input);
      expect(repaired).toBe(input);
    });

    it('should handle already valid complex JSON', () => {
      const input = '{"a": [1, 2, 3], "b": {"c": "d"}}';
      const repaired = json.repair(input);
      expect(json.parse(repaired)).toEqual({ a: [1, 2, 3], b: { c: 'd' } });
    });
  });

  describe('unquoted values edge cases', () => {
    it('should fix unquoted boolean values (line 214, 216-220)', () => {
      // Tests lines 214, 216-220: handling boolean values in fixUnquotedValues
      const input = '{active: true, inactive: false}';
      const repaired = json.repair(input);
      expect(json.parse(repaired)).toEqual({ active: true, inactive: false });
    });

    it('should fix unquoted null values (line 252-253)', () => {
      // Tests line 252-253: handling null values
      const input = '{value: null}';
      const repaired = json.repair(input);
      expect(json.parse(repaired)).toEqual({ value: null });
    });

    it('should fix mixed unquoted values (line 216-220)', () => {
      // Tests lines 216-220: handling escape sequences in strings
      const input = '{name: John, age: 30, active: true, value: null}';
      const repaired = json.repair(input);
      expect(json.parse(repaired)).toEqual({ name: 'John', age: 30, active: true, value: null });
    });

    it('should handle identifier not followed by colon (line 214)', () => {
      // Tests line 214: when identifier is not a special value
      const input = '{name: identifier}';
      const repaired = json.repair(input);
      expect(json.parse(repaired)).toEqual({ name: 'identifier' });
    });

    it('should handle unquoted values with whitespace (line 214, 216-220)', () => {
      // Tests handling of whitespace around colons and values
      const input = '{name : John , age : 30}';
      const repaired = json.repair(input);
      expect(json.parse(repaired)).toEqual({ name: 'John', age: 30 });
    });

    it('should handle complex identifier values', () => {
      // Tests that complex identifiers are quoted
      const input = '{name: some_identifier_123}';
      const repaired = json.repair(input);
      expect(json.parse(repaired)).toEqual({ name: 'some_identifier_123' });
    });
  });

  describe('edge cases for all repair functions', () => {
    it('should handle empty strings and values', () => {
      const input = '{empty: "", alsoEmpty: \'\'}';
      const repaired = json.repair(input);
      expect(json.parse(repaired)).toEqual({ empty: '', alsoEmpty: '' });
    });

    it('should handle numeric strings vs actual numbers', () => {
      const input = '{num: 123, str: "123"}';
      const repaired = json.repair(input);
      expect(json.parse(repaired)).toEqual({ num: 123, str: '123' });
    });

    it('should handle nested structures with all issues', () => {
      const input = '{data: {items: [1, 2,], value: test,}, active: true,}';
      const repaired = json.repair(input);
      expect(json.parse(repaired)).toEqual({
        data: { items: [1, 2], value: 'test' },
        active: true,
      });
    });

    it('should handle special characters in keys', () => {
      // Note: fixUnquotedKeys only handles identifiers starting with letter/$/_
      // Keys with dashes are not valid identifiers, so they need to be quoted
      const input = '{key_with_underscore: value2}';
      const repaired = json.repair(input);
      expect(json.parse(repaired)).toEqual({
        key_with_underscore: 'value2',
      });
    });
  });
});
