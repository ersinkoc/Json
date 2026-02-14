import { json } from '@oxog/json';
import { schemaPlugin } from '@oxog/json/plugins';

json.use(schemaPlugin);

const userSchema = {
  type: 'object',
  required: ['name', 'email'],
  properties: {
    name: { type: 'string', minLength: 1 },
    email: { type: 'string', format: 'email' },
    age: { type: 'integer', minimum: 0 }
  }
};

const validData = { name: 'Alice', email: 'alice@example.com', age: 30 };
const validResult = json.validate(validData, userSchema);
console.log('Valid:', validResult.valid);

const invalidData = { name: '', email: 'invalid' };
const invalidResult = json.validate(invalidData, userSchema);
console.log('Valid:', invalidResult.valid);
console.log('Errors:', invalidResult.errors);

const validate = json.compile(userSchema);
console.log('Compiled validator:', validate(validData).valid);
