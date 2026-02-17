import type { JsonKernel, JsonPlugin, JsonSchema, ValidationResult, ValidationError } from '../../types';
import { isObject, isArray, isString, isNumber, isBoolean, isNull } from '../../utils';

// Cache for compiled regex patterns
const regexCache = new Map<string, RegExp>();

function getRegex(pattern: string): RegExp {
  let regex = regexCache.get(pattern);
  if (!regex) {
    regex = new RegExp(pattern);
    regexCache.set(pattern, regex);
  }
  return regex;
}

const formatValidators: Record<string, (value: string) => boolean> = {
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  uri: (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },
  date: (value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(Date.parse(value)),
  'date-time': (value) => {
    // ISO 8601 date-time requires timezone (Z or ±hh:mm)
    const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;
    return regex.test(value) && !isNaN(Date.parse(value));
  },
  uuid: (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value),
  regex: (value) => {
    try {
      new RegExp(value);
      return true;
    } catch {
      return false;
    }
  },
  hostname: (value) => /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(value) && value.length <= 253,
  'ipv4': (value) => /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(value),
  'ipv6': (value) => {
    // Simplified IPv6 validation - supports :: shorthand
    // Check for obviously invalid patterns
    if (value.includes(':::') || (value.match(/::/g) || []).length > 1) {
      return false;
    }
    // Expand :: and count hextets
    const parts = value.split(':');
    if (parts.length < 2 || parts.length > 8) return false;

    // Check each part
    for (const part of parts) {
      if (part === '' || part === '::') continue;
      if (!/^[0-9a-fA-F]{1,4}$/.test(part)) return false;
    }
    return true;
  },
};

function getType(value: unknown): string {
  if (isNull(value)) return 'null';
  if (isArray(value)) return 'array';
  if (isBoolean(value)) return 'boolean';
  if (isNumber(value)) return Number.isInteger(value) ? 'integer' : 'number';
  if (isString(value)) return 'string';
  return 'object';
}

function validateAgainstSchema(
  data: unknown,
  schema: JsonSchema,
  path: string = ''
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (schema.$ref) {
    return errors;
  }

  if (schema.type !== undefined) {
    const actualType = getType(data);
    const expectedTypes = Array.isArray(schema.type) ? schema.type : [schema.type];
    
    let typeMatch = false;
    for (const expected of expectedTypes) {
      if (expected === actualType) {
        typeMatch = true;
        break;
      }
      if (expected === 'number' && actualType === 'integer') {
        typeMatch = true;
        break;
      }
      if (expected === 'integer' && actualType === 'number' && Number.isInteger(data as number)) {
        typeMatch = true;
        break;
      }
    }

    if (!typeMatch) {
      errors.push({
        path,
        message: `Expected type ${expectedTypes.join(' or ')}, got ${actualType}`,
        keyword: 'type',
      });
    }
  }

  if (schema.enum !== undefined) {
    if (!schema.enum.includes(data)) {
      errors.push({
        path,
        message: `Value must be one of: ${schema.enum.join(', ')}`,
        keyword: 'enum',
      });
    }
  }

  if (schema.const !== undefined) {
    if (data !== schema.const) {
      errors.push({
        path,
        message: `Value must be ${JSON.stringify(schema.const)}`,
        keyword: 'const',
      });
    }
  }

  if (isString(data)) {
    if (schema.minLength !== undefined && data.length < schema.minLength) {
      errors.push({
        path,
        message: `String must have at least ${schema.minLength} characters`,
        keyword: 'minLength',
        params: { minLength: schema.minLength },
      });
    }

    if (schema.maxLength !== undefined && data.length > schema.maxLength) {
      errors.push({
        path,
        message: `String must have at most ${schema.maxLength} characters`,
        keyword: 'maxLength',
        params: { maxLength: schema.maxLength },
      });
    }

    if (schema.pattern !== undefined) {
      const regex = getRegex(schema.pattern);
      if (!regex.test(data)) {
        errors.push({
          path,
          message: `String must match pattern: ${schema.pattern}`,
          keyword: 'pattern',
          params: { pattern: schema.pattern },
        });
      }
    }

    if (schema.format !== undefined && schema.format in formatValidators) {
      const validator = formatValidators[schema.format];
      if (validator && !validator(data)) {
        errors.push({
          path,
          message: `String must be a valid ${schema.format}`,
          keyword: 'format',
          params: { format: schema.format },
        });
      }
    }
  }

  if (isNumber(data)) {
    if (schema.minimum !== undefined && data < schema.minimum) {
      errors.push({
        path,
        message: `Value must be >= ${schema.minimum}`,
        keyword: 'minimum',
        params: { minimum: schema.minimum },
      });
    }

    if (schema.maximum !== undefined && data > schema.maximum) {
      errors.push({
        path,
        message: `Value must be <= ${schema.maximum}`,
        keyword: 'maximum',
        params: { maximum: schema.maximum },
      });
    }

    if (schema.exclusiveMinimum !== undefined) {
      const min = typeof schema.exclusiveMinimum === 'number' ? schema.exclusiveMinimum : schema.minimum;
      if (min !== undefined && data <= min) {
        errors.push({
          path,
          message: `Value must be > ${min}`,
          keyword: 'exclusiveMinimum',
          params: { exclusiveMinimum: min },
        });
      }
    }

    if (schema.exclusiveMaximum !== undefined) {
      const max = typeof schema.exclusiveMaximum === 'number' ? schema.exclusiveMaximum : schema.maximum;
      if (max !== undefined && data >= max) {
        errors.push({
          path,
          message: `Value must be < ${max}`,
          keyword: 'exclusiveMaximum',
          params: { exclusiveMaximum: max },
        });
      }
    }

    if (schema.multipleOf !== undefined && data % schema.multipleOf !== 0) {
      errors.push({
        path,
        message: `Value must be a multiple of ${schema.multipleOf}`,
        keyword: 'multipleOf',
        params: { multipleOf: schema.multipleOf },
      });
    }
  }

  if (isArray(data)) {
    if (schema.minItems !== undefined && data.length < schema.minItems) {
      errors.push({
        path,
        message: `Array must have at least ${schema.minItems} items`,
        keyword: 'minItems',
        params: { minItems: schema.minItems },
      });
    }

    if (schema.maxItems !== undefined && data.length > schema.maxItems) {
      errors.push({
        path,
        message: `Array must have at most ${schema.maxItems} items`,
        keyword: 'maxItems',
        params: { maxItems: schema.maxItems },
      });
    }

    if (schema.uniqueItems === true) {
      const seen = new Set();
      for (const item of data) {
        const key = JSON.stringify(item);
        if (seen.has(key)) {
          errors.push({
            path,
            message: 'Array items must be unique',
            keyword: 'uniqueItems',
          });
          break;
        }
        seen.add(key);
      }
    }

    if (schema.items !== undefined) {
      const itemSchema = Array.isArray(schema.items) ? schema.items : [schema.items];
      
      for (let i = 0; i < data.length; i++) {
        const schemaToUse = itemSchema[i] ?? itemSchema[itemSchema.length - 1];
        if (schemaToUse) {
          errors.push(...validateAgainstSchema(data[i], schemaToUse, `${path}/${i}`));
        }
      }
    }

    if (schema.contains !== undefined) {
      let containsMatch = false;
      for (let i = 0; i < data.length; i++) {
        const itemErrors = validateAgainstSchema(data[i], schema.contains, `${path}/${i}`);
        if (itemErrors.length === 0) {
          containsMatch = true;
          break;
        }
      }
      if (!containsMatch) {
        errors.push({
          path,
          message: 'Array must contain at least one item matching the schema',
          keyword: 'contains',
        });
      }
    }
  }

  if (isObject(data)) {
    if (schema.minProperties !== undefined && Object.keys(data).length < schema.minProperties) {
      errors.push({
        path,
        message: `Object must have at least ${schema.minProperties} properties`,
        keyword: 'minProperties',
        params: { minProperties: schema.minProperties },
      });
    }

    if (schema.maxProperties !== undefined && Object.keys(data).length > schema.maxProperties) {
      errors.push({
        path,
        message: `Object must have at most ${schema.maxProperties} properties`,
        keyword: 'maxProperties',
        params: { maxProperties: schema.maxProperties },
      });
    }

    if (schema.required !== undefined) {
      for (const reqKey of schema.required) {
        if (!(reqKey in data)) {
          errors.push({
            path,
            message: `Required property "${reqKey}" is missing`,
            keyword: 'required',
            params: { missingProperty: reqKey },
          });
        }
      }
    }

    if (schema.properties !== undefined) {
      for (const key of Object.keys(data)) {
        if (schema.properties[key]) {
          errors.push(...validateAgainstSchema(data[key], schema.properties[key], `${path}/${key}`));
        }
      }
    }

    if (schema.additionalProperties !== undefined) {
      const propKeys = schema.properties ? Object.keys(schema.properties) : [];
      const patternKeys = schema.patternProperties ? Object.keys(schema.patternProperties) : [];

      for (const key of Object.keys(data)) {
        const isProp = propKeys.includes(key);
        const isPattern = patternKeys.some(p => getRegex(p).test(key));

        // Check if this key is NOT in properties and NOT in patternProperties
        if (!isProp && !isPattern) {
          if (schema.additionalProperties === false) {
            errors.push({
              path,
              message: `Additional property "${key}" is not allowed`,
              keyword: 'additionalProperties',
              params: { additionalProperty: key },
            });
          } else if (isObject(schema.additionalProperties)) {
            errors.push(...validateAgainstSchema(data[key], schema.additionalProperties, `${path}/${key}`));
          }
        }
      }
    }

    if (schema.patternProperties !== undefined) {
      for (const key of Object.keys(data)) {
        for (const [pattern, patternSchema] of Object.entries(schema.patternProperties)) {
          if (getRegex(pattern).test(key)) {
            errors.push(...validateAgainstSchema(data[key], patternSchema, `${path}/${key}`));
          }
        }
      }
    }
  }

  if (schema.allOf !== undefined) {
    for (let i = 0; i < schema.allOf.length; i++) {
      const subSchema = schema.allOf[i];
      if (subSchema) {
        errors.push(...validateAgainstSchema(data, subSchema, path));
      }
    }
  }

  if (schema.anyOf !== undefined) {
    const anyOfErrors: ValidationError[][] = [];
    let anyValid = false;

    for (const subSchema of schema.anyOf) {
      const subErrors = validateAgainstSchema(data, subSchema, path);
      anyOfErrors.push(subErrors);
      if (subErrors.length === 0) {
        anyValid = true;
        break;
      }
    }

    if (!anyValid) {
      errors.push({
        path,
        message: 'Value must match at least one schema in anyOf',
        keyword: 'anyOf',
      });
    }
  }

  if (schema.oneOf !== undefined) {
    let matchCount = 0;

    for (const subSchema of schema.oneOf) {
      const subErrors = validateAgainstSchema(data, subSchema, path);
      if (subErrors.length === 0) {
        matchCount++;
      }
    }

    if (matchCount !== 1) {
      errors.push({
        path,
        message: 'Value must match exactly one schema in oneOf',
        keyword: 'oneOf',
        params: { matchingSchemas: matchCount },
      });
    }
  }

  if (schema.not !== undefined) {
    const notErrors = validateAgainstSchema(data, schema.not, path);
    if (notErrors.length === 0) {
      errors.push({
        path,
        message: 'Value must not match the schema in "not"',
        keyword: 'not',
      });
    }
  }

  if (schema.if !== undefined) {
    // Evaluate the 'if' schema
    const ifErrors = validateAgainstSchema(data, schema.if, path);
    const ifValid = ifErrors.length === 0;

    // If 'if' is valid and 'then' exists, validate against 'then'
    if (ifValid && schema.then !== undefined) {
      errors.push(...validateAgainstSchema(data, schema.then, path));
    }
    // If 'if' is NOT valid and 'else' exists, validate against 'else'
    else if (!ifValid && schema.else !== undefined) {
      errors.push(...validateAgainstSchema(data, schema.else, path));
    }
  }

  return errors;
}

export function createSchemaPlugin(): JsonPlugin {
  return {
    name: 'schema',
    version: '1.0.0',

    install(kernel: JsonKernel) {
      /** @example
       * ```ts
       * import { json } from '@oxog/json';
       * json.use(schemaPlugin);
       *
       * // Simple validation
       * const result = json.validate(
       *   { name: 'John', age: 30 },
       *   {
       *     type: 'object',
       *     properties: {
       *       name: { type: 'string' },
       *       age: { type: 'number', minimum: 0 }
       *     },
       *     required: ['name', 'age']
       *   }
       * );
       * // => { valid: true, errors: [] }
       *
       * // Invalid data
       * json.validate({ name: 'John' }, {
       *   type: 'object',
       *   required: ['name', 'age']
       * });
       * // => { valid: false, errors: [{ path: '', message: 'Required property "age" is missing' }] }
       * ```
       */
      kernel.register('validate', (data: unknown, schema: JsonSchema): ValidationResult => {
        const errors = validateAgainstSchema(data, schema);
        return {
          valid: errors.length === 0,
          errors,
        };
      }, 'schema');

      /** @example
       * ```ts
       * import { json } from '@oxog/json';
       * json.use(schemaPlugin);
       *
       * // Compile schema for repeated validation
       * const validator = json.compile({
       *   type: 'object',
       *   properties: {
       *     email: { type: 'string', format: 'email' }
       *   }
       * });
       *
       * validator({ email: 'test@example.com' }); // => { valid: true, errors: [] }
       * validator({ email: 'invalid' });          // => { valid: false, errors: [...] }
       * ```
       */
      kernel.register('compile', (schema: JsonSchema): ((data: unknown) => ValidationResult) => {
        return (data: unknown): ValidationResult => {
          const errors = validateAgainstSchema(data, schema);
          return {
            valid: errors.length === 0,
            errors,
          };
        };
      }, 'schema');

      /** @example
       * ```ts
       * import { json } from '@oxog/json';
       * json.use(schemaPlugin);
       *
       * interface User {
       *   name: string;
       *   age: number;
       * }
       *
       * const data: unknown = { name: 'John', age: 30 };
       *
       * // Type guard
       * if (json.is<User>(data, {
       *   type: 'object',
       *   properties: {
       *     name: { type: 'string' },
       *     age: { type: 'number' }
       *   },
       *   required: ['name', 'age']
       * })) {
       *   // data is now typed as User
       *   console.log(data.name.toUpperCase());
       * }
       * ```
       */
      kernel.register('is', <T>(data: unknown, schema: JsonSchema): data is T => {
        const errors = validateAgainstSchema(data, schema);
        return errors.length === 0;
      }, 'schema');
    },
  };
}

export const schemaPlugin = createSchemaPlugin();
