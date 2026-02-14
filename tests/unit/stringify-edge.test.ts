import { describe, it, expect } from 'vitest';
import { json } from '../../src/index';

describe('stringify edge cases', () => {
  it('should handle special numbers', () => {
    expect(json.stringify(NaN)).toBe('null');
    expect(json.stringify(Infinity)).toBe('null');
    expect(json.stringify(-Infinity)).toBe('null');
  });

  it('should handle undefined values in objects', () => {
    expect(json.stringify({ a: 1, b: undefined })).toBe('{"a":1}');
  });

  it('should handle undefined values in arrays', () => {
    expect(json.stringify([1, undefined, 3])).toBe('[1,null,3]');
  });

  it('should handle null values', () => {
    expect(json.stringify(null)).toBe('null');
  });

  it('should handle boolean values', () => {
    expect(json.stringify(true)).toBe('true');
    expect(json.stringify(false)).toBe('false');
  });

  it('should handle functions (converted to null)', () => {
    expect(json.stringify(() => {})).toBe('null');
  });

  it('should handle symbols (converted to null)', () => {
    expect(json.stringify(Symbol('test'))).toBe('null');
  });

  it('should handle Date objects', () => {
    const date = new Date('2024-01-01T00:00:00.000Z');
    expect(json.stringify({ date })).toContain('2024-01-01T00:00:00.000Z');
  });

  it('should handle RegExp objects', () => {
    expect(json.stringify(/test/gi)).toBe('"/test/gi"');
  });

  it('should handle Map objects', () => {
    const map = new Map([['a', 1]]);
    expect(json.stringify(map)).toBe('[["a",1]]');
  });

  it('should handle Set objects', () => {
    const set = new Set([1, 2, 3]);
    expect(json.stringify(set)).toBe('[1,2,3]');
  });

  it('should handle Error objects', () => {
    const error = new Error('test error');
    expect(json.stringify(error)).toBe('"test error"');
  });

  it('should escape control characters', () => {
    expect(json.stringify('test\x00')).toBe('"test\\u0000"');
    expect(json.stringify('test\x1f')).toBe('"test\\u001f"');
  });

  it('should handle unicode in strings', () => {
    expect(json.stringify('😀')).toBe('"😀"');
    expect(json.stringify('日本語')).toBe('"日本語"');
  });

  it('should handle empty objects', () => {
    expect(json.stringify({})).toBe('{}');
  });

  it('should handle empty arrays', () => {
    expect(json.stringify([])).toBe('[]');
  });

  it('should handle nested empty structures', () => {
    expect(json.stringify({ a: {}, b: [] })).toBe('{"a":{},"b":[]}');
  });

  it('should handle bigint', () => {
    expect(json.stringify(BigInt(123))).toBe('123');
  });

  it('should sort keys when sortKeys is true', () => {
    expect(json.stringify({ c: 3, a: 1, b: 2 }, { sortKeys: true })).toBe('{"a":1,"b":2,"c":3}');
  });

  it('should handle indent with string', () => {
    const result = json.stringify({ a: 1 }, { indent: '  ' });
    expect(result).toBe('{\n  "a": 1\n}');
  });

  it('should handle indent with number', () => {
    const result = json.stringify({ a: 1 }, { indent: 4 });
    expect(result).toBe('{\n    "a": 1\n}');
  });
});
