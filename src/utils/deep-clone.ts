import { isPlainObject, isArray } from './type-checks';

export function deepClone<T>(value: T): T {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  if (isArray(value)) {
    return value.map((item) => deepClone(item)) as T;
  }

  if (isPlainObject(value)) {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(value)) {
      result[key] = deepClone(value[key]);
    }
    return result as T;
  }

  if (value instanceof Date) {
    return new Date(value.getTime()) as T;
  }

  if (value instanceof RegExp) {
    return new RegExp(value.source, value.flags) as T;
  }

  if (value instanceof Map) {
    const result = new Map();
    for (const [k, v] of value) {
      result.set(deepClone(k), deepClone(v));
    }
    return result as T;
  }

  if (value instanceof Set) {
    const result = new Set();
    for (const v of value) {
      result.add(deepClone(v));
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
