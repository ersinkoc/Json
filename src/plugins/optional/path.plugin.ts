import type { JsonKernel, JsonPlugin } from '../../types';
import { isObject, isArray } from '../../utils';

interface Token {
  type: string;
  value: string | number;
}

function tokenize(expression: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < expression.length) {
    const ch = expression[i];

    if (ch === '$') {
      tokens.push({ type: 'root', value: '$' });
      i++;
    } else if (ch === '.') {
      const nextCh = expression[i + 1];
      if (nextCh === '.') {
        tokens.push({ type: 'recursive', value: '..' });
        i += 2;
      } else {
        tokens.push({ type: 'dot', value: '.' });
        i++;
      }
    } else if (ch === '[') {
      tokens.push({ type: 'lbracket', value: '[' });
      i++;
    } else if (ch === ']') {
      tokens.push({ type: 'rbracket', value: ']' });
      i++;
    } else if (ch === '*') {
      tokens.push({ type: 'wildcard', value: '*' });
      i++;
    } else if (ch === "'" || ch === '"') {
      const quote = ch;
      i++;
      let str = '';
      while (i < expression.length && expression[i] !== quote) {
        const current = expression[i];
        const next = expression[i + 1];
        if (current === '\\' && next !== undefined) {
          str += next;
          i += 2;
        } else {
          str += current ?? '';
          i++;
        }
      }
      i++;
      tokens.push({ type: 'string', value: str });
    } else if (ch !== undefined && ch >= '0' && ch <= '9') {
      let num = '';
      while (i < expression.length) {
        const c = expression[i];
        if (c !== undefined && c >= '0' && c <= '9') {
          num += c;
          i++;
        } else {
          break;
        }
      }
      tokens.push({ type: 'number', value: parseInt(num, 10) });
    } else if (ch === '?') {
      tokens.push({ type: 'filter', value: '?' });
      i++;
      const nextCh = expression[i];
      if (nextCh === '(') {
        i++;
        let depth = 1;
        let filterExpr = '';
        while (i < expression.length && depth > 0) {
          const c = expression[i];
          if (c === '(') depth++;
          if (c === ')') depth--;
          if (depth > 0 && c !== undefined) filterExpr += c;
          i++;
        }
        tokens.push({ type: 'filterExpr', value: filterExpr.trim() });
      }
    } else if (ch === ':') {
      tokens.push({ type: 'colon', value: ':' });
      i++;
    } else if (ch === ',') {
      tokens.push({ type: 'comma', value: ',' });
      i++;
    } else if (ch === '@') {
      tokens.push({ type: 'current', value: '@' });
      i++;
    } else if (ch !== undefined && /[a-zA-Z_$]/.test(ch)) {
      let name = '';
      while (i < expression.length) {
        const c = expression[i];
        if (c !== undefined && /[a-zA-Z0-9_$]/.test(c)) {
          name += c;
          i++;
        } else {
          break;
        }
      }
      tokens.push({ type: 'name', value: name });
    } else {
      i++;
    }
  }

  return tokens;
}

function evaluateFilter(data: unknown, expr: string): boolean {
  expr = expr.trim();
  
  const comparisonMatch = expr.match(/^@\.([a-zA-Z_][a-zA-Z0-9_]*)\s*(==|!=|<|>|<=|>=)\s*(.+)$/);
  if (comparisonMatch) {
    const prop = comparisonMatch[1];
    const op = comparisonMatch[2];
    const valueStr = comparisonMatch[3];
    
    if (!prop || !op || !valueStr) return false;
    
    let actualValue: unknown;
    
    if (isObject(data)) {
      actualValue = data[prop];
    } else {
      return false;
    }
    
    let compareValue: unknown;
    const trimmed = valueStr.trim();
    if (trimmed.startsWith("'") || trimmed.startsWith('"')) {
      compareValue = trimmed.slice(1, -1);
    } else if (trimmed === 'true') {
      compareValue = true;
    } else if (trimmed === 'false') {
      compareValue = false;
    } else if (trimmed === 'null') {
      compareValue = null;
    } else if (!isNaN(Number(trimmed))) {
      compareValue = Number(trimmed);
    } else {
      compareValue = trimmed;
    }
    
    switch (op) {
      case '==': return actualValue == compareValue;
      case '!=': return actualValue != compareValue;
      case '<': return (actualValue as number) < (compareValue as number);
      case '>': return (actualValue as number) > (compareValue as number);
      case '<=': return (actualValue as number) <= (compareValue as number);
      case '>=': return (actualValue as number) >= (compareValue as number);
    }
  }
  
  return false;
}

