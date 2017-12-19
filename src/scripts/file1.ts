export class Foo {
  constructor(public member: number) {}
}

export function foo(): Foo {
  return new Foo(bar());
}

function bar(): number {
  return 42;
}
