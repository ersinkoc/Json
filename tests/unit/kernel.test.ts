import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JsonKernelImpl, createJson } from '../../src/kernel';
import type { JsonPlugin } from '../../src/types';

describe('JsonKernelImpl', () => {
  let kernel: JsonKernelImpl;

  beforeEach(() => {
    kernel = new JsonKernelImpl();
  });

  describe('register and get', () => {
    it('should register a method', () => {
      const fn = (x: number) => x * 2;
      kernel.register('double', fn);
      expect(kernel.has('double')).toBe(true);
    });

    it('should get a registered method', () => {
      const fn = (x: number) => x * 2;
      kernel.register('double', fn);
      const retrieved = kernel.get<(x: number) => number>('double');
      expect(retrieved).toBe(fn);
      expect(retrieved?.(5)).toBe(10);
    });

    it('should return undefined for non-existent method', () => {
      expect(kernel.get('nonexistent')).toBeUndefined();
    });

    it('should unregister a method', () => {
      kernel.register('test', () => true);
      expect(kernel.has('test')).toBe(true);
      kernel.unregister('test');
      expect(kernel.has('test')).toBe(false);
    });

    it('should call a registered method', () => {
      kernel.register('add', (a: number, b: number) => a + b);
      expect(kernel.call('add', 2, 3)).toBe(5);
    });

    it('should throw when calling non-existent method', () => {
      expect(() => kernel.call('nonexistent')).toThrow('Method "nonexistent" not found');
    });
  });

  describe('plugin system', () => {
    it('should load a plugin', () => {
      const plugin: JsonPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        install: (k) => {
          k.register('testMethod', () => 'hello');
        },
      };

      kernel.use(plugin);
      expect(kernel.listPlugins()).toContain('test-plugin');
    });

    it('should not load same plugin twice', () => {
      let installCount = 0;
      const plugin: JsonPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        install: () => {
          installCount++;
        },
      };

      kernel.use(plugin);
      kernel.use(plugin);
      expect(installCount).toBe(1);
    });

    it('should resolve plugin dependencies', () => {
      const depPlugin: JsonPlugin = {
        name: 'dep-plugin',
        version: '1.0.0',
        install: () => {},
      };

      const mainPlugin: JsonPlugin = {
        name: 'main-plugin',
        version: '1.0.0',
        dependencies: ['dep-plugin'],
        install: () => {},
      };

      kernel.use(depPlugin, mainPlugin);
      expect(kernel.listPlugins()).toContain('dep-plugin');
      expect(kernel.listPlugins()).toContain('main-plugin');
    });

    it('should throw on missing dependency', () => {
      const plugin: JsonPlugin = {
        name: 'main-plugin',
        version: '1.0.0',
        dependencies: ['missing-plugin'],
        install: () => {},
      };

      expect(() => kernel.use(plugin)).toThrow('requires plugin');
    });

    it('should throw PluginError on missing dependency', () => {
      const plugin: JsonPlugin = {
        name: 'main-plugin',
        version: '1.0.0',
        dependencies: ['missing-plugin'],
        install: () => {},
      };

      try {
        kernel.use(plugin);
        expect.fail('Should throw');
      } catch (e: any) {
        expect(e.code).toBe('PLUGIN_ERROR');
      }
    });

    it('should handle plugin install error', () => {
      const plugin: JsonPlugin = {
        name: 'error-plugin',
        version: '1.0.0',
        install: () => {
          throw new Error('Install failed');
        },
      };

      expect(() => kernel.use(plugin)).toThrow('Failed to load plugin');
    });

    it('should call onError when plugin install fails', () => {
      const onError = vi.fn();
      const plugin: JsonPlugin = {
        name: 'error-plugin',
        version: '1.0.0',
        install: () => {
          throw new Error('Install failed');
        },
        onError,
      };

      expect(() => kernel.use(plugin)).toThrow();
      expect(onError).toHaveBeenCalled();
    });

    it('should unload a plugin', () => {
      const plugin: JsonPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        install: () => {},
      };

      kernel.use(plugin);
      expect(kernel.listPlugins()).toContain('test-plugin');
      kernel.unload('test-plugin');
      expect(kernel.listPlugins()).not.toContain('test-plugin');
    });

    it('should call onDestroy when unloading', async () => {
      let destroyed = false;
      const plugin: JsonPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        install: () => {},
        onDestroy: () => {
          destroyed = true;
        },
      };

      kernel.use(plugin);
      kernel.unload('test-plugin');
      expect(destroyed).toBe(true);
    });
  });

  describe('event system', () => {
    it('should emit and receive events', () => {
      let received = '';
      kernel.on('test-event', (data) => {
        received = data as string;
      });

      kernel.emit('test-event', 'hello');
      expect(received).toBe('hello');
    });

    it('should remove event listener', () => {
      let count = 0;
      const handler = () => {
        count++;
      };

      kernel.on('test-event', handler);
      kernel.emit('test-event');
      expect(count).toBe(1);

      kernel.off('test-event', handler);
      kernel.emit('test-event');
      expect(count).toBe(1);
    });

    it('should handle error in event handler', () => {
      const errorHandler = vi.fn();
      const originalError = console.error;
      console.error = errorHandler;

      kernel.on('test-event', () => {
        throw new Error('Handler error');
      });

      kernel.emit('test-event');
      expect(errorHandler).toHaveBeenCalled();
      console.error = originalError;
    });

    it('should emit plugin:loaded event', () => {
      let loaded = false;
      kernel.on('plugin:loaded', () => {
        loaded = true;
      });

      const plugin: JsonPlugin = {
        name: 'test',
        version: '1.0.0',
        install: () => {},
      };

      kernel.use(plugin);
      expect(loaded).toBe(true);
    });
  });

  describe('context', () => {
    it('should get and set context', () => {
      kernel.setContext({ foo: 'bar' });
      expect(kernel.getContext()).toEqual({ foo: 'bar' });
    });

    it('should accept context in constructor', () => {
      const ctx = { value: 42 };
      const k = new JsonKernelImpl({}, ctx);
      expect(k.getContext()).toEqual(ctx);
    });
  });

  describe('config', () => {
    it('should return config', () => {
      const config = { parse: { maxDepth: 50 } };
      const k = new JsonKernelImpl(config);
      expect(k.getConfig()).toEqual(config);
    });
  });
});

describe('createJson proxy', () => {
  it('should create a kernel instance', () => {
    const instance = createJson();
    expect(instance).toBeDefined();
    expect(instance.has).toBeDefined();
    expect(instance.register).toBeDefined();
  });

  it('should create instance with config', () => {
    const instance = createJson({
      parse: { maxDepth: 100 },
    });
    expect(instance.getConfig?.()?.parse?.maxDepth).toBe(100);
  });

  it('should proxy registered methods', () => {
    const instance = createJson();
    instance.register('test', (x: number) => x * 2);
    expect((instance as any).test(5)).toBe(10);
  });

  it('should proxy has check for methods', () => {
    const instance = createJson();
    instance.register('test', () => true);
    expect('test' in instance).toBe(true);
  });

  it('should proxy has check for kernel properties', () => {
    const instance = createJson();
    expect('register' in instance).toBe(true);
    expect('has' in instance).toBe(true);
  });

  it('should return undefined for non-existent property', () => {
    const instance = createJson();
    expect((instance as any).nonexistent).toBeUndefined();
  });
});