function evaluate(data: unknown, tokens: Token[], pos: number): unknown[] {
  const results: unknown[] = [];
  
  if (pos >= tokens.length) {
    if (data !== undefined) {
      results.push(data);
    }
    return results;
  }

  const token = tokens[pos];
  if (!token) return results;
  
  if (token.type === 'root') {
    return evaluate(data, tokens, pos + 1);
  }
  
  if (token.type === 'dot') {
    const nextToken = tokens[pos + 1];
    if (nextToken && nextToken.type === 'name') {
      if (isObject(data) && nextToken.value in data) {
        return evaluate(data[nextToken.value as string], tokens, pos + 2);
      }
      return [];
    }
    if (nextToken && nextToken.type === 'wildcard') {
      const allResults: unknown[] = [];
      if (isObject(data)) {
        for (const key of Object.keys(data)) {
          allResults.push(...evaluate(data[key], tokens, pos + 2));
        }
      } else if (isArray(data)) {
        for (const item of data) {
          allResults.push(...evaluate(item, tokens, pos + 2));
        }
      }
      return allResults;
    }
    return evaluate(data, tokens, pos + 1);
  }
  
  if (token.type === 'recursive') {
    const nextToken = tokens[pos + 1];
    if (!nextToken) {
      return [data];
    }
    
    const allResults: unknown[] = [];
    const nt = nextToken;
    
    function collectRecursive(val: unknown): void {
      if (isObject(val)) {
        if (nt.type === 'name' && nt.value in val) {
          allResults.push(...evaluate(val[nt.value as string], tokens, pos + 2));
        }
        for (const key of Object.keys(val)) {
          collectRecursive(val[key]);
        }
      } else if (isArray(val)) {
        for (const item of val) {
          collectRecursive(item);
        }
      }
    }
    
    collectRecursive(data);
    return allResults;
  }
  
  if (token.type === 'lbracket') {
    const nextToken = tokens[pos + 1];
    
    if (nextToken && nextToken.type === 'number') {
      const colonToken = tokens[pos + 2];
      if (colonToken && colonToken.type === 'colon') {
        const endToken = tokens[pos + 3];
        if (isArray(data)) {
          const start = nextToken.value as number;
          const end = endToken && endToken.type === 'number' ? endToken.value as number : data.length;
          const sliceResults: unknown[] = [];
          for (let i = start; i < Math.min(end, data.length); i++) {
            sliceResults.push(...evaluate(data[i], tokens, pos + (endToken && endToken.type === 'number' ? 5 : 4)));
          }
          return sliceResults;
        }
        return [];
      }
      
      const rbracketToken = tokens[pos + 2];
      if (rbracketToken && rbracketToken.type === 'rbracket') {
        if (isArray(data)) {
          const index = nextToken.value as number;
          if (index >= 0 && index < data.length) {
            return evaluate(data[index], tokens, pos + 3);
          }
        }
        return [];
      }
    }
    
    if (nextToken && nextToken.type === 'wildcard') {
      const rbracketToken = tokens[pos + 2];
      if (rbracketToken && rbracketToken.type === 'rbracket') {
        const allResults: unknown[] = [];
        if (isObject(data)) {
          for (const key of Object.keys(data)) {
            allResults.push(...evaluate(data[key], tokens, pos + 3));
          }
        } else if (isArray(data)) {
          for (let i = 0; i < data.length; i++) {
            allResults.push(...evaluate(data[i], tokens, pos + 3));
          }
        }
        return allResults;
      }
    }
    
    if (nextToken && nextToken.type === 'string') {
      const rbracketToken = tokens[pos + 2];
      if (rbracketToken && rbracketToken.type === 'rbracket') {
        if (isObject(data)) {
          const key = nextToken.value as string;
          if (key in data) {
            return evaluate(data[key], tokens, pos + 3);
          }
        }
        return [];
      }
    }
    
    if (nextToken && nextToken.type === 'filter') {
      const filterExprToken = tokens[pos + 2];
      const rbracketToken = tokens[pos + 3];
      if (filterExprToken && filterExprToken.type === 'filterExpr' && rbracketToken && rbracketToken.type === 'rbracket') {
        const filterResults: unknown[] = [];
        const exprStr = filterExprToken.value as string;
        if (isArray(data)) {
          for (const item of data) {
            if (evaluateFilter(item, exprStr)) {
              filterResults.push(...evaluate(item, tokens, pos + 4));
            }
          }
        }
        return filterResults;
      }
    }
    
    return evaluate(data, tokens, pos + 1);
  }
  
  if (token.type === 'name') {
    if (isObject(data) && token.value in data) {
      return evaluate(data[token.value as string], tokens, pos + 1);
    }
    return [];
  }
  
  return evaluate(data, tokens, pos + 1);
}

export function createPathPlugin(): JsonPlugin {
  return {
    name: 'path',
    version: '1.0.0',

    install(kernel: JsonKernel) {
      /**
       * Query JSON data using JSONPath-like expressions
       * @example
       * json.query({user: {name: "John"}}, "$.user.name") returns ["John"]
       * @example
       * json.query({items: [{id: 1}, {id: 2}]}, "$.items[*].id") returns [1, 2]
       * @example
       * json.query({a: {b: {c: 1}}}, "$..c") returns [1]
       */
      kernel.register('query', (data: unknown, expression: string): unknown[] => {
        const tokens = tokenize(expression);
        const results = evaluate(data, tokens, 0);
        return results;
      });
    },
  };
}

export const pathPlugin = createPathPlugin();
