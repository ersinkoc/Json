import { describe, it, expect } from 'vitest';
import { escapeString, unescapeString, quoteString } from '../../src/utils/escape';

describe('escape - full coverage', () => {
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

    it('should escape carriage returns', () => {
      expect(escapeString('line1\rline2')).toBe('line1\\rline2');
    });

    it('should escape tabs', () => {
      expect(escapeString('col1\tcol2')).toBe('col1\\tcol2');
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

    it('should handle surrogate pairs (emoji) correctly', () => {
      // Emoji should be encoded as single character, not escaped
      expect(escapeString('😀')).toBe('😀');
      expect(escapeString('Hello 😀 World')).toBe('Hello 😀 World');
    });

    it('should escape forward slash', () => {
      expect(escapeString('path/to/file')).toBe('path\\/to\\/file');
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

    it('should unescape carriage returns', () => {
      expect(unescapeString('line1\\rline2')).toBe('line1\rline2');
    });

    it('should unescape tabs', () => {
      expect(unescapeString('col1\\tcol2')).toBe('col1\tcol2');
    });

    it('should unescape backspace', () => {
      expect(unescapeString('test\\b')).toBe('test\b');
    });

    it('should unescape form feed', () => {
      expect(unescapeString('test\\f')).toBe('test\f');
    });

    it('should unescape unicode', () => {
      expect(unescapeString('\\u0041')).toBe('A');
      expect(unescapeString('\\u0030')).toBe('0');
      expect(unescapeString('\\uD83D\\uDE00')).toBe('😀');
    });

    it('should handle unknown escape sequences', () => {
      // Unknown escape after backslash - just return the char
      expect(unescapeString('\\k')).toBe('k');
      expect(unescapeString('\\x')).toBe('x');
      expect(unescapeString('\\z')).toBe('z');
    });

    it('should handle empty string', () => {
      expect(unescapeString('')).toBe('');
    });

    it('should handle string without escapes', () => {
      expect(unescapeString('hello world')).toBe('hello world');
    });

    it('should unescape forward slash', () => {
      expect(unescapeString('path\\/to\\/file')).toBe('path/to/file');
    });
  });

  describe('quoteString', () => {
    it('should quote strings', () => {
      expect(quoteString('hello')).toBe('"hello"');
    });

    it('should quote and escape', () => {
      expect(quoteString('say "hi"')).toBe('"say \\"hi\\""');
    });

    it('should quote empty string', () => {
      expect(quoteString('')).toBe('""');
    });
  });
});
