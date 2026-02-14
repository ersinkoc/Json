import type { JsonKernel, JsonPlugin, Json5Options } from '../../types';
import { JsonParseError } from '../../errors';

class Json5Parser {
  private text = '';
  private pos = 0;

  parse(text: string): unknown {
    this.text = text;
    this.pos = 0;

    this.skipWhitespaceAndComments();
    const result = this.parseValue();
    this.skipWhitespaceAndComments();

    if (this.pos < this.text.length) {
      throw new JsonParseError('Unexpected character after JSON5 value', {
        position: this.pos,
      });
    }

    return result;
  }

  private skipWhitespaceAndComments(): void {
    while (this.pos < this.text.length) {
      const ch = this.text[this.pos];

      if (ch === ' ' || ch === '\n' || ch === '\r' || ch === '\t' || ch === '\v' || ch === '\f' || ch === '\u00A0' || ch === '\u2028' || ch === '\u2029') {
        this.pos++;
      } else if (ch === '/' && this.pos + 1 < this.text.length) {
        if (this.text[this.pos + 1] === '/') {
          this.pos += 2;
          while (this.pos < this.text.length && this.text[this.pos] !== '\n' && this.text[this.pos] !== '\r') {
            this.pos++;
          }
        } else if (this.text[this.pos + 1] === '*') {
          this.pos += 2;
          while (this.pos < this.text.length - 1) {
            if (this.text[this.pos] === '*' && this.text[this.pos + 1] === '/') {
              this.pos += 2;
              break;
            }
            this.pos++;
          }
        } else {
          break;
        }
      } else {
        break;
      }
    }
  }

  private peek(): string {
    return this.text[this.pos] ?? '';
  }

  private advance(): string {
    return this.text[this.pos++] ?? '';
  }

  private parseValue(): unknown {
    this.skipWhitespaceAndComments();
    const ch = this.peek();

    if (ch === '{') return this.parseObject();
    if (ch === '[') return this.parseArray();
    if (ch === '"' || ch === "'") return this.parseString();
    if (ch === '-' || ch === '+' || ch === '.' || (ch >= '0' && ch <= '9')) return this.parseNumber();
    if (ch === 't' || ch === 'f') return this.parseBoolean();
    if (ch === 'n') return this.parseNull();
    if (ch === 'I' || ch === 'N') return this.parseSpecialNumber();

    throw new JsonParseError(`Unexpected character '${ch}'`, { position: this.pos });
  }

  private parseObject(): Record<string, unknown> {
    const obj: Record<string, unknown> = {};
    this.advance();

    this.skipWhitespaceAndComments();
    if (this.peek() === '}') {
      this.advance();
      return obj;
    }

    while (true) {
      this.skipWhitespaceAndComments();

      if (this.peek() === '}') {
        this.advance();
        break;
      }

      const key = this.parseKey();

      this.skipWhitespaceAndComments();
      if (this.peek() !== ':') {
        throw new JsonParseError('Expected ":"', { position: this.pos });
      }
      this.advance();

      this.skipWhitespaceAndComments();
      const value = this.parseValue();
      obj[key] = value;

      this.skipWhitespaceAndComments();
      const next = this.peek();

      if (next === '}') {
        this.advance();
        break;
      }

      if (next !== ',') {
        throw new JsonParseError('Expected "," or "}"', { position: this.pos });
      }
      this.advance();
    }

    return obj;
  }

