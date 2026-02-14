import { describe, it, expect } from 'vitest';
import { json } from '../../src/index';

describe('parse edge cases', () => {
  it('should handle unicode escapes', () => {
    expect(json.parse('"\\u0041"')).toBe('A');
    expect(json.parse('"\\u0030"')).toBe('0');
    expect(json.parse('"\\uD83D\\uDE00"')).toBe('😀');
  });

  it('should handle escape sequences', () => {
    expect(json.parse('"\\b"')).toBe('\b');
    expect(json.parse('"\\f"')).toBe('\f');
    expect(json.parse('"\\n"')).toBe('\n');
    expect(json.parse('"\\r"')).toBe('\r');
    expect(json.parse('"\\t"')).toBe('\t');
    expect(json.parse('"\\""')).toBe('"');
    expect(json.parse('"\\\\"')).toBe('\\');
    expect(json.parse('"\\/"')).toBe('/');
  });

  it('should handle very large numbers', () => {
    expect(json.parse('1e308')).toBe(1e308);
    expect(json.parse('1e-308')).toBe(1e-308);
  });

  it('should handle negative exponents', () => {
    expect(json.parse('1e-5')).toBe(1e-5);
    expect(json.parse('1E-5')).toBe(1e-5);
  });

  it('should handle spaces in objects', () => {
    expect(json.parse('{ "a" : 1 }')).toEqual({ a: 1 });
  });

  it('should handle spaces in arrays', () => {
    expect(json.parse('[ 1 , 2 , 3 ]')).toEqual([1, 2, 3]);
  });

  it('should handle nested structures', () => {
    const input = '{"a":{"b":{"c":[1,2,3]}}}';
    expect(json.parse(input)).toEqual({ a: { b: { c: [1, 2, 3] } } });
  });

  it('should handle mixed arrays', () => {
    expect(json.parse('[1,"a",true,null,{}]')).toEqual([1, 'a', true, null, {}]);
  });

  it('should handle empty strings', () => {
    expect(json.parse('""')).toBe('');
  });

  it('should handle zero', () => {
    expect(json.parse('0')).toBe(0);
    expect(json.parse('-0')).toBe(-0);
  });

  it('should handle negative numbers', () => {
    expect(json.parse('-1')).toBe(-1);
    expect(json.parse('-3.14')).toBe(-3.14);
  });

  it('should handle fractional numbers', () => {
    expect(json.parse('0.5')).toBe(0.5);
    expect(json.parse('123.456')).toBe(123.456);
  });

  it('should throw on trailing comma', () => {
    expect(() => json.parse('{"a":1,}')).toThrow();
    expect(() => json.parse('[1,]')).toThrow();
  });

  it('should throw on missing quotes', () => {
    expect(() => json.parse('{a:1}')).toThrow();
  });

  it('should throw on single quotes', () => {
    expect(() => json.parse("{'a':1}")).toThrow();
  });

  it('should throw on comments', () => {
    expect(() => json.parse('{"a":1/*comment*/}')).toThrow();
    expect(() => json.parse('{"a":1//comment\n}')).toThrow();
  });

  it('should throw on undefined', () => {
    expect(() => json.parse('undefined')).toThrow();
  });

  it('should throw on NaN', () => {
    expect(() => json.parse('NaN')).toThrow();
  });

  it('should throw on Infinity', () => {
    expect(() => json.parse('Infinity')).toThrow();
  });

  it('should throw on invalid number format', () => {
    // Invalid number like just digits with invalid chars
    expect(() => json.parse('123abc')).toThrow();
  });

  it('should throw on malformed true', () => {
    expect(() => json.parse('tru')).toThrow();
    expect(() => json.parse('treu')).toThrow();
    expect(() => json.parse('trXe')).toThrow();
  });

  it('should throw on malformed false', () => {
    expect(() => json.parse('fals')).toThrow();
    expect(() => json.parse('fasle')).toThrow();
    expect(() => json.parse('falXe')).toThrow();
  });

  it('should throw on malformed null', () => {
    expect(() => json.parse('nul')).toThrow();
    expect(() => json.parse('nlll')).toThrow();
    expect(() => json.parse('nuXl')).toThrow();
  });
});
