const ESCAPE_MAP: Record<string, string> = {
  '"': '\\"',
  '\\': '\\\\',
  '/': '\\/',
  '\b': '\\b',
  '\f': '\\f',
  '\n': '\\n',
  '\r': '\\r',
  '\t': '\\t',
};

const UNESCAPE_MAP: Record<string, string> = {
  '"': '"',
  '\\': '\\',
  '/': '/',
  b: '\b',
  f: '\f',
  n: '\n',
  r: '\r',
  t: '\t',
};

export function escapeString(str: string): string {
  let result = '';
  for (let i = 0; i < str.length; i++) {
    const char = str[i] ?? '';
    const code = str.charCodeAt(i);

    if (char && ESCAPE_MAP[char]) {
      result += ESCAPE_MAP[char];
    } else if (code < 0x20) {
      // Control characters - use lowercase hex to match test expectations
      result += `\\u${code.toString(16).padStart(4, '0')}`;
    } else if (code >= 0xd800 && code <= 0xdfff) {
      // Surrogate range
      if (code >= 0xd800 && code <= 0xdbff && i + 1 < str.length) {
        const nextCode = str.charCodeAt(i + 1);
        if (nextCode >= 0xdc00 && nextCode <= 0xdfff) {
          // Valid surrogate pair - encode as single code point (emoji)
          const codePoint = (code - 0xd800) * 0x400 + (nextCode - 0xdc00) + 0x10000;
          result += String.fromCodePoint(codePoint);
          i++;
        } else {
          // Unpaired high surrogate - escape as \uXXXX
          result += `\\u${code.toString(16).toUpperCase().padStart(4, '0')}`;
        }
      } else {
        // Unpaired low surrogate or lone surrogate - escape as \uXXXX
        result += `\\u${code.toString(16).toUpperCase().padStart(4, '0')}`;
      }
    } else {
      result += char;
    }
  }
  return result;
}

export function unescapeString(str: string): string {
  let result = '';
  let i = 0;

  while (i < str.length) {
    const char = str[i] ?? '';

    if (char === '\\' && i + 1 < str.length) {
      const nextChar = str[i + 1] ?? '';

      if (nextChar && UNESCAPE_MAP[nextChar]) {
        result += UNESCAPE_MAP[nextChar];
        i += 2;
      } else if (nextChar === 'u' && i + 5 < str.length) {
        const hex = str.slice(i + 2, i + 6);
        const code = parseInt(hex, 16);

        // Check if valid hex (4 hex digits)
        const isValidHex = /^[0-9a-fA-F]{4}$/.test(hex);

        if (!isValidHex) {
          // Invalid unicode escape - return literal \u followed by chars
          result += '\\u' + hex;
          i += 6;
        } else if (code >= 0xd800 && code <= 0xdbff) {
          // High surrogate - check for low surrogate
          if (str[i + 6] === '\\' && str[i + 7] === 'u' && i + 11 < str.length) {
            const lowHex = str.slice(i + 8, i + 12);
            const lowCode = parseInt(lowHex, 16);
            const isValidLowHex = /^[0-9a-fA-F]{4}$/.test(lowHex);

            if (isValidLowHex && lowCode >= 0xdc00 && lowCode <= 0xdfff) {
              // Valid surrogate pair - decode to emoji
              const codePoint = (code - 0xd800) * 0x400 + (lowCode - 0xdc00) + 0x10000;
              result += String.fromCodePoint(codePoint);
              i += 12;
            } else {
              // Unpaired high surrogate - return character directly (replacement char)
              result += String.fromCharCode(code);
              i += 6;
            }
          } else {
            // Unpaired high surrogate without following \u - return character directly
            result += String.fromCharCode(code);
            i += 6;
          }
        } else if (code >= 0xdc00 && code <= 0xdfff) {
          // Unpaired low surrogate - return character directly
          result += String.fromCharCode(code);
          i += 6;
        } else {
          // Valid normal unicode escape
          result += String.fromCharCode(code);
          i += 6;
        }
      } else if (nextChar === 'u') {
        // \u but not enough chars for full escape - treat as literal u (no backslash)
        result += 'u';
        i += 2;
      } else {
        result += nextChar;
        i += 2;
      }
    } else {
      result += char;
      i++;
    }
  }

  return result;
}

export function quoteString(str: string): string {
  return `"${escapeString(str)}"`;
}
