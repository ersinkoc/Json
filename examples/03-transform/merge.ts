import { json } from '@oxog/json';
import { transformPlugin } from '@oxog/json/plugins';

json.use(transformPlugin);

const merged = json.merge(
  { a: 1, b: { c: 2 } },
  { b: { d: 3 }, e: 4 }
);
console.log('Merged:', merged);

const flat = json.flatten({ a: { b: { c: 1 } }, d: 2 });
console.log('Flattened:', flat);

const nested = json.unflatten({ 'a.b.c': 1, 'd': 2 });
console.log('Unflattened:', nested);

const data = { name: 'John', email: 'john@example.com', password: 'secret' };
const picked = json.pick(data, ['name', 'email']);
console.log('Picked:', picked);

const omitted = json.omit(data, ['password']);
console.log('Omitted:', omitted);
