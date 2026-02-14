import { describe, it, expect } from 'vitest';
import { escapeString, unescapeString, quoteString } from '../../src/utils/escape';

describe('escape', () => {
  describe('escapeString', () => {
    it('should escape double quotes', () => {
      expect(escapeString('say "hi"')).toBe('say \\"hi\\"');
    });

    it('should escape backslashes', () => {
      expect(escapeString('path\\to\\file')).toBe('path\\\\to\\\\file');
    });

    it('should escape newlines', () => {
      expect(escapeString('line1\nline2')).toBe('line1\\nline2');
    });

    it('should escape tabs', () => {
      expect(escapeString('col1\tcol2')).toBe('col1\\tcol2');
    });

    it('should escape carriage returns', () => {
      expect(escapeString('line1\r\nline2')).toBe('line1\\r\\nline2');
    });

    it('should escape backspace', () => {
      expect(escapeString('test\b')).toBe('test\\b');
    });

    it('should escape form feed', () => {
      expect(escapeString('test\f')).toBe('test\\f');
    });

    it('should escape control characters', () => {
      expect(escapeString('test\x00')).toBe('test\\u0000');
      expect(escapeString('test\x1f')).toBe('test\\u001f');
    });

    it('should handle empty string', () => {
      expect(escapeString('')).toBe('');
    });

    it('should not escape normal characters', () => {
      expect(escapeString('hello world')).toBe('hello world');
    });
  });

  describe('unescapeString', () => {
    it('should unescape double quotes', () => {
      expect(unescapeString('say \\"hi\\"')).toBe('say "hi"');
    });

    it('should unescape backslashes', () => {
      expect(unescapeString('path\\\\to\\\\file')).toBe('path\\to\\file');
    });

    it('should unescape newlines', () => {
      expect(unescapeString('line1\\nline2')).toBe('line1\nline2');
    });

    it('should unescape tabs', () => {
      expect(unescapeString('col1\\tcol2')).toBe('col1\tcol2');
    });

    it('should unescape carriage returns', () => {
      expect(unescapeString('line1\\r\\nline2')).toBe('line1\r\nline2');
    });

    it('should unescape unicode', () => {
      expect(unescapeString('\\u0041')).toBe('A');
      expect(unescapeString('\\u0030')).toBe('0');
    });

    it('should handle empty string', () => {
      expect(unescapeString('')).toBe('');
    });

    it('should handle string without escapes', () => {
      expect(unescapeString('hello world')).toBe('hello world');
    });

    it('should handle lone backslash at end', () => {
      expect(unescapeString('test\\')).toBe('test\\');
    });

    it('should handle invalid unicode escape (incomplete)', () => {
      // When \u is not followed by 4 hex chars, it's treated as literal
      // \u with only 2 hex digits is treated as literal \u followed by those digits
      // Implementation returns \u followed by digits (e.g., \u123G becomes \u123G)
      const result = unescapeString('\\u123G');
      expect(result).toBe('\\u123G'); // Not a valid unicode escape, returned as-is
    });

    it('should handle surrogate pairs (emoji)', () => {
      // Smiling face emoji (U+1F600) = D83D DE00
      expect(unescapeString('\\uD83D\\uDE00')).toBe('😀');
      expect(unescapeString('\\uD83D')).toBe('\\uD83D'); // Unpaired high surrogate (escape adds backslash)
    });

    it('should handle unpaired high surrogate', () => {
      expect(unescapeString('\\uD83D')).toBe('\uD83D');
    });

    it('should handle unpaired low surrogate', () => {
      expect(unescapeString('\\uDC00')).toBe('\uDC00');
    });

    it('should handle mixed surrogate and normal chars', () => {
      expect(unescapeString('A\\uD83D\\uDE00B')).toBe('A😀B');
    });

    it('should escape high surrogate without low surrogate (lines 34-45)', () => {
      // Tests lines 34-45: high surrogate (0xD800-0xDBFF) without following low surrogate
      const result = escapeString('\uD83D');
      expect(result).toContain('\\uD83D');
    });

    it('should handle invalid unicode sequence (lines 79-81)', () => {
      // Tests lines 79-81: invalid \u sequence (not followed by valid hex)
      const result = unescapeString('\\u123G');
      expect(result).toBe('\\u123G'); // Returns original if invalid
    });

    it('should handle incomplete unicode escape (lines 79-81)', () => {
      // Tests lines 79-81: \u followed by insufficient hex digits
      // \u with only 2 hex digits is treated as literal \u followed by those digits
      const result = unescapeString('\\u12');
      expect(result).toBe('u12');
    });
  });

  describe('quoteString', () => {
    it('should quote strings', () => {
      expect(quoteString('hello')).toBe('"hello"');
    });

    it('should quote and escape', () => {
      expect(quoteString('say "hi"')).toBe('"say \\"hi\\""');
    });
  });
});
