import { describe, it, expect } from 'vitest';
import {
  JsonError,
  JsonParseError,
  JsonPathError,
  JsonSchemaError,
  JsonPatchError,
  MaxDepthError,
  PluginError,
  CircularReferenceError
} from '../../src/errors';

describe('errors - complete coverage', () => {
  describe('JsonError', () => {
    it('should create base error with code', () => {
      const error = new JsonError('Test error', 'TEST_CODE');
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_CODE');
      expect(error.name).toBe('JsonError');
      expect(error.context).toBeUndefined();
    });

    it('should create error with context', () => {
      const context = { key: 'value', count: 42 };
      const error = new JsonError('Test', 'CODE', context);
      expect(error.context).toEqual(context);
    });

    it('should have proper prototype chain', () => {
      const error = new JsonError('Test', 'CODE');
      expect(error instanceof Error).toBe(true);
      expect(error instanceof JsonError).toBe(true);
    });
  });

  describe('JsonParseError', () => {
    it('should create parse error without context', () => {
      const error = new JsonParseError('Invalid JSON');
      expect(error.message).toBe('Invalid JSON');
      expect(error.code).toBe('JSON_PARSE_ERROR');
      expect(error.name).toBe('JsonParseError');
    });

    it('should create parse error with position', () => {
      const error = new JsonParseError('Unexpected token', { position: 10 });
      expect(error.context?.position).toBe(10);
    });

    it('should create parse error with line and column', () => {
      const error = new JsonParseError('Error', { line: 5, column: 10 });
      expect(error.context?.line).toBe(5);
      expect(error.context?.column).toBe(10);
    });

    it('should create parse error with input sample', () => {
      const error = new JsonParseError('Error', { input: '{"a":' });
      expect(error.context?.input).toBe('{"a":');
    });
  });

  describe('JsonPathError', () => {
    it('should create path error without context', () => {
      const error = new JsonPathError('Invalid path');
      expect(error.message).toBe('Invalid path');
      expect(error.code).toBe('JSON_PATH_ERROR');
      expect(error.name).toBe('JsonPathError');
    });

    it('should create path error with path context', () => {
      const error = new JsonPathError('Invalid path', { path: 'users.name' });
      expect(error.context?.path).toBe('users.name');
    });

    it('should create path error with expression', () => {
      const error = new JsonPathError('Invalid expression', { expression: '$.users[' });
      expect(error.context?.expression).toBe('$.users[');
    });
  });

  describe('JsonSchemaError', () => {
    it('should create schema error without context', () => {
      const error = new JsonSchemaError('Validation failed');
      expect(error.message).toBe('Validation failed');
      expect(error.code).toBe('JSON_SCHEMA_ERROR');
      expect(error.name).toBe('JsonSchemaError');
    });

    it('should create schema error with schema', () => {
      const schema = { type: 'string' };
      const error = new JsonSchemaError('Invalid type', { schema });
      expect(error.context?.schema).toEqual(schema);
    });

    it('should create schema error with errors array', () => {
      const errors = [{ path: '/name', message: 'required' }];
      const error = new JsonSchemaError('Validation failed', { errors });
      expect(error.context?.errors).toEqual(errors);
    });
  });

  describe('JsonPatchError', () => {
    it('should create patch error without context', () => {
      const error = new JsonPatchError('Patch failed');
      expect(error.message).toBe('Patch failed');
      expect(error.code).toBe('JSON_PATCH_ERROR');
      expect(error.name).toBe('JsonPatchError');
    });

    it('should create patch error with operation', () => {
      const operation = { op: 'add', path: '/test', value: 1 };
      const error = new JsonPatchError('Invalid operation', { operation });
      expect(error.context?.operation).toEqual(operation);
    });

    it('should create patch error with index', () => {
      const error = new JsonPatchError('Error', { index: 5 });
      expect(error.context?.index).toBe(5);
    });
  });

  describe('MaxDepthError', () => {
    it('should create max depth error', () => {
      const error = new MaxDepthError(100);
      expect(error.message).toBe('Maximum nesting depth of 100 exceeded');
      expect(error.code).toBe('MAX_DEPTH_ERROR');
      expect(error.name).toBe('MaxDepthError');
      expect(error.context?.maxDepth).toBe(100);
    });
  });

  describe('PluginError', () => {
    it('should create plugin error', () => {
      const error = new PluginError('Plugin failed', 'testPlugin');
      expect(error.message).toBe('Plugin failed');
      expect(error.code).toBe('PLUGIN_ERROR');
      expect(error.name).toBe('PluginError');
      expect(error.context?.pluginName).toBe('testPlugin');
    });

    it('should create plugin error with additional context', () => {
      const error = new PluginError('Error', 'myPlugin', { detail: 'info' });
      expect(error.context?.pluginName).toBe('myPlugin');
      expect(error.context?.detail).toBe('info');
    });
  });

  describe('CircularReferenceError', () => {
    it('should create circular reference error without context', () => {
      const error = new CircularReferenceError();
      expect(error.message).toBe('Circular reference detected');
      expect(error.code).toBe('CIRCULAR_REFERENCE_ERROR');
      expect(error.name).toBe('CircularReferenceError');
    });

    it('should create circular reference error with path', () => {
      const error = new CircularReferenceError({ path: 'a.b.c.a' });
      expect(error.context?.path).toBe('a.b.c.a');
    });
  });
});
