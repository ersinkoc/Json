import type {
  JsonKernel,
  JsonPlugin,
  JsonValue,
  ParseOptions,
  JsonResult,
} from "../../types";
import { JsonParseError, MaxDepthError, JsonError } from "../../errors";
import { isObject, isArray } from "../../utils";

const DEFAULT_MAX_DEPTH = 512;
const DEFAULT_MAX_LENGTH = 10 * 1024 * 1024;

class Parser {
  private text = "";
  private pos = 0;
  private depth = 0;
  private maxDepth: number;
  private maxLength: number;

  constructor(maxDepth: number, maxLength: number) {
    this.maxDepth = maxDepth;
    this.maxLength = maxLength;
  }

  parse(text: string): JsonValue {
    if (text.length > this.maxLength) {
      throw new JsonParseError(
        `Input length ${text.length} exceeds maximum ${this.maxLength}`,
        { input: text.slice(0, 100) },
      );
    }

    this.text = text;
    this.pos = 0;
    this.depth = 0;

    this.skipWhitespace();
    const result = this.parseValue();
    this.skipWhitespace();

    if (this.pos < this.text.length) {
      throw this.createError("Unexpected character after JSON value");
    }

    return result;
  }

  private createError(message: string): JsonParseError {
    let line = 1;
    let column = 1;

    for (let i = 0; i < this.pos && i < this.text.length; i++) {
      if (this.text[i] === "\n") {
        line++;
        column = 1;
      } else {
        column++;
      }
    }

    return new JsonParseError(message, {
      position: this.pos,
      line,
      column,
    });
  }

  private peek(): string {
    return this.text[this.pos] ?? "";
  }

  private advance(): string {
    return this.text[this.pos++] ?? "";
  }

  private skipWhitespace(): void {
    while (this.pos < this.text.length) {
      const ch = this.text[this.pos];
      if (ch === " " || ch === "\n" || ch === "\r" || ch === "\t") {
        this.pos++;
      } else {
        break;
      }
    }
  }

  private parseValue(): JsonValue {
    this.skipWhitespace();
    const ch = this.peek();

    if (ch === "{") return this.parseObject();
    if (ch === "[") return this.parseArray();
    if (ch === '"') return this.parseString();
    if (ch === "-" || (ch >= "0" && ch <= "9")) return this.parseNumber();
    if (ch === "t" || ch === "f") return this.parseBoolean();
    if (ch === "n") return this.parseNull();

    throw this.createError(`Unexpected character '${ch}'`);
  }

  private parseObject(): JsonValue {
    if (this.depth >= this.maxDepth) {
      throw new MaxDepthError(this.maxDepth);
    }
    this.depth++;

    const obj: Record<string, JsonValue> = {};
    this.advance(); // consume '{'
    this.skipWhitespace();

    if (this.peek() === "}") {
      this.advance();
      this.depth--;
      return obj;
    }

    while (true) {
      this.skipWhitespace();

      if (this.peek() !== '"') {
        throw this.createError("Expected string key");
      }

      const key = this.parseString();
      this.skipWhitespace();

      if (this.peek() !== ":") {
        throw this.createError('Expected ":" after key');
      }
      this.advance();
      this.skipWhitespace();

      const value = this.parseValue();
      obj[key] = value;

      this.skipWhitespace();
      const next = this.peek();

      if (next === "}") {
        this.advance();
        break;
      }

      if (next !== ",") {
        throw this.createError('Expected "," or "}"');
      }
      this.advance();
    }

    this.depth--;
    return obj;
  }

  private parseArray(): JsonValue {
    if (this.depth >= this.maxDepth) {
      throw new MaxDepthError(this.maxDepth);
    }
    this.depth++;

    const arr: JsonValue[] = [];
    this.advance(); // consume '['
    this.skipWhitespace();

    if (this.peek() === "]") {
      this.advance();
      this.depth--;
      return arr;
    }

    while (true) {
      const value = this.parseValue();
      arr.push(value);

      this.skipWhitespace();
      const next = this.peek();

      if (next === "]") {
        this.advance();
        break;
      }

      if (next !== ",") {
        throw this.createError('Expected "," or "]"');
      }
      this.advance();
    }

    this.depth--;
    return arr;
  }

  private parseString(): string {
    this.advance(); // consume '"'
    let result = "";
    let i = this.pos;

    while (i < this.text.length) {
      const ch = this.text[i];

      if (ch === '"') {
        result += this.text.slice(this.pos, i);
        this.pos = i + 1;
        return result;
      }

      if (ch === "\\") {
        result += this.text.slice(this.pos, i);
        this.pos = i + 1;
        result += this.parseEscape();
        i = this.pos;
        continue;
      }

      i++;
    }

    throw this.createError("Unterminated string");
  }

  private parseEscape(): string {
    const ch = this.advance();

    switch (ch) {
      case '"':
        return '"';
      case "\\":
        return "\\";
      case "/":
        return "/";
      case "b":
        return "\b";
      case "f":
        return "\f";
      case "n":
        return "\n";
      case "r":
        return "\r";
      case "t":
        return "\t";
      case "u": {
        const hex = this.text.slice(this.pos, this.pos + 4);
        if (hex.length !== 4 || !/^[0-9a-fA-F]+$/.test(hex)) {
          throw this.createError("Invalid unicode escape");
        }
        this.pos += 4;
        const code = parseInt(hex, 16);
        return String.fromCharCode(code);
      }
      default:
        throw this.createError(`Invalid escape sequence: \\${ch}`);
    }
  }

