import "reflect-metadata";

const optionalKey = '__metadata_optional__';
const null2undefinedKey = '__metadata_null2undefined__';

export function optional(target: Object, propertyKey: string | symbol,
                         parameterIndex: number) {
  Reflect.defineMetadata(optionalKey, true, target, propertyKey);
}

export function null2undefined(target: Object, propertyKey: string | symbol,
                         parameterIndex: number) {
  Reflect.defineMetadata(null2undefinedKey, true, target, propertyKey);
}

export function validate<T>(target: any, methodName: string,
                            descriptor: any) {
  console.log('target:', target);
  console.log('propertyKey:', methodName);
  console.log('descriptor:', descriptor);

  if (descriptor.value !== undefined) {
    const originalFunction = descriptor.value;
    console.log('replacing function');
    descriptor.value = function () {
      console.log('ok!');
      let parameterTypes = Reflect.getMetadata('design:paramtypes', target, methodName);
      console.log(parameterTypes);
      for (let i = 0; i < parameterTypes.length; ++i) {
        console.log('methodName:', methodName);
        const isOptional = Reflect.getOwnMetadata(optionalKey, target, methodName);
        const isUndefinable = Reflect.getOwnMetadata(null2undefinedKey, target, methodName);

        if (!(arguments[i] instanceof parameterTypes[i]) &&
            ((arguments[i] !== undefined) && (arguments[i] !== null)) || !isOptional) {
          throw new TypeError("Invalid types!");
        }
        if (isUndefinable && arguments[i] === null) {
          arguments[i] = undefined;
        }
      }
      return originalFunction.apply(this, arguments);
    };
  }
}
