import { json } from '@oxog/json';

const obj: Record<string, unknown> = { name: 'Alice' };
obj.self = obj;

try {
  json.stringify(obj);
} catch (e) {
  console.log('Circular reference error:', (e as Error).message);
}

const safe = json.stringify(obj, { circular: '[Circular]' });
console.log('Safe stringify:', safe);
