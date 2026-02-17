import type { JsonKernel, JsonPlugin } from '../../types';

function removeComments(text: string): string {
  let result = '';
  let i = 0;
  let inString = false;
  let escape = false;

  while (i < text.length) {
    const char = text[i];

    if (inString) {
      if (escape) {
        result += char;
        escape = false;
        i++;
        continue;
      }
      if (char === '\\') {
        escape = true;
        result += char;
        i++;
        continue;
      }
      if (char === '"') {
        inString = false;
      }
      result += char;
      i++;
      continue;
    }

    if (char === '"') {
      inString = true;
      result += char;
      i++;
      continue;
    }

    if (char === '/' && i + 1 < text.length) {
      if (text[i + 1] === '/') {
        while (i < text.length && text[i] !== '\n') {
          i++;
        }
        continue;
      }
      if (text[i + 1] === '*') {
        i += 2;
        while (i < text.length - 1) {
          if (text[i] === '*' && text[i + 1] === '/') {
            i += 2;
            break;
          }
          i++;
        }
        continue;
      }
    }

    result += char;
    i++;
  }

  return result;
}

function fixSingleQuotes(text: string): string {
  let result = '';
  let i = 0;
  let inDoubleString = false;
  let escape = false;

  while (i < text.length) {
    const char = text[i];

    if (inDoubleString) {
      if (escape) {
        result += char;
        escape = false;
        i++;
        continue;
      }
      if (char === '\\') {
        escape = true;
        result += char;
        i++;
        continue;
      }
      if (char === '"') {
        inDoubleString = false;
      }
      result += char;
      i++;
      continue;
    }

    if (char === '"') {
      inDoubleString = true;
      result += char;
      i++;
      continue;
    }

    if (char === "'") {
      result += '"';
      i++;
      while (i < text.length) {
        if (text[i] === '\\' && i + 1 < text.length) {
          result += text[i];
          result += text[i + 1];
          i += 2;
          continue;
        }
        if (text[i] === "'") {
          result += '"';
          i++;
          break;
        }
        result += text[i];
        i++;
      }
      continue;
    }

    result += char;
    i++;
  }

  return result;
}

function fixTrailingCommas(text: string): string {
  return text.replace(/,\s*([}\]])/g, '$1');
}

function fixUnquotedKeys(text: string): string {
  let result = '';
  let i = 0;
  let inString = false;
  let escape = false;

  while (i < text.length) {
    const char = text[i];

    if (inString) {
      if (escape) {
        result += char;
        escape = false;
        i++;
        continue;
      }
      if (char === '\\') {
        escape = true;
        result += char;
        i++;
        continue;
      }
      if (char === '"') {
        inString = false;
      }
      result += char;
      i++;
      continue;
    }

    if (char === '"') {
      inString = true;
      result += char;
      i++;
      continue;
    }

    if (char && /[a-zA-Z_$]/.test(char) && (i === 0 || /[{,]\s*$/.test(result))) {
      let identifier = '';
      while (i < text.length && text[i] && /[a-zA-Z0-9_$]/.test(text[i]!)) {
        identifier += text[i];
        i++;
      }
      
      while (i < text.length && text[i] && /\s/.test(text[i]!)) {
        i++;
      }
      
      if (text[i] === ':') {
        result += '"' + identifier + '"';
      } else {
        result += identifier;
      }
      continue;
    }

    result += char;
    i++;
  }

  return result;
}

function fixUnquotedValues(text: string): string {
  let result = '';
  let i = 0;
  let inString = false;
  let escape = false;

  while (i < text.length) {
    const char = text[i];

    if (inString) {
      if (escape) {
        result += char;
        escape = false;
        i++;
        continue;
      }
      if (char === '\\') {
        escape = true;
        result += char;
        i++;
        continue;
      }
      if (char === '"') {
        inString = false;
      }
      result += char;
      i++;
      continue;
    }

    if (char === '"') {
      inString = true;
      result += char;
      i++;
      continue;
    }

    if (char === ':') {
      result += char;
      i++;
      
      while (i < text.length && /\s/.test(text[i]!)) {
        result += text[i];
        i++;
      }
      
      if (i < text.length && /[a-zA-Z]/.test(text[i]!) && text[i] !== '"' && text[i] !== "'") {
        let identifier = '';
        while (i < text.length && /[a-zA-Z0-9_]/.test(text[i]!)) {
          identifier += text[i];
          i++;
        }
        
        if (identifier === 'true' || identifier === 'false' || identifier === 'null') {
          result += identifier;
        } else {
          result += '"' + identifier + '"';
        }
        continue;
      }
      continue;
    }

    result += char;
    i++;
  }

  return result;
}

export function createRepairPlugin(): JsonPlugin {
  return {
    name: 'repair',
    version: '1.0.0',

    install(kernel: JsonKernel) {
      /**
       * Repair malformed JSON strings
       * @example
       * json.repair("{name: 'John', age: 30,}") returns '{"name":"John","age":30}'
       * @example
       * json.repair("{'name': 'John'}") returns '{"name":"John"}'
       */
      kernel.register('repair', (text: string): string => {
        let result = text;

        // Pass 1: Remove comments
        result = removeComments(result);

        // Pass 2: Fix single quotes
        result = fixSingleQuotes(result);

        // Pass 3: Fix trailing commas
        result = fixTrailingCommas(result);

        // Pass 4: Fix unquoted keys
        result = fixUnquotedKeys(result);

        // Pass 5: Fix unquoted values
        result = fixUnquotedValues(result);

        return result;
      }, 'repair');
    },
  };
}

export const repairPlugin = createRepairPlugin();
