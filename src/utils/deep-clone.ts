import { isPlainObject, isArray } from './type-checks';

export function deepClone<T>(value: T): T {
  return deepCloneWithVisited(value, new WeakMap());
}

function deepCloneWithVisited<T>(value: T, visited: WeakMap<object, unknown>): T {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  // Check for circular references
  if (visited.has(value as object)) {
    return visited.get(value as object) as T;
  }

  if (isArray(value)) {
    const result: unknown[] = [];
    visited.set(value as object, result);
    for (let i = 0; i < value.length; i++) {
      result[i] = deepCloneWithVisited(value[i], visited);
    }
    return result as T;
  }

  if (isPlainObject(value)) {
    const result: Record<string, unknown> = {};
    visited.set(value as object, result);
    for (const key of Object.keys(value)) {
      result[key] = deepCloneWithVisited(value[key], visited);
    }
    return result as T;
  }

  if (value instanceof Date) {
    const result = new Date(value.getTime());
    visited.set(value as object, result);
    return result as T;
  }

  if (value instanceof RegExp) {
    const result = new RegExp(value.source, value.flags);
    visited.set(value as object, result);
    return result as T;
  }

  if (value instanceof Map) {
    const result = new Map();
    visited.set(value as object, result);
    for (const [k, v] of value) {
      result.set(deepCloneWithVisited(k, visited), deepCloneWithVisited(v, visited));
    }
    return result as T;
  }

  if (value instanceof Set) {
    const result = new Set();
    visited.set(value as object, result);
    for (const v of value) {
      result.add(deepCloneWithVisited(v, visited));
    }
    return result as T;
  }

  return value;
}

export function shallowClone<T>(value: T): T {
  if (isArray(value)) {
    return [...value] as T;
  }
  if (isPlainObject(value)) {
    return { ...value } as T;
  }
  return value;
}
