import { json } from '@oxog/json';
import { diffPlugin, patchPlugin } from '@oxog/json/plugins';

json.use(diffPlugin, patchPlugin);

const before = { name: 'Alice', age: 30, city: 'NYC' };
const after = { name: 'Alice', age: 31, city: 'LA', email: 'alice@example.com' };

const diff = json.diff(before, after);
console.log('Diff:', diff);

const patched = json.patch(before, diff);
console.log('Patched:', patched);

const validation = json.validatePatch(diff);
console.log('Patch valid:', validation.valid);
