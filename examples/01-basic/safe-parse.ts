import { json } from '@oxog/json';

const validResult = json.safeParse('{"valid": true}');
if (validResult.ok) {
  console.log('Valid JSON:', validResult.value);
} else {
  console.log('Parse error:', validResult.error?.message);
}

const invalidResult = json.safeParse('{broken json}');
if (!invalidResult.ok) {
  console.log('Error code:', invalidResult.error?.code);
  console.log('Error message:', invalidResult.error?.message);
}
