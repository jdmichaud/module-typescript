import { optional, validate } from './file1';

export class Bar {
  public greet() { console.log('Hello I\'am bar'); }
}

export class Animal {
  public greet() { console.log('roar!'); }
}

export class Foo {
  @validate
  public test(bar: Bar, @optional animal?: Animal) {
    bar.greet();
    if (animal !== undefined) {
      animal.greet();
    }
  }
}

/*
foo = new Foo();
bar = new Bar();
animal = new Animal();
// Should work
foo.test(bar, animal);
foo.test(bar);
foo.test(bar, undefined);
foo.test(bar, null);
// Should fail
foo.test();
foo.test(bar, bar);
foo.test({ toto: 42 });
foo.test(undefined);
foo.test(animal);
*/
