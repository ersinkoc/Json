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
});
