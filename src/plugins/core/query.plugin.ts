import type { JsonKernel, JsonPlugin, PathSegment } from '../../types';
import { parsePath } from '../../utils/path-parser';
import { deepClone } from '../../utils/deep-clone';
import { isObject, isArray, isUndefined } from '../../utils/type-checks';

function getByPath(value: unknown, segments: PathSegment[]): unknown {
  let current = value;

  for (const segment of segments) {
    if (current === null || current === undefined) {
      return undefined;
    }

    if (isArray(current)) {
      if (typeof segment === 'number' || (typeof segment === 'string' && /^\d+$/.test(segment))) {
        const index = typeof segment === 'number' ? segment : parseInt(segment, 10);
        current = current[index];
      } else {
        return undefined;
      }
    } else if (isObject(current)) {
      current = current[segment as string];
    } else {
      return undefined;
    }
  }

  return current;
}

function setByPath(value: unknown, segments: PathSegment[], newValue: unknown): unknown {
  if (segments.length === 0) {
    return newValue;
  }

  const cloned = deepClone(value);
  
  function setRecursive(current: unknown, segs: PathSegment[]): unknown {
    if (segs.length === 0) {
      return newValue;
    }

    const [segment, ...rest] = segs;
    const isNumeric = typeof segment === 'number' || (typeof segment === 'string' && /^\d+$/.test(segment));
    const index = typeof segment === 'number' ? segment : isNumeric ? parseInt(segment as string, 10) : -1;

    if (isNumeric && index >= 0) {
      const arr = isArray(current) ? [...current] : [];
      if (rest.length === 0) {
        arr[index] = newValue;
      } else {
        arr[index] = setRecursive(arr[index], rest);
      }
      return arr;
    }

    if (isObject(current) || current === null || current === undefined) {
      const obj = isObject(current) ? { ...current } : {};
      if (rest.length === 0) {
        (obj as Record<string, unknown>)[segment as string] = newValue;
      } else {
        (obj as Record<string, unknown>)[segment as string] = setRecursive(
          (obj as Record<string, unknown>)[segment as string],
          rest
        );
      }
      return obj;
    }

    return current;
  }

  return setRecursive(cloned, segments);
}

function hasByPath(value: unknown, segments: PathSegment[]): boolean {
  let current = value;

  for (const segment of segments) {
    if (current === null || current === undefined) {
      return false;
    }

    if (isArray(current)) {
      if (typeof segment === 'number' || (typeof segment === 'string' && /^\d+$/.test(segment))) {
        const index = typeof segment === 'number' ? segment : parseInt(segment, 10);
        if (index < 0 || index >= current.length) {
          return false;
        }
        current = current[index];
      } else {
        return false;
      }
    } else if (isObject(current)) {
      if (!(segment as string in current)) {
        return false;
      }
      current = current[segment as string];
    } else {
      return false;
    }
  }

  return true;
}

function removeByPath(value: unknown, segments: PathSegment[]): unknown {
  if (segments.length === 0) {
    return undefined;
  }

  const cloned = deepClone(value);
  
  function removeRecursive(current: unknown, segs: PathSegment[]): unknown {
    if (segs.length === 0) {
      return current;
    }

    const [segment, ...rest] = segs;

    if (rest.length === 0) {
      if (isArray(current)) {
        const index = typeof segment === 'number' ? segment : parseInt(segment as string, 10);
        if (!isNaN(index) && index >= 0 && index < current.length) {
          return [...current.slice(0, index), ...current.slice(index + 1)];
        }
        return current;
      }

      if (isObject(current)) {
        const result = { ...current };
        delete result[segment as string];
        return result;
      }

      return current;
    }

    if (isArray(current)) {
      const index = typeof segment === 'number' ? segment : parseInt(segment as string, 10);
      if (!isNaN(index) && index >= 0 && index < current.length) {
        const result = [...current];
        result[index] = removeRecursive(result[index], rest);
        return result;
      }
      return current;
    }

    if (isObject(current)) {
      const result = { ...current };
      result[segment as string] = removeRecursive(result[segment as string], rest);
      return result;
    }

    return current;
  }

  return removeRecursive(cloned, segments);
}

