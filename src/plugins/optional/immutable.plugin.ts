import type { JsonKernel, JsonPlugin, PathSegment } from '../../types';
import { isObject, isArray } from '../../utils';
import { parsePath } from '../../utils/path-parser';

function deepFreeze<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (isArray(obj)) {
    Object.freeze(obj);
    for (const item of obj) {
      deepFreeze(item);
    }
  } else if (isObject(obj)) {
    Object.freeze(obj);
    for (const key of Object.keys(obj)) {
      deepFreeze(obj[key]);
    }
  }

  return obj;
}

function isFrozen(obj: unknown): boolean {
  if (obj === null || typeof obj !== 'object') {
    return true;
  }
  return Object.isFrozen(obj);
}

function immutableSetByPath(
  value: unknown,
  segments: PathSegment[],
  newValue: unknown
): unknown {
  if (segments.length === 0) {
    return newValue;
  }

  const [segment, ...rest] = segments;
  const isNumeric = typeof segment === 'number' || (typeof segment === 'string' && /^\d+$/.test(segment));
  const index = typeof segment === 'number' ? segment : isNumeric ? parseInt(segment as string, 10) : -1;

  if (isNumeric && index >= 0) {
    if (!isArray(value)) {
      const arr: unknown[] = [];
      arr[index] = immutableSetByPath(undefined, rest, newValue);
      return Object.freeze(arr);
    }

    const arr = [...value];
    if (rest.length === 0) {
      arr[index] = newValue;
    } else {
      arr[index] = immutableSetByPath(arr[index], rest, newValue);
    }
    return Object.freeze(arr);
  }

  if (isObject(value) || value === null || value === undefined) {
    const obj = value ? { ...value } : {};
    if (rest.length === 0) {
      (obj as Record<string, unknown>)[segment as string] = newValue;
    } else {
      (obj as Record<string, unknown>)[segment as string] = immutableSetByPath(
        (obj as Record<string, unknown>)[segment as string],
        rest,
        newValue
      );
    }
    return Object.freeze(obj);
  }

  return value;
}

function immutableRemoveByPath(value: unknown, segments: PathSegment[]): unknown {
  if (segments.length === 0) {
    return undefined;
  }

  const [segment, ...rest] = segments;

  if (rest.length === 0) {
    if (isArray(value)) {
      const index = typeof segment === 'number' ? segment : parseInt(segment as string, 10);
      if (!isNaN(index) && index >= 0 && index < value.length) {
        const arr = [...value.slice(0, index), ...value.slice(index + 1)];
        return Object.freeze(arr);
      }
      return value;
    }

    if (isObject(value)) {
      const result = { ...value };
      delete result[segment as string];
      return Object.freeze(result);
    }

    return value;
  }

  if (isArray(value)) {
    const index = typeof segment === 'number' ? segment : parseInt(segment as string, 10);
    if (!isNaN(index) && index >= 0 && index < value.length) {
      const arr = [...value];
      arr[index] = immutableRemoveByPath(arr[index], rest);
      return Object.freeze(arr);
    }
    return value;
  }

  if (isObject(value)) {
    const result = { ...value };
    result[segment as string] = immutableRemoveByPath(result[segment as string], rest);
    return Object.freeze(result);
  }

  return value;
}

function deepClone<T>(value: T): T {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  if (isArray(value)) {
    return value.map((item) => deepClone(item)) as T;
  }

  if (isObject(value)) {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(value)) {
      result[key] = deepClone(value[key]);
    }
    return result as T;
  }

  return value;
}

export function createImmutablePlugin(): JsonPlugin {
  return {
    name: 'immutable',
    version: '1.0.0',

    install(kernel: JsonKernel) {
      kernel.register('freeze', <T>(obj: T): T => {
        return deepFreeze(obj);
      });

      kernel.register('immutableSet', (obj: unknown, path: string, value: unknown): unknown => {
        const segments = parsePath(path);
        return immutableSetByPath(obj, segments, value);
      });

      kernel.register('immutableRemove', (obj: unknown, path: string): unknown => {
        const segments = parsePath(path);
        return immutableRemoveByPath(obj, segments);
      });

      kernel.register('clone', <T>(obj: T): T => {
        return deepClone(obj);
      });

      kernel.register('isFrozen', (obj: unknown): boolean => {
        return isFrozen(obj);
      });
    },
  };
}

export const immutablePlugin = createImmutablePlugin();
