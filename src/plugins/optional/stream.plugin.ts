import type { JsonKernel, JsonPlugin } from '../../types';

interface StreamParser {
  parse(readable: ReadableStream<Uint8Array> | NodeJS.ReadableStream): AsyncIterable<unknown>;
  stringify(data: unknown, writable: WritableStream<Uint8Array> | NodeJS.WritableStream): Promise<void>;
  parseLines(readable: ReadableStream<Uint8Array> | NodeJS.ReadableStream): AsyncIterable<unknown>;
  stringifyLines(data: unknown[], writable: WritableStream<Uint8Array> | NodeJS.WritableStream): Promise<void>;
}

async function* parseStream(
  readable: ReadableStream<Uint8Array> | NodeJS.ReadableStream
): AsyncIterable<unknown> {
  const decoder = new TextDecoder();
  let buffer = '';
  let depth = 0;
  let inString = false;
  let escape = false;
  let startIndex = 0;

  const reader = 'getReader' in readable 
    ? readable.getReader() 
    : createNodeReader(readable as NodeJS.ReadableStream);

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      for (let i = 0; i < buffer.length; i++) {
        const char = buffer[i];
        if (!char) continue;

        if (inString) {
          if (escape) {
            escape = false;
          } else if (char === '\\') {
            escape = true;
          } else if (char === '"') {
            inString = false;
          }
          continue;
        }

        if (char === '"') {
          inString = true;
          continue;
        }

        if (char === '{' || char === '[') {
          if (depth === 0) {
            startIndex = i;
          }
          depth++;
        } else if (char === '}' || char === ']') {
          depth--;
          if (depth === 0) {
            const chunk = buffer.slice(startIndex, i + 1);
            try {
              yield JSON.parse(chunk);
            } catch {
              // Skip invalid chunks
            }
            buffer = buffer.slice(i + 1);
            i = -1;
          }
        }
      }
    }
  } finally {
    if ('releaseLock' in reader) {
      reader.releaseLock();
    }
  }
}

async function stringifyToStream(
  data: unknown,
  writable: WritableStream<Uint8Array> | NodeJS.WritableStream
): Promise<void> {
  const encoder = new TextEncoder();
  const json = JSON.stringify(data, null, 2);

  if ('getWriter' in writable) {
    const writer = writable.getWriter();
    try {
      await writer.write(encoder.encode(json));
    } finally {
      await writer.close();
    }
  } else {
    return new Promise((resolve, reject) => {
      (writable as NodeJS.WritableStream).write(json, 'utf8', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

async function* parseJsonlStream(
  readable: ReadableStream<Uint8Array> | NodeJS.ReadableStream
): AsyncIterable<unknown> {
  const decoder = new TextDecoder();
  let buffer = '';

  const reader = 'getReader' in readable 
    ? readable.getReader() 
    : createNodeReader(readable as NodeJS.ReadableStream);

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed) {
          try {
            yield JSON.parse(trimmed);
          } catch {
            // Skip invalid lines
          }
        }
      }
    }

    if (buffer.trim()) {
      try {
        yield JSON.parse(buffer.trim());
      } catch {
        // Skip invalid final line
      }
    }
  } finally {
    if ('releaseLock' in reader) {
      reader.releaseLock();
    }
  }
}

async function stringifyJsonlToStream(
  data: unknown[],
  writable: WritableStream<Uint8Array> | NodeJS.WritableStream
): Promise<void> {
  const encoder = new TextEncoder();

  if ('getWriter' in writable) {
    const writer = writable.getWriter();
    try {
      for (const item of data) {
        await writer.write(encoder.encode(JSON.stringify(item) + '\n'));
      }
    } finally {
      await writer.close();
    }
  } else {
    return new Promise((resolve, reject) => {
      const write = (chunk: string) => {
        return new Promise<void>((res, rej) => {
          (writable as NodeJS.WritableStream).write(chunk, 'utf8', (err) => {
            if (err) rej(err);
            else res();
          });
        });
      };

      (async () => {
        for (const item of data) {
          await write(JSON.stringify(item) + '\n');
        }
        resolve();
      })().catch(reject);
    });
  }
}

function createNodeReader(readable: NodeJS.ReadableStream) {
  const chunks: Uint8Array[] = [];
  let resolveNext: ((value: { done: boolean; value: Uint8Array }) => void) | null = null;
  let done = false;

  readable.on('data', (chunk: Buffer | string) => {
    const uint8 = typeof chunk === 'string' ? new TextEncoder().encode(chunk) : new Uint8Array(chunk);
    if (resolveNext) {
      resolveNext({ done: false, value: uint8 });
      resolveNext = null;
    } else {
      chunks.push(uint8);
    }
  });

  readable.on('end', () => {
    done = true;
    if (resolveNext) {
      resolveNext({ done: true, value: new Uint8Array() });
      resolveNext = null;
    }
  });

  readable.on('error', () => {
    if (resolveNext) {
      resolveNext({ done: true, value: new Uint8Array() });
      resolveNext = null;
    }
  });

  return {
    async read(): Promise<{ done: boolean; value: Uint8Array }> {
      if (chunks.length > 0) {
        return { done: false, value: chunks.shift()! };
      }
      if (done) {
        return { done: true, value: new Uint8Array() };
      }
      return new Promise((resolve) => {
        resolveNext = resolve;
      });
    },
    releaseLock() {
      // No-op for Node.js streams
    },
  };
}

export function createStreamPlugin(): JsonPlugin {
  return {
    name: 'stream',
    version: '1.0.0',

    install(kernel: JsonKernel) {
      const streamApi: StreamParser = {
        parse: parseStream,
        stringify: stringifyToStream,
        parseLines: parseJsonlStream,
        stringifyLines: stringifyJsonlToStream,
      };

      kernel.register('stream', streamApi as unknown as Function, 'stream');
    },
  };
}

export const streamPlugin = createStreamPlugin();