  private parseNumber(): number {
    let i = this.pos;

    if (this.text[i] === "-") i++;

    const ch0 = this.text[i];
    if (ch0 === "0") {
      i++;
    } else if (ch0 && ch0 >= "1" && ch0 <= "9") {
      while (i < this.text.length) {
        const c = this.text[i];
        if (c && c >= "0" && c <= "9") i++;
        else break;
      }
    } else {
      throw this.createError("Invalid number");
    }

    if (this.text[i] === ".") {
      i++;
      const dotCh = this.text[i];
      if (!dotCh || dotCh < "0" || dotCh > "9") {
        throw this.createError("Invalid number");
      }
      while (i < this.text.length) {
        const c = this.text[i];
        if (c && c >= "0" && c <= "9") i++;
        else break;
      }
    }

    if (this.text[i] === "e" || this.text[i] === "E") {
      i++;
      if (this.text[i] === "+" || this.text[i] === "-") i++;
      const expCh = this.text[i];
      if (!expCh || expCh < "0" || expCh > "9") {
        throw this.createError("Invalid number");
      }
      while (i < this.text.length) {
        const c = this.text[i];
        if (c && c >= "0" && c <= "9") i++;
        else break;
      }
    }

    const numStr = this.text.slice(this.pos, i);
    this.pos = i;

    const num = parseFloat(numStr);
    if (isNaN(num)) {
      throw this.createError("Invalid number");
    }

    return num;
  }

  private parseBoolean(): boolean {
    if (this.text.slice(this.pos, this.pos + 4) === "true") {
      this.pos += 4;
      return true;
    }
    if (this.text.slice(this.pos, this.pos + 5) === "false") {
      this.pos += 5;
      return false;
    }
    throw this.createError("Unexpected character");
  }

  private parseNull(): null {
    if (this.text.slice(this.pos, this.pos + 4) === "null") {
      this.pos += 4;
      return null;
    }
    throw this.createError("Unexpected character");
  }
}

function applyReviver(
  value: unknown,
  reviver: (key: string, value: unknown) => unknown,
  key: string = "",
): unknown {
  if (isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      value[i] = applyReviver(value[i], reviver, String(i));
    }
  } else if (isObject(value)) {
    for (const k of Object.keys(value)) {
      value[k] = applyReviver(value[k], reviver, k) as JsonValue;
    }
  }
  return reviver(key, value);
}

export function createParsePlugin(): JsonPlugin {
  return {
    name: "parse",
    version: "1.0.0",

    install(kernel: JsonKernel) {
      const kernelImpl = kernel as unknown as {
        getConfig?: () => { parse?: ParseOptions };
        call?: (name: string, ...args: unknown[]) => unknown;
      };
      const config = kernelImpl.getConfig?.() ?? {};
      const defaultOptions: ParseOptions = {
        maxDepth: config.parse?.maxDepth ?? DEFAULT_MAX_DEPTH,
        maxLength: config.parse?.maxLength ?? DEFAULT_MAX_LENGTH,
        strict: config.parse?.strict ?? false,
      };

      /** @example
       * ```ts
       * import { json } from '@oxog/json';
       *
       * // Basic parse
       * json.parse('{"name":"John"}'); // => { name: 'John' }
       *
       * // With reviver function
       * json.parse('{"date":"2024-01-01"}', {
       *   reviver: (key, value) => {
       *     if (key === 'date') return new Date(value);
       *     return value;
       *   }
       * });
       *
       * // With max depth limit
       * json.parse('{"nested":{"deep":"value"}}', { maxDepth: 10 });
       * ```
       */
      kernel.register(
        "parse",
        (text: string, options?: ParseOptions): JsonValue => {
          const opts = { ...defaultOptions, ...options };
          const maxDepth = opts.maxDepth ?? DEFAULT_MAX_DEPTH;
          const maxLength = opts.maxLength ?? DEFAULT_MAX_LENGTH;
          const parser = new Parser(maxDepth, maxLength);
          let result = parser.parse(text);

          if (opts.reviver) {
            result = applyReviver(result, opts.reviver) as JsonValue;
          }

          return result;
        },
      );

      /** @example
       * ```ts
       * import { json } from '@oxog/json';
       *
       * // Valid JSON
       * json.safeParse('{"name":"John"}');
       * // => { ok: true, value: { name: 'John' } }
       *
       * // Invalid JSON
       * json.safeParse('{"name":John}');
       * // => { ok: false, error: JsonParseError }
       *
       * // With result handling
       * const result = json.safeParse(input);
       * if (result.ok) {
       *   console.log(result.value);
       * } else {
       *   console.error(result.error.message);
       * }
       * ```
       */
      kernel.register(
        "safeParse",
        (text: string, options?: ParseOptions): JsonResult<JsonValue> => {
          try {
            const opts = { ...defaultOptions, ...options };
            const maxDepth = opts.maxDepth ?? DEFAULT_MAX_DEPTH;
            const maxLength = opts.maxLength ?? DEFAULT_MAX_LENGTH;
            const parser = new Parser(maxDepth, maxLength);
            let result = parser.parse(text);

            if (opts.reviver) {
              result = applyReviver(result, opts.reviver) as JsonValue;
            }

            return { ok: true, value: result };
          } catch (e) {
            const error =
              e instanceof JsonError
                ? e
                : e instanceof Error
                  ? new JsonParseError(e.message)
                  : new JsonParseError(String(e));
            return { ok: false, error };
          }
        },
      );
    },
  };
}

export const parsePlugin = createParsePlugin();
