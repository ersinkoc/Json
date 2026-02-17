import type { JsonKernel, JsonPlugin, StringifyOptions } from '../../types';
import { CircularReferenceError } from '../../errors';
import { isArray } from '../../utils';

class Stringifier {
  private seen: WeakMap<object, number> = new WeakMap();
  private path: object[] = [];
  private indent: string;
  private currentIndent = '';
  private circular: string | false;
  private replacer?: ((key: string, value: unknown) => unknown) | undefined;
  private sortKeys: boolean;

  constructor(options: StringifyOptions = {}) {
    this.indent = typeof options.indent === 'number' 
      ? ' '.repeat(options.indent) 
      : options.indent ?? '';
    this.circular = options.circular ?? false;
    this.replacer = options.replacer;
    this.sortKeys = options.sortKeys ?? false;
  }

  stringify(value: unknown): string {
    const result = this.process('', value);
    return result;
  }

  private process(key: string, value: unknown): string {
    if (this.replacer) {
      value = this.replacer(key, value);
    }

    // Combine null and undefined checks
    if (value === null || value === undefined) return 'null';

    switch (typeof value) {
      case 'string':
        return this.stringifyString(value);
      case 'number':
        if (!Number.isFinite(value)) return 'null';
        return String(value);
      case 'boolean':
        return value ? 'true' : 'false';
      case 'bigint':
        return String(value);
      case 'object':
        return this.stringifyObject(value);
      default:
        return 'null';
    }
  }

  private stringifyString(str: string): string {
    const chars: string[] = ['"'];
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      const code = str.charCodeAt(i);

      switch (ch) {
        case '"': chars.push('\\"'); break;
        case '\\': chars.push('\\\\'); break;
        case '\b': chars.push('\\b'); break;
        case '\f': chars.push('\\f'); break;
        case '\n': chars.push('\\n'); break;
        case '\r': chars.push('\\r'); break;
        case '\t': chars.push('\\t'); break;
        default:
          if (code < 0x20) {
            chars.push(`\\u${code.toString(16).padStart(4, '0')}`);
          } else if (ch) {
            chars.push(ch);
          }
      }
    }
    chars.push('"');
    return chars.join('');
  }

  private checkCircular(obj: object): string | null {
    if (this.seen.has(obj)) {
      if (this.circular === false) {
        throw new CircularReferenceError({ path: this.getPathString() });
      }
      return this.circular;
    }
    this.seen.set(obj, this.path.length);
    return null;
  }

  private getPathString(): string {
    return this.path.map(p => {
      if (isArray(p)) return '[...]';
      return '.' + Object.keys(p)[0];
    }).join('');
  }

  private stringifyObject(value: object): string {
    if (isArray(value)) {
      return this.stringifyArray(value);
    }

    if (value instanceof Date) {
      return this.stringifyString(value.toISOString());
    }

    if (value instanceof Error) {
      return this.stringifyString(value.message);
    }

    if (value instanceof RegExp) {
      return this.stringifyString(value.toString());
    }

    if (value instanceof Map || value instanceof Set) {
      const arr = Array.from(value);
      return this.stringifyArray(arr);
    }

    return this.stringifyPlainObject(value as Record<string, unknown>);
  }

  private stringifyArray(arr: unknown[]): string {
    const circularResult = this.checkCircular(arr);
    if (circularResult !== null) {
      return this.stringifyString(circularResult);
    }

    this.path.push(arr);

    if (arr.length === 0) {
      this.path.pop();
      return '[]';
    }

    const hasIndent = this.indent.length > 0;
    const items: string[] = [];

    for (let i = 0; i < arr.length; i++) {
      let item = arr[i];
      if (this.replacer) {
        item = this.replacer(String(i), item);
      }
      if (hasIndent) {
        this.currentIndent += this.indent;
      }
      const str = this.stringifyValue(String(i), item);
      if (hasIndent) {
        this.currentIndent = this.currentIndent.slice(0, -this.indent.length);
      }
      items.push((hasIndent ? '\n' + this.currentIndent + this.indent : '') + str);
    }

    this.path.pop();

    if (hasIndent) {
      return '[' + items.join(',') + '\n' + this.currentIndent + ']';
    }
    return '[' + items.join(',') + ']';
  }

  private stringifyPlainObject(obj: Record<string, unknown>): string {
    const circularResult = this.checkCircular(obj);
    if (circularResult !== null) {
      return this.stringifyString(circularResult);
    }

    this.path.push(obj);

    const keys = Object.keys(obj);
    if (keys.length === 0) {
      this.path.pop();
      return '{}';
    }

    if (this.sortKeys) {
      keys.sort();
    }

    const hasIndent = this.indent.length > 0;
    const items: string[] = [];

    for (const key of keys) {
      let value = obj[key];
      if (this.replacer) {
        value = this.replacer(key, value);
      }
      if (value === undefined) continue;

      if (hasIndent) {
        this.currentIndent += this.indent;
      }
      const keyStr = this.stringifyString(key);
      const valueStr = this.stringifyValue(key, value);
      if (hasIndent) {
        this.currentIndent = this.currentIndent.slice(0, -this.indent.length);
      }
      items.push((hasIndent ? '\n' + this.currentIndent + this.indent : '') + keyStr + ':' + (hasIndent ? ' ' : '') + valueStr);
    }

    this.path.pop();

    if (items.length === 0) {
      return '{}';
    }

    if (hasIndent) {
      return '{' + items.join(',') + '\n' + this.currentIndent + '}';
    }
    return '{' + items.join(',') + '}';
  }

  private stringifyValue(_key: string, value: unknown): string {
    if (value === null) return 'null';
    if (value === undefined) return 'null';

    switch (typeof value) {
      case 'string':
        return this.stringifyString(value);
      case 'number':
        if (!Number.isFinite(value)) return 'null';
        return String(value);
      case 'boolean':
        return value ? 'true' : 'false';
      case 'bigint':
        return String(value);
      case 'object':
        return this.stringifyObject(value);
      default:
        return 'null';
    }
  }
}

export function createStringifyPlugin(): JsonPlugin {
  return {
    name: 'stringify',
    version: '1.0.0',

    install(kernel: JsonKernel) {
      /** @example
       * ```ts
       * import { json } from '@oxog/json';
       *
       * // Basic stringify
       * json.stringify({ name: 'John' });
       * // => '{"name":"John"}'
       *
       * // Pretty print with indentation
       * json.stringify({ name: 'John' }, { indent: 2 });
       * // => '{\n  "name": "John"\n}'
       *
       * // Handle circular references
       * const obj = { self: null };
       * obj.self = obj;
       * json.stringify(obj, { circular: '[Circular]' });
       * // => '{"self":"[Circular]"}'
       *
       * // Sort keys
       * json.stringify({ z: 1, a: 2 }, { sortKeys: true });
       * // => '{"a":2,"z":1}'
       *
       * // With replacer function
       * json.stringify({ password: 'secret', name: 'John' }, {
       *   replacer: (key, value) => {
       *     if (key === 'password') return undefined;
       *     return value;
       *   }
       * });
       * // => '{"name":"John"}'
       * ```
       */
      kernel.register('stringify', (value: unknown, options?: StringifyOptions): string => {
        const stringifier = new Stringifier(options ?? {});
        return stringifier.stringify(value);
      }, 'stringify');
    },
  };
}

export const stringifyPlugin = createStringifyPlugin();
