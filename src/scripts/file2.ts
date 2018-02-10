import { notempty, null2undefined, optional, validate } from './file1';

export class Bar {
  public greet() { console.log('Hello I\'am bar'); }
}

export class Animal {
  public greet() { console.log('roar!'); }
}

export class Foo {
  @validate
  public test(bar: Bar, @optional @null2undefined animal?: Animal) {
    bar.greet();
    if (animal !== undefined) {
      animal.greet();
    }
  }

  @validate
  public testNumber(arg: Number) {
    console.log(arg)
  }

  @validate
  public testAny(arg: any) {
    console.log(arg)
  }

  @validate
  public testOptionalAny(arg1: string, @optional arg2?: any) {
    console.log(arg1)
  }

  @validate
  public testArray(arg: string[]) {
    console.log(arg)
  }

  @validate
  public testNonEmptyArray(@notempty arg: string[]) {
    console.log(arg)
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
foo.testNumber(2);
foo.testArray([1, 2, 3]);
foo.testArray(['1', '2', '3']);
foo.testNonEmptyArray([1]);
// Should fail
foo.test();
foo.test(bar, bar);
foo.test({ toto: 42 });
foo.test(undefined);
foo.test(animal);
foo.testNumber('2');
foo.testArray(42);
foo.testArray({});
foo.testNonEmptyArray([]);
*/
