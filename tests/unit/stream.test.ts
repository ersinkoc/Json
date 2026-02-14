import { describe, it, expect } from 'vitest';
import { json } from '../../src/index';
import { streamPlugin } from '../../src/plugins';

describe('stream plugin', () => {
  beforeAll(() => {
    json.use(streamPlugin);
  });

  describe('stream API', () => {
    it('should have stream methods', () => {
      const stream = (json as any).stream;
      expect(stream).toBeDefined();
      expect(typeof stream.parse).toBe('function');
      expect(typeof stream.stringify).toBe('function');
      expect(typeof stream.parseLines).toBe('function');
      expect(typeof stream.stringifyLines).toBe('function');
    });
  });

  describe('parseLines', () => {
    it('should parse JSONL strings', async () => {
      const input = '{"a":1}\n{"b":2}\n{"c":3}';
      const results: unknown[] = [];
      
      for await (const item of (json as any).stream.parseLines(
        new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(input));
            controller.close();
          }
        })
      )) {
        results.push(item);
      }

      expect(results).toEqual([{ a: 1 }, { b: 2 }, { c: 3 }]);
    });

    it('should handle empty input', async () => {
      const results: unknown[] = [];
      
      for await (const item of (json as any).stream.parseLines(
        new ReadableStream({
          start(controller) {
            controller.close();
          }
        })
      )) {
        results.push(item);
      }

      expect(results).toEqual([]);
    });
  });

  describe('stringifyLines', () => {
    it('should stringify to JSONL', async () => {
      const data = [{ a: 1 }, { b: 2 }];
      const chunks: string[] = [];
      
      const writable = new WritableStream({
        write(chunk) {
          chunks.push(new TextDecoder().decode(chunk));
        }
      });

      await (json as any).stream.stringifyLines(data, writable);

      expect(chunks.join('')).toBe('{"a":1}\n{"b":2}\n');
    });
  });
});
