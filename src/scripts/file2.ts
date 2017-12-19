export enum {
  CASEA, CASEB
}

export interface Animal {
  talk(): string;
}

class Dog implements Animal {
  public talk(): string { return "ouaf"; }
}
