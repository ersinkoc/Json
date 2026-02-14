import type { JsonPlugin, JsonKernel } from '../types';
import { parsePlugin } from './core/parse.plugin';
import { stringifyPlugin } from './core/stringify.plugin';
import { queryPlugin } from './core/query.plugin';
import { pathPlugin } from './optional/path.plugin';
import { transformPlugin } from './optional/transform.plugin';
import { diffPlugin, patchPlugin } from './optional/diff.plugin';
import { schemaPlugin } from './optional/schema.plugin';
import { streamPlugin } from './optional/stream.plugin';
import { repairPlugin } from './optional/repair.plugin';
import { json5Plugin } from './optional/json5.plugin';
import { typePlugin } from './optional/type.plugin';
import { immutablePlugin } from './optional/immutable.plugin';
import { JsonKernelImpl } from '../kernel';

export * from './core';
export * from './optional';

export const corePlugins: JsonPlugin[] = [parsePlugin, stringifyPlugin, queryPlugin];

export const optionalPlugins: JsonPlugin[] = [
  pathPlugin,
  transformPlugin,
  diffPlugin,
  patchPlugin,
  schemaPlugin,
  streamPlugin,
  repairPlugin,
  json5Plugin,
  typePlugin,
  immutablePlugin,
];

export function createPreset(plugins: JsonPlugin[]): JsonPlugin {
  return {
    name: `preset-${plugins.map(p => p.name).join('-')}`,
    version: '1.0.0',
    install(kernel: JsonKernel) {
      const impl = kernel as unknown as JsonKernelImpl;
      for (const plugin of plugins) {
        impl.use(plugin);
      }
    },
  };
}

export const preset = {
  minimal: createPreset([transformPlugin, repairPlugin]),
  full: createPreset(optionalPlugins),
  validation: createPreset([schemaPlugin, typePlugin]),
  processing: createPreset([transformPlugin, diffPlugin, patchPlugin, streamPlugin]),
};

export { createPreset as createCustomPreset };
