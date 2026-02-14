import { json } from '@oxog/json';

const data = {
  users: [
    { name: 'Alice', address: { city: 'NYC', zip: '10001' } },
    { name: 'Bob', address: { city: 'LA' } }
  ]
};

console.log('Get name:', json.get(data, 'users[0].name'));
console.log('Get city:', json.get(data, 'users[0].address.city'));
console.log('Get with fallback:', json.get(data, 'users[5].name', 'Unknown'));

const updated = json.set(data, 'users[0].name', 'Alice Smith');
console.log('After set:', updated.users[0].name);
console.log('Original unchanged:', data.users[0].name);

console.log('Has path:', json.has(data, 'users[0].address.zip'));
console.log('Has path (missing):', json.has(data, 'users[0].address.country'));

const removed = json.remove(data, 'users[0].address');
console.log('After remove:', removed.users[0]);

console.log('All paths:', json.paths(data).slice(0, 5));
