import { json } from '@oxog/json';

const jsonString = '{"name": "Alice", "age": 30, "active": true}';

const data = json.parse(jsonString);
console.log('Parsed:', data);

const backToString = json.stringify(data);
console.log('Stringified:', backToString);

const pretty = json.stringify(data, { indent: 2 });
console.log('Pretty:\n' + pretty);
