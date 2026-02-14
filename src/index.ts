import { createJson } from './kernel';
import { parsePlugin } from './plugins/core/parse.plugin';
import { stringifyPlugin } from './plugins/core/stringify.plugin';
import { queryPlugin } from './plugins/core/query.plugin';

export * from './types';
export * from './errors';
export * from './kernel';
export * from './utils';

/**
 * Default JSON kernel instance with core plugins pre-loaded
 * @example
 * ```ts
 * import { json } from '@oxog/json';
 *
 * // Parse JSON string
 * const obj = json.parse('{"name":"John","age":30}');
 * // => { name: 'John', age: 30 }
 *
 * // Stringify object
 * const str = json.stringify({ name: 'John', age: 30 });
 * // => '{"name":"John","age":30}'
 *
 * // Query with path
 * const value = json.get({ user: { name: 'John' } }, 'user.name');
 * // => 'John'
 * ```
 */
const kernel = createJson({});
kernel.use(parsePlugin);
kernel.use(stringifyPlugin);
kernel.use(queryPlugin);

export const json = kernel;

export { createJson };
export type { JsonKernel } from './kernel';

export default json;
