import { JsonPathError } from '../errors';
import type { PathSegment } from '../types';

export function parsePath(path: string): PathSegment[] {
  if (!path || path === '') return [];
  
  const segments: PathSegment[] = [];
  let i = 0;
  
  while (i < path.length) {
    const char = path[i];
    
    if (char === '.') {
      i++;
      if (i >= path.length) break;
      
      if (path[i] === '.') {
        i++;
        segments.push('..');
        continue;
      }
      
      let identifier = '';
      while (i < path.length && path[i] !== '.' && path[i] !== '[') {
        identifier += path[i];
        i++;
      }
      if (identifier) {
        segments.push(identifier);
      }
    } else if (char === '[') {
      i++;
      if (i >= path.length) {
        throw new JsonPathError('Unexpected end of path in bracket notation', { path });
      }
      
      if (path[i] === '"' || path[i] === "'") {
        const quote = path[i];
        i++;
        let str = '';
        
        while (i < path.length && path[i] !== quote) {
          if (path[i] === '\\' && i + 1 < path.length) {
            str += path[i + 1];
            i += 2;
          } else {
            str += path[i];
            i++;
          }
        }
        
        if (i >= path.length || path[i] !== quote) {
          throw new JsonPathError('Unterminated string in path', { path });
        }
        i++;
        
        if (i >= path.length || path[i] !== ']') {
          throw new JsonPathError('Expected closing bracket', { path });
        }
        i++;
        
        segments.push(str);
      } else if (path[i] === '*' && i + 1 < path.length && path[i + 1] === ']') {
        i += 2;
        segments.push('*');
      } else {
        let numStr = '';
        
        while (i < path.length && path[i] !== ']') {
          numStr += path[i];
          i++;
        }
        
        if (i >= path.length) {
          throw new JsonPathError('Unterminated bracket notation', { path });
        }
        i++;
        
        const num = parseInt(numStr, 10);
        if (isNaN(num)) {
          segments.push(numStr);
        } else {
          segments.push(num);
        }
      }
    } else {
      let identifier = '';
      while (i < path.length && path[i] !== '.' && path[i] !== '[') {
        identifier += path[i];
        i++;
      }
      if (identifier) {
        segments.push(identifier);
      }
    }
  }
  
  return segments;
}

export function stringifyPath(segments: PathSegment[]): string {
  if (segments.length === 0) return '';
  
  let result = '';
  
  for (const segment of segments) {
    if (segment === '..') {
      result += '..';
    } else if (typeof segment === 'number') {
      result += `[${segment}]`;
    } else if (typeof segment === 'string') {
      if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(segment)) {
        if (result) result += '.';
        result += segment;
      } else {
        result += `["${segment.replace(/"/g, '\\"')}"]`;
      }
    }
  }
  
  return result;
}

export function joinPath(...segments: PathSegment[]): string {
  return stringifyPath(segments);
}

export function isNumericKey(key: string | number): boolean {
  if (typeof key === 'number') return true;
  const num = parseInt(key, 10);
  return !isNaN(num) && String(num) === key && num >= 0;
}
