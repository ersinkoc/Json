import { json } from '@oxog/json';
import { pathPlugin } from '@oxog/json/plugins';

json.use(pathPlugin);

const data = {
  store: {
    books: [
      { title: 'Book A', price: 10, category: 'fiction' },
      { title: 'Book B', price: 25, category: 'science' },
      { title: 'Book C', price: 8, category: 'fiction' }
    ]
  }
};

const titles = json.query(data, '$.store.books[*].title');
console.log('All titles:', titles);

const cheap = json.query(data, '$.store.books[?(@.price < 15)]');
console.log('Cheap books:', cheap.map((b: { title: string }) => b.title));

const fiction = json.query(data, '$.store.books[?(@.category == "fiction")].title');
console.log('Fiction titles:', fiction);
