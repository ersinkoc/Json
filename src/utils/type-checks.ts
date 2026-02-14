export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (!isObject(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === null || proto === Object.prototype;
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isNull(value: unknown): value is null {
  return value === null;
}

export function isUndefined(value: unknown): value is undefined {
  return value === undefined;
}

export function isPrimitive(value: unknown): value is string | number | boolean | null {
  return isString(value) || isNumber(value) || isBoolean(value) || isNull(value);
}

export function isInteger(value: unknown): value is number {
  return isNumber(value) && Number.isInteger(value);
}

export function isFinite(value: unknown): value is number {
  return isNumber(value) && Number.isFinite(value);
}

export function isSafeInteger(value: unknown): value is number {
  return isNumber(value) && Number.isSafeInteger(value);
}

export function isJsonValue(value: unknown): boolean {
  if (isNull(value) || isString(value) || isBoolean(value)) return true;
  if (isNumber(value)) return Number.isFinite(value);
  if (isArray(value)) return value.every(isJsonValue);
  if (isPlainObject(value)) {
    return Object.values(value).every(isJsonValue);
  }
  return false;
}

export function getType(value: unknown): string {
  if (isNull(value)) return 'null';
  if (isArray(value)) return 'array';
  return typeof value;
}
