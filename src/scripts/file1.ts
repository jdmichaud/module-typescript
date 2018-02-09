import "reflect-metadata";

const OPTIONAL_SYMBOL = '__metadata_optional__';
const NULL_TO_UNDEFINED_SYMBOL = '__metadata_null2undefined__';

/**
 * Flags a parameter as potentially undefined. It shall be prepended to a
 * parameter marked as optional with the question mark (`?`) character.
 *
 * example:
 * ```
 * @validate
 * foo(mandatoryParameter: int, @optional optionalParameter?: string) {}
 * ```
 *
 * This decorator only works if coupled with the @validate decorator.
 */
export function optional(target: Object, propertyKey: string | symbol,
                         parameterIndex: number) {
  let optionalArray = Reflect.getOwnMetadata(OPTIONAL_SYMBOL, target, propertyKey);
  if (optionalArray === undefined) {
    optionalArray = [];
  }
  optionalArray.push(parameterIndex);
  Reflect.defineMetadata(OPTIONAL_SYMBOL, optionalArray, target, propertyKey);
}

/**
 * Flags a parameter as undefinable, i.e. if the parameter is flagged optional
 * and was provided as null, the decorator will force it to the undefined value.
 *
 * example:
 * ```
 * @validate
 * foo(mandatoryParameter: int, @null2undefined @optional optionalParameter?: string) {
 *   console.log(optionalParameter);
 * }
 *
 * foo(42, null);
 * > undefined
 * ```
 *
 * This decorator only works if coupled with the @validate decorator.
 */
export function null2undefined(target: Object, propertyKey: string | symbol,
                         parameterIndex: number) {
  let null2undefinedArray = Reflect.getOwnMetadata(NULL_TO_UNDEFINED_SYMBOL, target, propertyKey);
  if (null2undefinedArray === undefined) {
    null2undefinedArray = [];
  }
  null2undefinedArray.push(parameterIndex);
  Reflect.defineMetadata(NULL_TO_UNDEFINED_SYMBOL, null2undefinedArray, target, propertyKey);
}

/**
 * Returns true if the parameter is marked with the key symbol. False otherwise.
 */
function retrieveMetadataMapping(key: string | symbol, target: Object,
                                 methodName: string | symbol, parameterIndex: number): boolean {
  const mapping = Reflect.getOwnMetadata(key, target, methodName);
  let res = false;
  if (mapping !== undefined) {
    res = mapping.indexOf(parameterIndex) !== -1;
  }
  return res;
}

/**
 * Return a printable type name.
 */
function toTypename(value: any) {
  if (value === undefined) {
    return 'undefined';
  }
  if (value === null) {
    return 'null';
  }
  if (value.name !== undefined) {
    return value.name;
  }
  if (value.constructor !== undefined && value.constructor.name !== undefined) {
    return value.constructor.name;
  }
  if (value.toString !== undefined) {
    return value.toString();
  }
  return "unknown type";
}

function checkType(argument: any, parameterTypes: any,
                   parameterIndex: number, isOptional: boolean) {
  if (!checkPrimitiveType(argument, parameterTypes, parameterIndex, isOptional)) {
    checkNonPrimitiveType(argument, parameterTypes, parameterIndex, isOptional);
  }
}

function checkPrimitiveType(argument: any, parameterTypes: any,
                            parameterIndex: number, isOptional: boolean): boolean {
  if (parameterTypes[parameterIndex] === Number) {
    if (typeof(argument) !== 'number') {
      throw new TypeError(
        `parameter ${parameterIndex + 1} shall be of type Number ` +
        `but is of type ${toTypename(argument)}`
      );
    }
    return true;
  }
  if (parameterTypes[parameterIndex] === String) {
    if (typeof(argument) !== 'string') {
      throw new TypeError(
        `parameter ${parameterIndex + 1} shall be of type Number ` +
        `but is of type ${toTypename(argument)}`
      );
    }
    return true;
  }
  if (parameterTypes[parameterIndex] === Array) {
    if (!Array.isArray(argument)) {
      throw new TypeError(
        `parameter ${parameterIndex + 1} shall be of type Array ` +
        `but is of type ${toTypename(argument)}`
      );
    }
    return true;
  }
  return false;
}

function checkNonPrimitiveType(argument: any, parameterTypes: any,
                   parameterIndex: number, isOptional: boolean): void {
  console.log('checkNonPrimitiveType');
  if (!(argument instanceof parameterTypes[parameterIndex]) &&
      (((argument !== undefined) && (argument !== null)) || !isOptional)) {
    throw new TypeError(
      `parameter ${parameterIndex + 1} shall be of type ${toTypename(parameterTypes[parameterIndex])} ` +
      `but is of type ${toTypename(argument)}`
    );
  }
}

/**
 * Applied validation to the function parameters.
 */
export function validate<T>(target: any, methodName: string,
                            descriptor: any) {
  console.log('target:', target);
  console.log('propertyKey:', methodName);
  console.log('descriptor:', descriptor);

  if (descriptor.value !== undefined) {
    const originalFunction = descriptor.value;
    descriptor.value = function () {
      let parameterTypes = Reflect.getMetadata('design:paramtypes', target, methodName);
      console.log(parameterTypes);
      for (let i = 0; i < parameterTypes.length; ++i) {
        const isOptional = retrieveMetadataMapping(OPTIONAL_SYMBOL, target, methodName, i);
        const isUndefinable = retrieveMetadataMapping(NULL_TO_UNDEFINED_SYMBOL, target, methodName, i);
        // Check parameter types
        console.log(arguments[i]);
        checkType(arguments[i], parameterTypes, i, isOptional);
        // If a parameter is null, set it to undefined
        if (isUndefinable && arguments[i] === null) {
          arguments[i] = undefined;
        }
      }
      return originalFunction.apply(this, arguments);
    };
  }
}
