import { json } from '@oxog/json';
import { repairPlugin } from '@oxog/json/plugins';

json.use(repairPlugin);

const broken = '{name: "test", items: [1, 2, 3,], /* comment */}';
const repaired = json.repair(broken);
console.log('Repaired:', repaired);

const fixed = json.parse(repaired);
console.log('Parsed:', fixed);
