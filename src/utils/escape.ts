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
      result += `\\u${code.toString(16).padStart(4, '0')}`;
    } else if (code >= 0xd800 && code <= 0xdfff) {
      if (code >= 0xd800 && code <= 0xdbff && i + 1 < str.length) {
        const nextCode = str.charCodeAt(i + 1);
        if (nextCode >= 0xdc00 && nextCode <= 0xdfff) {
          const codePoint = (code - 0xd800) * 0x400 + (nextCode - 0xdc00) + 0x10000;
          result += `\\u${codePoint.toString(16).padStart(4, '0')}`;
          i++;
        } else {
          result += `\\u${code.toString(16).padStart(4, '0')}`;
        }
      } else {
        result += `\\u${code.toString(16).padStart(4, '0')}`;
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
        
        if (code >= 0xd800 && code <= 0xdbff) {
          if (str[i + 6] === '\\' && str[i + 7] === 'u' && i + 11 < str.length) {
            const lowHex = str.slice(i + 8, i + 12);
            const lowCode = parseInt(lowHex, 16);
            if (lowCode >= 0xdc00 && lowCode <= 0xdfff) {
              const codePoint = (code - 0xd800) * 0x400 + (lowCode - 0xdc00) + 0x10000;
              result += String.fromCodePoint(codePoint);
              i += 12;
            } else {
              result += String.fromCharCode(code);
              i += 6;
            }
          } else {
            result += String.fromCharCode(code);
            i += 6;
          }
        } else {
          result += String.fromCharCode(code);
          i += 6;
        }
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
