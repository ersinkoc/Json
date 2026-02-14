import { json } from '@oxog/json';
import { immutablePlugin } from '@oxog/json/plugins';

json.use(immutablePlugin);

const data = { a: { b: { c: 1 } } };

const frozen = json.freeze(data);
console.log('Frozen:', Object.isFrozen(frozen));

const updated = json.immutableSet(frozen, 'a.b.c', 2);
console.log('Updated:', updated);
console.log('Original unchanged:', frozen);

const clone = json.clone(data);
console.log('Clone:', clone);
