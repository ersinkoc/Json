/**
 * JSON Schema fixtures for testing validation
 */

export const validSchemas = {
  // Basic type schemas
  stringSchema: {
    type: 'string',
  },

  numberSchema: {
    type: 'number',
  },

  booleanSchema: {
    type: 'boolean',
  },

  nullSchema: {
    type: 'null',
  },

  // Object schemas
  simpleObject: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      age: { type: 'number' },
    },
  },

  userSchema: {
    type: 'object',
    properties: {
      id: { type: 'number' },
      name: { type: 'string', minLength: 1 },
      email: { type: 'string', format: 'email' },
      age: { type: 'number', minimum: 0, maximum: 150 },
      active: { type: 'boolean' },
    },
    required: ['id', 'name', 'email'],
  },

  // Array schemas
  simpleArray: {
    type: 'array',
    items: { type: 'string' },
  },

  numberArray: {
    type: 'array',
    items: { type: 'number' },
    minItems: 1,
    maxItems: 10,
  },

  userArray: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        name: { type: 'string' },
      },
      required: ['id', 'name'],
    },
  },

  // Complex schemas
  addressSchema: {
    type: 'object',
    properties: {
      street: { type: 'string' },
      city: { type: 'string' },
      state: { type: 'string', maxLength: 2 },
      zipCode: {
        type: 'string',
        pattern: '^\\d{5}(-\\d{4})?$',
      },
      country: { type: 'string', enum: ['US', 'CA', 'MX'] },
    },
    required: ['street', 'city', 'country'],
  },

  // Validation schemas
  enumSchema: {
    type: 'string',
    enum: ['red', 'green', 'blue'],
  },

  constSchema: {
    type: 'object',
    properties: {
      version: { const: '1.0.0' },
    },
  },

  combinedSchema: {
    allOf: [
      { type: 'object' },
      {
        properties: {
          name: { type: 'string' },
        },
        required: ['name'],
      },
    ],
  },

  anyOfSchema: {
    anyOf: [
      { type: 'string' },
      { type: 'number' },
    ],
  },

  oneOfSchema: {
    oneOf: [
      { type: 'string' },
      { type: 'number' },
    ],
  },

  notSchema: {
    not: {
      type: 'string',
    },
  },

  // String validation
  emailSchema: {
    type: 'string',
    format: 'email',
  },

  uriSchema: {
    type: 'string',
    format: 'uri',
  },

  dateSchema: {
    type: 'string',
    format: 'date',
  },

  dateTimeSchema: {
    type: 'string',
    format: 'date-time',
  },

  uuidSchema: {
    type: 'string',
    format: 'uuid',
  },

  hostnameSchema: {
    type: 'string',
    format: 'hostname',
  },

  ipv4Schema: {
    type: 'string',
    format: 'ipv4',
  },

  ipv6Schema: {
    type: 'string',
    format: 'ipv6',
  },
};

export const invalidSchemas = {
  // Invalid type
  invalidType: {
    type: 'invalid',
  },

  // Invalid format
  invalidFormat: {
    type: 'string',
    format: 'not-a-real-format',
  },

  // Conflicting constraints
  conflictingNumber: {
    type: 'number',
    minimum: 10,
    maximum: 5,
  },

  // Invalid enum
  emptyEnum: {
    type: 'string',
    enum: [],
  },
};

export const testCases = {
  valid: [
    {
      schema: validSchemas.stringSchema,
      data: 'Hello, World!',
      description: 'Valid string',
    },
    {
      schema: validSchemas.numberSchema,
      data: 42,
      description: 'Valid number',
    },
    {
      schema: validSchemas.userSchema,
      data: {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
      },
      description: 'Valid user object',
    },
    {
      schema: validSchemas.emailSchema,
      data: 'test@example.com',
      description: 'Valid email',
    },
    {
      schema: validSchemas.uriSchema,
      data: 'https://example.com',
      description: 'Valid URI',
    },
    {
      schema: validSchemas.uuidSchema,
      data: '550e8400-e29b-41d4-a716-446655440000',
      description: 'Valid UUID',
    },
  ],

  invalid: [
    {
      schema: validSchemas.stringSchema,
      data: 123,
      description: 'Number instead of string',
    },
    {
      schema: validSchemas.userSchema,
      data: {
        id: 1,
        name: 'John',
        // Missing email (required)
      },
      description: 'Missing required field',
    },
    {
      schema: validSchemas.emailSchema,
      data: 'not-an-email',
      description: 'Invalid email format',
    },
    {
      schema: validSchemas.enumSchema,
      data: 'yellow',
      description: 'Value not in enum',
    },
    {
      schema: {
        type: 'object',
        properties: {
          age: { type: 'number', minimum: 18 },
        },
      },
      data: { age: 15 },
      description: 'Value below minimum',
    },
    {
      schema: {
        type: 'array',
        items: { type: 'number' },
        uniqueItems: true,
      },
      data: [1, 2, 3, 2],
      description: 'Non-unique items in array',
    },
  ],
};
