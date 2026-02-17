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

// Cached regex for hex validation
const HEX_REGEX = /^[0-9a-fA-F]{4}$/;

export function escapeString(str: string): string {
  const chars: string[] = [];
  for (let i = 0; i < str.length; i++) {
    const char = str[i] ?? '';
    const code = str.charCodeAt(i);

    if (char && ESCAPE_MAP[char]) {
      chars.push(ESCAPE_MAP[char]);
    } else if (code < 0x20) {
      // Control characters - use lowercase hex to match test expectations
      chars.push(`\\u${code.toString(16).padStart(4, '0')}`);
    } else if (code >= 0xd800 && code <= 0xdfff) {
      // Surrogate range
      if (code >= 0xd800 && code <= 0xdbff && i + 1 < str.length) {
        const nextCode = str.charCodeAt(i + 1);
        if (nextCode >= 0xdc00 && nextCode <= 0xdfff) {
          // Valid surrogate pair - encode as single code point (emoji)
          const codePoint = (code - 0xd800) * 0x400 + (nextCode - 0xdc00) + 0x10000;
          chars.push(String.fromCodePoint(codePoint));
          i++;
        } else {
          // Unpaired high surrogate - escape as \uXXXX
          chars.push(`\\u${code.toString(16).toUpperCase().padStart(4, '0')}`);
        }
      } else {
        // Unpaired low surrogate or lone surrogate - escape as \uXXXX
        chars.push(`\\u${code.toString(16).toUpperCase().padStart(4, '0')}`);
      }
    } else {
      chars.push(char);
    }
  }
  return chars.join('');
}

export function unescapeString(str: string): string {
  const chars: string[] = [];
  let i = 0;

  while (i < str.length) {
    const char = str[i] ?? '';

    if (char === '\\' && i + 1 < str.length) {
      const nextChar = str[i + 1] ?? '';

      if (nextChar && UNESCAPE_MAP[nextChar]) {
        chars.push(UNESCAPE_MAP[nextChar]);
        i += 2;
      } else if (nextChar === 'u' && i + 5 < str.length) {
        const hex = str.slice(i + 2, i + 6);
        const code = parseInt(hex, 16);

        // Check if valid hex (4 hex digits)
        const isValidHex = HEX_REGEX.test(hex);

        if (!isValidHex) {
          // Invalid unicode escape - return literal \u followed by chars
          chars.push('\\u' + hex);
          i += 6;
        } else if (code >= 0xd800 && code <= 0xdbff) {
          // High surrogate - check for low surrogate
          if (str[i + 6] === '\\' && str[i + 7] === 'u' && i + 11 < str.length) {
            const lowHex = str.slice(i + 8, i + 12);
            const lowCode = parseInt(lowHex, 16);
            const isValidLowHex = HEX_REGEX.test(lowHex);

            if (isValidLowHex && lowCode >= 0xdc00 && lowCode <= 0xdfff) {
              // Valid surrogate pair - decode to emoji
              const codePoint = (code - 0xd800) * 0x400 + (lowCode - 0xdc00) + 0x10000;
              chars.push(String.fromCodePoint(codePoint));
              i += 12;
            } else {
              // Unpaired high surrogate - return character directly (replacement char)
              chars.push(String.fromCharCode(code));
              i += 6;
            }
          } else {
            // Unpaired high surrogate without following \u - return character directly
            chars.push(String.fromCharCode(code));
            i += 6;
          }
        } else if (code >= 0xdc00 && code <= 0xdfff) {
          // Unpaired low surrogate - return character directly
          chars.push(String.fromCharCode(code));
          i += 6;
        } else {
          // Valid normal unicode escape
          chars.push(String.fromCharCode(code));
          i += 6;
        }
      } else if (nextChar === 'u') {
        // \u but not enough chars for full escape - treat as literal u (no backslash)
        chars.push('u');
        i += 2;
      } else {
        chars.push(nextChar);
        i += 2;
      }
    } else {
      chars.push(char);
      i++;
    }
  }

  return chars.join('');
}

export function quoteString(str: string): string {
  return `"${escapeString(str)}"`;
}
