export { pathPlugin, createPathPlugin } from './path.plugin';
export { transformPlugin, createTransformPlugin } from './transform.plugin';
export { diffPlugin, createDiffPlugin, patchPlugin, createPatchPlugin } from './diff.plugin';
export { schemaPlugin, createSchemaPlugin } from './schema.plugin';
export { streamPlugin, createStreamPlugin } from './stream.plugin';
export { repairPlugin, createRepairPlugin } from './repair.plugin';
export { json5Plugin, createJson5Plugin } from './json5.plugin';
export { typePlugin, createTypePlugin } from './type.plugin';
export { immutablePlugin, createImmutablePlugin } from './immutable.plugin';

import type { JsonPlugin } from '../../types';
import { pathPlugin } from './path.plugin';
import { transformPlugin } from './transform.plugin';
import { diffPlugin, patchPlugin } from './diff.plugin';
import { schemaPlugin } from './schema.plugin';
import { streamPlugin } from './stream.plugin';
import { repairPlugin } from './repair.plugin';
import { json5Plugin } from './json5.plugin';
import { typePlugin } from './type.plugin';
import { immutablePlugin } from './immutable.plugin';

/**
 * Pre-configured plugin presets for common use cases
 * @example
 * ```ts
 * import { json } from '@oxog/json';
 * import { preset } from '@oxog/json/plugins';
 *
 * // Load all plugins
 * json.use(preset.full);
 *
 * // Load minimal plugins
 * json.use(preset.minimal);
 *
 * // Load validation plugins
 * json.use(preset.validation);
 * ```
 */
export const preset = {
  /**
   * All available plugins
   * Includes: path, transform, diff, patch, schema, stream, repair, json5, type, immutable
   */
  full: [
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
  ] as JsonPlugin<unknown>[],

  /**
   * Core plugins for basic JSON operations
   * Includes: transform, repair
   */
  minimal: [
    transformPlugin,
    repairPlugin,
  ] as JsonPlugin<unknown>[],

  /**
   * Validation and type checking plugins
   * Includes: schema, type
   */
  validation: [
    schemaPlugin,
    typePlugin,
  ] as JsonPlugin<unknown>[],

  /**
   * Data manipulation plugins
   * Includes: path, transform, diff, patch
   */
  manipulation: [
    pathPlugin,
    transformPlugin,
    diffPlugin,
    patchPlugin,
  ] as JsonPlugin<unknown>[],

  /**
   * Extended format support
   * Includes: json5, repair
   */
  formats: [
    json5Plugin,
    repairPlugin,
  ] as JsonPlugin<unknown>[],

  /**
   * Streaming and large file support
   * Includes: stream, immutable
   */
  streaming: [
    streamPlugin,
    immutablePlugin,
  ] as JsonPlugin<unknown>[],
};