  private parseKey(): string {
    const ch = this.peek();

    if (ch === '"' || ch === "'") {
      return this.parseString();
    }

    let identifier = '';
    while (this.pos < this.text.length) {
      const c = this.text[this.pos];
      if (c && (c === '_' || c === '$' || (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9' && identifier.length > 0))) {
        identifier += c;
        this.pos++;
      } else {
        break;
      }
    }

    if (!identifier) {
      throw new JsonParseError('Expected key', { position: this.pos });
    }

    return identifier;
  }

  private parseArray(): unknown[] {
    const arr: unknown[] = [];
    this.advance();

    this.skipWhitespaceAndComments();
    if (this.peek() === ']') {
      this.advance();
      return arr;
    }

    while (true) {
      this.skipWhitespaceAndComments();

      if (this.peek() === ']') {
        this.advance();
        break;
      }

      const value = this.parseValue();
      arr.push(value);

      this.skipWhitespaceAndComments();
      const next = this.peek();

      if (next === ']') {
        this.advance();
        break;
      }

      if (next !== ',') {
        throw new JsonParseError('Expected "," or "]"', { position: this.pos });
      }
      this.advance();
    }

    return arr;
  }

  private parseString(): string {
    const quote = this.advance();
    let result = '';

    while (this.pos < this.text.length) {
      const ch = this.advance();

      if (ch === quote) {
        return result;
      }

      if (ch === '\\') {
        const escaped = this.advance();
        switch (escaped) {
          case "'": result += "'"; break;
          case '"': result += '"'; break;
          case '\\': result += '\\'; break;
          case '/': result += '/'; break;
          case 'b': result += '\b'; break;
          case 'f': result += '\f'; break;
          case 'n': result += '\n'; break;
          case 'r': result += '\r'; break;
          case 't': result += '\t'; break;
          case 'v': result += '\v'; break;
          case '0': result += '\0'; break;
          case 'x': {
            const hex = this.text.slice(this.pos, this.pos + 2);
            this.pos += 2;
            result += String.fromCharCode(parseInt(hex, 16));
            break;
          }
          case 'u': {
            const hex = this.text.slice(this.pos, this.pos + 4);
            this.pos += 4;
            result += String.fromCharCode(parseInt(hex, 16));
            break;
          }
          case '\n':
          case '\r':
          case '\u2028':
          case '\u2029':
            break;
          default:
            result += escaped;
        }
      } else {
        result += ch;
      }
    }

    throw new JsonParseError('Unterminated string', { position: this.pos });
  }

  private parseNumber(): number {
    let numStr = '';

    if (this.peek() === '+') {
      this.advance();
    } else if (this.peek() === '-') {
      numStr += this.advance();
      if (this.text.slice(this.pos, this.pos + 8) === 'Infinity') {
        this.pos += 8;
        return -Infinity;
      }
    }

    if (this.peek() === '0' && this.pos + 1 < this.text.length) {
      const next = this.text[this.pos + 1];
      if (next === 'x' || next === 'X') {
        numStr += this.advance();
        numStr += this.advance();
        while (this.pos < this.text.length && /[0-9a-fA-F]/.test(this.text[this.pos]!)) {
          numStr += this.advance();
        }
        return parseInt(numStr, 16);
      }
    }

    if (this.peek() === '.') {
      numStr += '0';
    } else {
      while (this.pos < this.text.length && this.text[this.pos]! >= '0' && this.text[this.pos]! <= '9') {
        numStr += this.advance();
      }
    }

    if (this.peek() === '.') {
      numStr += this.advance();
      while (this.pos < this.text.length && this.text[this.pos]! >= '0' && this.text[this.pos]! <= '9') {
        numStr += this.advance();
      }
    }

    if (this.peek() === 'e' || this.peek() === 'E') {
      numStr += this.advance();
      if (this.peek() === '+' || this.peek() === '-') {
        numStr += this.advance();
      }
      while (this.pos < this.text.length && this.text[this.pos]! >= '0' && this.text[this.pos]! <= '9') {
        numStr += this.advance();
      }
    }

    return parseFloat(numStr);
  }

  private parseBoolean(): boolean {
    if (this.text.slice(this.pos, this.pos + 4) === 'true') {
      this.pos += 4;
      return true;
    }
    if (this.text.slice(this.pos, this.pos + 5) === 'false') {
      this.pos += 5;
      return false;
    }
    throw new JsonParseError('Unexpected character', { position: this.pos });
  }

  private parseNull(): null {
    if (this.text.slice(this.pos, this.pos + 4) === 'null') {
      this.pos += 4;
      return null;
    }
    throw new JsonParseError('Unexpected character', { position: this.pos });
  }

  private parseSpecialNumber(): number {
    if (this.text.slice(this.pos, this.pos + 8) === 'Infinity') {
      this.pos += 8;
      return Infinity;
    }
    if (this.text.slice(this.pos, this.pos + 9) === '-Infinity') {
      this.pos += 9;
      return -Infinity;
    }
    if (this.text.slice(this.pos, this.pos + 3) === 'NaN') {
      this.pos += 3;
      return NaN;
    }
    throw new JsonParseError('Unexpected character', { position: this.pos });
  }
}

function stringifyJson5(value: unknown, options: Json5Options = {}): string {
  const indent = typeof options.indent === 'number' ? ' '.repeat(options.indent) : options.indent ?? '';
  const quote = options.quote ?? '"';
  let currentIndent = '';

  function stringify(v: unknown, depth: number): string {
    if (v === null) return 'null';
    if (v === undefined) return 'null';
    if (typeof v === 'boolean') return v ? 'true' : 'false';
    if (typeof v === 'number') {
      if (Number.isNaN(v)) return 'NaN';
      if (!Number.isFinite(v)) return v > 0 ? 'Infinity' : '-Infinity';
      return String(v);
    }
    if (typeof v === 'string') {
      let result = quote;
      for (const ch of v) {
        switch (ch) {
          case '\b': result += '\\b'; break;
          case '\f': result += '\\f'; break;
          case '\n': result += '\\n'; break;
          case '\r': result += '\\r'; break;
          case '\t': result += '\\t'; break;
          case '\v': result += '\\v'; break;
          case '\0': result += '\\0'; break;
          case '\\': result += '\\\\'; break;
          case quote: result += '\\' + quote; break;
          default: result += ch;
        }
      }
      result += quote;
      return result;
    }

    if (Array.isArray(v)) {
      if (v.length === 0) return '[]';
      if (indent) currentIndent += indent;
      const items = v.map(item => currentIndent + stringify(item, depth + 1));
      if (indent) currentIndent = currentIndent.slice(0, -indent.length);
      return '[' + (indent ? '\n' : '') + items.join(',' + (indent ? '\n' : '')) + (indent ? '\n' + currentIndent : '') + ']';
    }

    if (typeof v === 'object') {
      const obj = v as Record<string, unknown>;
      const keys = Object.keys(obj);
      if (keys.length === 0) return '{}';
      if (indent) currentIndent += indent;
      const items = keys.map(key => {
        const keyStr = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : stringify(key, depth + 1);
        return currentIndent + keyStr + ':' + (indent ? ' ' : '') + stringify(obj[key], depth + 1);
      });
      if (indent) currentIndent = currentIndent.slice(0, -indent.length);
      return '{' + (indent ? '\n' : '') + items.join(',' + (indent ? '\n' : '')) + (indent ? '\n' + currentIndent : '') + '}';
    }

    return 'null';
  }

  return stringify(value, 0);
}

export function createJson5Plugin(): JsonPlugin {
  return {
    name: 'json5',
    version: '1.0.0',

    install(kernel: JsonKernel) {
      const parser = new Json5Parser();

      /** @example
       * ```ts
       * import { json } from '@oxog/json';
       * json.use(json5Plugin);
       *
       * // Parse JSON5 with comments
       * json.parse5(`
       *   {
       *     // This is a comment
       *     name: 'John',    // unquoted keys
       *     age: 30,         // trailing commas
       *   }
       * `);
       * // => { name: 'John', age: 30 }
       *
       * // Single quotes
       * json.parse5("{'name': 'John'}");
       * // => { name: 'John' }
       *
       * // Special numbers
       * json.parse5('{ value: Infinity }');
       * // => { value: Infinity }
       * ```
       */
      kernel.register('parse5', (text: string): unknown => {
        return parser.parse(text);
      });

      /** @example
       * ```ts
       * import { json } from '@oxog/json';
       * json.use(json5Plugin);
       *
       * // Stringify with single quotes
       * json.stringify5({ name: 'John' }, { quote: "'" });
       * // => "{name: 'John'}"
       *
       * // Pretty print
       * json.stringify5({ name: 'John', age: 30 }, { indent: 2 });
       * // => "{\n  name: 'John',\n  age: 30\n}"
       * ```
       */
      kernel.register('stringify5', (value: unknown, options?: Json5Options): string => {
        return stringifyJson5(value, options);
      });
    },
  };
}

export const json5Plugin = createJson5Plugin();
