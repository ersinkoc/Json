import type { JsonPlugin, JsonKernel, JsonConfig } from "./types";
import { PluginError } from "./errors";

type EventHandler = (...args: unknown[]) => void;

class SimpleEventEmitter {
  private handlers: Map<string, Set<EventHandler>> = new Map();

  on(event: string, handler: EventHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.add(handler);
    }
  }

  off(event: string, handler: EventHandler): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  emit(event: string, data?: unknown): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(data);
        } catch (e) {
          console.error(`Error in event handler for "${event}":`, e);
        }
      }
    }
  }
}

export class JsonKernelImpl<TContext = unknown>
  extends SimpleEventEmitter
  implements JsonKernel<TContext>
{
  private plugins: Map<string, JsonPlugin<TContext>> = new Map();
  public methods: Map<string, Function> = new Map();
  private methodOwners: Map<string, string> = new Map(); // Maps method name to plugin name
  private config: JsonConfig;
  private context: TContext;
  private initialized = false;

  constructor(config: JsonConfig = {}, context?: TContext) {
    super();
    this.config = config;
    this.context = context as TContext;
  }

  /** @example
   * ```ts
   * json.use(parsePlugin, stringifyPlugin, queryPlugin);
   * ```
   */
  use(...plugins: JsonPlugin<TContext>[]): void {
    for (const plugin of plugins) {
      this.loadPlugin(plugin);
    }

    if (this.initialized) {
      for (const plugin of plugins) {
        if (plugin.onInit) {
          plugin.onInit(this.context);
        }
      }
    }
  }

  private loadPlugin(plugin: JsonPlugin<TContext>): void {
    if (this.plugins.has(plugin.name)) {
      return;
    }

    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        if (!this.plugins.has(dep)) {
          throw new PluginError(
            `Plugin "${plugin.name}" requires plugin "${dep}"`,
            plugin.name,
          );
        }
      }
    }

    try {
      plugin.install(this);
      this.plugins.set(plugin.name, plugin);
      this.emit("plugin:loaded", {
        name: plugin.name,
        version: plugin.version,
      });
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e));
      if (plugin.onError) {
        plugin.onError(error);
      }
      throw new PluginError(
        `Failed to load plugin "${plugin.name}": ${error.message}`,
        plugin.name,
        { originalError: error },
      );
    }
  }

  /** @example
   * ```ts
   * json.unload('parse'); // Unload the parse plugin
   * ```
   */
  unload(name: string): void {
    const plugin = this.plugins.get(name);
    if (plugin) {
      if (plugin.onDestroy) {
        plugin.onDestroy();
      }
      this.plugins.delete(name);
      this.emit("plugin:unloaded", { name });

      // Clear all methods before reinstalling remaining plugins
      // This ensures clean state and proper re-registration
      this.methods.clear();
      this.methodOwners.clear();

      // Reinstall remaining plugins to re-register their methods
      for (const p of this.plugins.values()) {
        try {
          p.install(this);
        } catch {
          // Skip errors during reinstall
        }
      }
    }
  }

  async init(): Promise<void> {
    if (this.initialized) return;

    for (const plugin of this.plugins.values()) {
      if (plugin.onInit) {
        await plugin.onInit(this.context);
      }
    }

    this.initialized = true;
    this.emit("kernel:initialized");
  }

  /** @example
   * ```ts
   * json.register('customMethod', (a, b) => a + b);
   * json.call('customMethod', 1, 2); // 3
   * ```
   */
  register(name: string, method: Function, pluginName?: string): void {
    this.methods.set(name, method);
    if (pluginName) {
      this.methodOwners.set(name, pluginName);
    }
  }

  unregister(name: string): void {
    this.methods.delete(name);
    this.methodOwners.delete(name);
  }

  has(name: string): boolean {
    return this.methods.has(name);
  }

  get<T extends Function>(name: string): T | undefined {
    return this.methods.get(name) as T | undefined;
  }

  getContext(): TContext {
    return this.context;
  }

  setContext(context: TContext): void {
    this.context = context;
  }

  getConfig(): JsonConfig {
    return this.config;
  }

  listPlugins(): string[] {
    return Array.from(this.plugins.keys());
  }

  getPlugin(name: string): JsonPlugin<TContext> | undefined {
    return this.plugins.get(name);
  }

  handleError(error: Error): void {
    if (this.config.onError) {
      this.config.onError(error);
    } else {
      this.emit("error", error);
    }
  }

  call<T>(name: string, ...args: unknown[]): T {
    const method = this.methods.get(name);
    if (!method) {
      throw new Error(`Method "${name}" not found`);
    }
    return method(...args) as T;
  }
}

/**
 * Creates a new JSON kernel instance with optional plugins
 * @example
 * ```ts
 * import { createJson, parsePlugin, stringifyPlugin } from '@oxog/json';
 *
 * // Create kernel with core plugins
 * const json = createJson({});
 * json.use(parsePlugin, stringifyPlugin);
 *
 * // Parse and stringify
 * const obj = json.parse('{"name":"John"}');
 * const str = json.stringify({ name: 'John' });
 * ```
 * @example
 * ```ts
 * // With custom configuration
 * const json = createJson({
 *   parse: { maxDepth: 100, maxLength: 1_000_000 }
 * });
 * ```
 */
export function createJson<TContext = unknown>(
  config: JsonConfig = {},
  context?: TContext,
): JsonKernel<TContext> & Record<string, Function> {
  const kernel = new JsonKernelImpl<TContext>(config, context);

  // Cache for method lookups to avoid repeated Map.get() calls
  const methodCache = new Map<string, Function>();
  const propertyCache = new Map<string, unknown>();

  const handler: ProxyHandler<JsonKernelImpl<TContext>> = {
    get(target, prop: string) {
      // Check cache first
      const cached = methodCache.get(prop);
      if (cached) {
        return cached;
      }

      const method = target.methods.get(prop);
      if (method) {
        methodCache.set(prop, method);
        return method;
      }

      // Check property cache
      const cachedProp = propertyCache.get(prop);
      if (cachedProp !== undefined) {
        return cachedProp;
      }

      const value = target[prop as keyof JsonKernelImpl<TContext>];
      if (typeof value === 'function') {
        const bound = value.bind(target);
        propertyCache.set(prop, bound);
        return bound;
      }

      propertyCache.set(prop, value);
      return value;
    },
    has(target, prop: string) {
      return target.methods.has(prop) || prop in target;
    },
  };

  return new Proxy(kernel, handler) as unknown as JsonKernel<TContext> &
    Record<string, Function>;
}

export type { JsonKernel };