function collectPaths(value: unknown, prefix: string = ''): string[] {
  const paths: string[] = [];

  if (prefix) {
    paths.push(prefix);
  }

  if (isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const path = prefix ? `${prefix}[${i}]` : `[${i}]`;
      paths.push(...collectPaths(value[i], path));
    }
  } else if (isObject(value)) {
    for (const key of Object.keys(value)) {
      const path = prefix ? (/[a-zA-Z_$][a-zA-Z0-9_$]*/.test(key) ? `${prefix}.${key}` : `${prefix}["${key}"]`) : key;
      paths.push(...collectPaths(value[key], path));
    }
  }

  return paths;
}

export function createQueryPlugin(): JsonPlugin {
  return {
    name: 'query',
    version: '1.0.0',

    install(kernel: JsonKernel) {
      /** @example
       * ```ts
       * import { json } from '@oxog/json';
       *
       * // Get nested property
       * json.get({ user: { name: 'John' } }, 'user.name');
       * // => 'John'
       *
       * // Array access
       * json.get({ items: [{ id: 1 }] }, 'items[0].id');
       * // => 1
       *
       * // With fallback
       * json.get({ user: {} }, 'user.name', 'Anonymous');
       * // => 'Anonymous'
       * ```
       */
      kernel.register('get', (obj: unknown, path: string, fallback?: unknown): unknown => {
        const segments = parsePath(path);
        const result = getByPath(obj, segments);
        return isUndefined(result) ? fallback : result;
      });

      /** @example
       * ```ts
       * import { json } from '@oxog/json';
       *
       * // Set nested property
       * json.set({ user: {} }, 'user.name', 'John');
       * // => { user: { name: 'John' } }
       *
       * // Array index
       * json.set({ items: [] }, 'items[0]', { id: 1 });
       * // => { items: [{ id: 1 }] }
       *
       * // Create nested path
       * json.set({}, 'a.b.c', 'value');
       * // => { a: { b: { c: 'value' } } }
       * ```
       */
      kernel.register('set', (obj: unknown, path: string, value: unknown): unknown => {
        const segments = parsePath(path);
        return setByPath(obj, segments, value);
      });

      /** @example
       * ```ts
       * import { json } from '@oxog/json';
       *
       * json.has({ user: { name: 'John' } }, 'user.name');
       * // => true
       *
       * json.has({ user: {} }, 'user.age');
       * // => false
       *
       * json.has({ items: [1, 2, 3] }, 'items[2]');
       * // => true
       * ```
       */
      kernel.register('has', (obj: unknown, path: string): boolean => {
        const segments = parsePath(path);
        return hasByPath(obj, segments);
      });

      /** @example
       * ```ts
       * import { json } from '@oxog/json';
       *
       * json.remove({ user: { name: 'John', age: 30 } }, 'user.age');
       * // => { user: { name: 'John' } }
       *
       * json.remove({ items: [1, 2, 3] }, 'items[1]');
       * // => { items: [1, 3] }
       * ```
       */
      kernel.register('remove', (obj: unknown, path: string): unknown => {
        const segments = parsePath(path);
        return removeByPath(obj, segments);
      });

      /** @example
       * ```ts
       * import { json } from '@oxog/json';
       *
       * json.paths({ user: { name: 'John', age: 30 } });
       * // => ['user', 'user.name', 'user.age']
       *
       * json.paths({ items: [{ id: 1 }, { id: 2 }] });
       * // => ['items', 'items[0]', 'items[0].id', 'items[1]', 'items[1].id']
       * ```
       */
      kernel.register('paths', (obj: unknown): string[] => {
        return collectPaths(obj);
      });
    },
  };
}

export const queryPlugin = createQueryPlugin();
