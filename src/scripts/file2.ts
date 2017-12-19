export enum SomeEnum {
  GERMAN_SHEPHERD,
  SIBERIAN_HUSKY,
}

export interface Animal {
  talk(): string;
}

export class Dog implements Animal {
  public talk(): string {
    return 'ouaf';
  }

  constructor(private e: SomeEnum) {}
}
