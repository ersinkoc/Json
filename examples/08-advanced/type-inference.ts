import { json } from '@oxog/json';
import { typePlugin } from '@oxog/json/plugins';

json.use(typePlugin);

const data = {
  name: 'Alice',
  age: 30,
  active: true,
  tags: ['admin', 'user'],
  address: {
    city: 'NYC',
    zip: '10001'
  }
};

const types = json.infer(data, { name: 'User', export: true });
console.log(types);
