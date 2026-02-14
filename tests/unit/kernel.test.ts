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

    it('should handle plugin install error with non-Error object', () => {
      const onError = vi.fn();
      const plugin: JsonPlugin = {
        name: 'error-plugin',
        version: '1.0.0',
        install: () => {
          throw 'string error'; // Non-Error object
        },
        onError,
      };

      expect(() => kernel.use(plugin)).toThrow('Failed to load plugin');
      expect(onError).toHaveBeenCalled();
      const errorArg = onError.mock.calls[0][0];
      expect(errorArg).toBeInstanceOf(Error);
      expect(errorArg.message).toBe('string error');
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

    it('should reinstall remaining plugins when unloading', () => {
      const plugin1: JsonPlugin = {
        name: 'plugin1',
        version: '1.0.0',
        install: (k) => {
          k.register('method1', () => 'from1');
        },
      };

      const plugin2: JsonPlugin = {
        name: 'plugin2',
        version: '1.0.0',
        install: (k) => {
          k.register('method2', () => 'from2');
        },
      };

      kernel.use(plugin1, plugin2);
      expect(kernel.has('method1')).toBe(true);
      expect(kernel.has('method2')).toBe(true);

      // Unload plugin1 - plugin2 should be reinstalled
      kernel.unload('plugin1');
      expect(kernel.has('method2')).toBe(true);
      expect(kernel.has('method1')).toBe(false);
    });

    it('should skip errors when reinstalling plugins after unload', () => {
      const plugin1: JsonPlugin = {
        name: 'plugin1',
        version: '1.0.0',
        install: () => {},
      };

      const plugin2: JsonPlugin = {
        name: 'plugin2',
        version: '1.0.0',
        install: () => {
          kernel.register('method2', () => 'from2');
        },
      };

      // Make plugin2's install fail on second call
      let callCount = 0;
      const failingPlugin: JsonPlugin = {
        name: 'failing',
        version: '1.0.0',
        install: () => {
          callCount++;
          if (callCount > 1) {
            throw new Error('Install fails on reinstall');
          }
        },
      };

      kernel.use(plugin1, failingPlugin, plugin2);
      expect(kernel.has('method2')).toBe(true);

      // Unload plugin1 - should not throw despite failing plugin reinstall
      expect(() => kernel.unload('plugin1')).not.toThrow();
      // plugin2 should still be reinstalled even though failingPlugin throws
      expect(kernel.has('method2')).toBe(true);
    });

    it('should clear all methods when unloading', () => {
      const plugin1: JsonPlugin = {
        name: 'plugin1',
        version: '1.0.0',
        install: (k) => {
          k.register('method1', () => 'from1');
        },
      };

      const plugin2: JsonPlugin = {
        name: 'plugin2',
        version: '1.0.0',
        install: (k) => {
          k.register('method2', () => 'from2');
        },
      };

      kernel.use(plugin1, plugin2);
      expect(kernel.has('method1')).toBe(true);
      expect(kernel.has('method2')).toBe(true);

      kernel.unload('plugin1');
      // After unload, methods are cleared and remaining plugins are reinstalled
      expect(kernel.has('method1')).toBe(false);
      expect(kernel.has('method2')).toBe(true);
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

  describe('getPlugin', () => {
    it('should return loaded plugin', () => {
      const plugin: JsonPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        install: () => {},
      };
      kernel.use(plugin);
      const retrieved = kernel.getPlugin('test-plugin');
      expect(retrieved).toBe(plugin);
    });

    it('should return undefined for non-existent plugin', () => {
      expect(kernel.getPlugin('nonexistent')).toBeUndefined();
    });
  });

  describe('listPlugins', () => {
    it('should return empty array when no plugins loaded', () => {
      expect(kernel.listPlugins()).toEqual([]);
    });

    it('should return list of loaded plugin names', () => {
      const plugin1: JsonPlugin = {
        name: 'plugin-1',
        version: '1.0.0',
        install: () => {},
      };
      const plugin2: JsonPlugin = {
        name: 'plugin-2',
        version: '1.0.0',
        install: () => {},
      };
      kernel.use(plugin1, plugin2);
      const plugins = kernel.listPlugins();
      expect(plugins).toContain('plugin-1');
      expect(plugins).toContain('plugin-2');
      expect(plugins).toHaveLength(2);
    });
  });

  describe('has', () => {
    it('should return false for non-existent method', () => {
      expect(kernel.has('nonexistent')).toBe(false);
    });

    it('should return true for registered method', () => {
      kernel.register('testMethod', () => true);
      expect(kernel.has('testMethod')).toBe(true);
    });
  });

  describe('handleError', () => {
    it('should call config onError handler', () => {
      const onError = vi.fn();
      const k = new JsonKernelImpl({ onError });
      const error = new Error('Test error');
      k.handleError(error);
      expect(onError).toHaveBeenCalledWith(error);
    });

    it('should emit error event when no onError handler', () => {
      let emittedError: Error | undefined;
      kernel.on('error', (err) => {
        emittedError = err as Error;
      });
      const error = new Error('Test error');
      kernel.handleError(error);
      expect(emittedError).toBe(error);
    });

    it('should emit error event when calling handleError', () => {
      let receivedError: Error | undefined;
      kernel.on('error', (err) => {
        receivedError = err as Error;
      });
      const error = new Error('Test error');
      kernel.handleError(error);
      expect(receivedError).toBe(error);
    });
  });

  describe('init with onInit', () => {
    it('should call onInit for plugins with onInit hook', async () => {
      let initCalled = false;
      const plugin: JsonPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        install: () => {},
        onInit: () => {
          initCalled = true;
        },
      };

      kernel.use(plugin);
      await kernel.init();
      expect(initCalled).toBe(true);
    });

    it('should call onInit with context', async () => {
      let receivedContext: any;
      const ctx = { value: 42 };
      const plugin: JsonPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        install: () => {},
        onInit: (context) => {
          receivedContext = context;
        },
      };

      const k = new JsonKernelImpl({}, ctx);
      k.use(plugin);
      await k.init();
      expect(receivedContext).toBe(ctx);
    });

    it('should emit kernel:initialized event', async () => {
      let initialized = false;
      kernel.on('kernel:initialized', () => {
        initialized = true;
      });
      await kernel.init();
      expect(initialized).toBe(true);
    });

    it('should not init twice', async () => {
      let count = 0;
      const plugin: JsonPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        install: () => {},
        onInit: () => {
          count++;
        },
      };

      kernel.use(plugin);
      await kernel.init();
      await kernel.init();
      expect(count).toBe(1);
    });

    it('should call onInit for plugins loaded after initialization', async () => {
      let firstInit = false;
      let secondInit = false;

      const plugin1: JsonPlugin = {
        name: 'plugin1',
        version: '1.0.0',
        install: () => {},
        onInit: () => {
          firstInit = true;
        },
      };

      const plugin2: JsonPlugin = {
        name: 'plugin2',
        version: '1.0.0',
        install: () => {},
        onInit: () => {
          secondInit = true;
        },
      };

      kernel.use(plugin1);
      await kernel.init();
      expect(firstInit).toBe(true);
      expect(secondInit).toBe(false);

      kernel.use(plugin2);
      expect(secondInit).toBe(true);
    });
  });

  describe('emit plugin:unloaded', () => {
    it('should emit plugin:unloaded event', () => {
      let unloadedName: string | undefined;
      kernel.on('plugin:unloaded', (data: any) => {
        unloadedName = data.name;
      });

      const plugin: JsonPlugin = {
        name: 'test-plugin',
        version: '1.0.0',
        install: () => {},
      };

      kernel.use(plugin);
      kernel.unload('test-plugin');
      expect(unloadedName).toBe('test-plugin');
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
