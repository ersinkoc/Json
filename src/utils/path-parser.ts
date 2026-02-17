import { JsonPathError } from '../errors';
import type { PathSegment } from '../types';

export function parsePath(path: string): PathSegment[] {
  if (!path || path === '') return [];

  const segments: PathSegment[] = [];
  let i = 0;
  const len = path.length;

  while (i < len) {
    const char = path[i];

    if (char === '.') {
      i++;
      if (i >= len) break;

      if (path[i] === '.') {
        i++;
        segments.push('..');
        continue;
      }

      const chars: string[] = [];
      while (i < len && path[i] !== '.' && path[i] !== '[') {
        const c = path[i];
        if (c) chars.push(c);
        i++;
      }
      const identifier = chars.join('');
      if (identifier) {
        segments.push(identifier);
      }
    } else if (char === '[') {
      i++;
      if (i >= len) {
        throw new JsonPathError('Unexpected end of path in bracket notation', { path });
      }

      const bracketChar = path[i];
      if (bracketChar === '"' || bracketChar === "'") {
        const quote = bracketChar;
        i++;
        const chars: string[] = [];

        while (i < len && path[i] !== quote) {
          if (path[i] === '\\' && i + 1 < len) {
            const nextChar = path[i + 1];
            if (nextChar) chars.push(nextChar);
            i += 2;
          } else {
            const c = path[i];
            if (c) chars.push(c);
            i++;
          }
        }

        if (i >= len || path[i] !== quote) {
          throw new JsonPathError('Unterminated string in path', { path });
        }
        i++;

        if (i >= len || path[i] !== ']') {
          throw new JsonPathError('Expected closing bracket', { path });
        }
        i++;

        segments.push(chars.join(''));
      } else if (bracketChar === '*' && i + 1 < len && path[i + 1] === ']') {
        i += 2;
        segments.push('*');
      } else {
        const chars: string[] = [];

        while (i < len && path[i] !== ']') {
          const c = path[i];
          if (c) chars.push(c);
          i++;
        }

        if (i >= len) {
          throw new JsonPathError('Unterminated bracket notation', { path });
        }
        i++;

        const numStr = chars.join('');
        const num = parseInt(numStr, 10);
        if (isNaN(num)) {
          segments.push(numStr);
        } else {
          segments.push(num);
        }
      }
    } else {
      const chars: string[] = [];
      while (i < len && path[i] !== '.' && path[i] !== '[') {
        const c = path[i];
        if (c) chars.push(c);
        i++;
      }
      const identifier = chars.join('');
      if (identifier) {
        segments.push(identifier);
      }
    }
  }

  return segments;
}

const SAFE_IDENTIFIER_REGEX = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
const ESCAPE_QUOTE_REGEX = /"/g;

export function stringifyPath(segments: PathSegment[]): string {
  if (segments.length === 0) return '';

  const parts: string[] = [];

  for (const segment of segments) {
    if (segment === '..') {
      parts.push('..');
    } else if (typeof segment === 'number') {
      parts.push(`[${segment}]`);
    } else if (typeof segment === 'string') {
      if (SAFE_IDENTIFIER_REGEX.test(segment)) {
        if (parts.length > 0) parts.push('.');
        parts.push(segment);
      } else {
        parts.push(`["${segment.replace(ESCAPE_QUOTE_REGEX, '\\"')}"]`);
      }
    }
  }

  return parts.join('');
}

export function joinPath(...segments: PathSegment[]): string {
  return stringifyPath(segments);
}

export function isNumericKey(key: string | number): boolean {
  if (typeof key === 'number') return true;
  const num = parseInt(key, 10);
  return !isNaN(num) && String(num) === key && num >= 0;
}
