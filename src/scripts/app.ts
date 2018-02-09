import { Animal, Bar, Foo } from './file2';

const bar = new Bar();
const animal = new Animal();
const foo = new Foo();
foo.test(bar, animal);

export { Animal, Bar, Foo } from './file2';
