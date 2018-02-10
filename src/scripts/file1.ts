import "reflect-metadata";

const OPTIONAL_SYMBOL = '__metadata_optional__';
const NULL_TO_UNDEFINED_SYMBOL = '__metadata_null2undefined__';
const NOT_EMPTY = '__metadata_notempty__';

function addParameterTagToMetadata(target: Object, propertyKey: string | symbol,
                                   parameterIndex: number, decoratorKey: symbol | string) {
  let decoratorArray = Reflect.getOwnMetadata(decoratorKey, target, propertyKey);
  if (decoratorArray === undefined) {
    decoratorArray = [];
  }
  decoratorArray.push(parameterIndex);
  Reflect.defineMetadata(decoratorKey, decoratorArray, target, propertyKey);
}

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
  addParameterTagToMetadata(target, propertyKey, parameterIndex, OPTIONAL_SYMBOL);
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
  addParameterTagToMetadata(target, propertyKey, parameterIndex, NULL_TO_UNDEFINED_SYMBOL);
}

/**
 * Flags a parameter that should not be empty. An array shall have at least one
 * element and a string at least one character.
 *
 * example:
 * ```
 * @validate
 * foo(@notempty notEmptyParameter?: int[]) {
 *   console.log(notEmptyParameter);
 * }
 *
 * foo([]);
 * > Error
 *
 * @validate
 * bar(@notempty notEmptyParameter?: string) {
 *   console.log(notEmptyParameter);
 * }
 *
 * bar('');
 * > Error
 * ```
 *
 * This decorator only works if coupled with the @validate decorator.
 */
export function notempty(target: Object, propertyKey: string | symbol,
                         parameterIndex: number) {
  addParameterTagToMetadata(target, propertyKey, parameterIndex, NOT_EMPTY);
}


function notemptyCheck(argument: any[] | string, parameterIndex: number) {
  if (isString(argument) && argument === '') {
    throw Error(`parameter ${parameterIndex + 1} shall be a non empty string`);
  }
  if (Array.isArray(argument) && argument.length === 0) {
    throw Error(`parameter ${parameterIndex + 1} shall be a non empty array`);
  }
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

function isNumber(value: any) {
  return typeof(value) === 'number' && isFinite(value);
}

function isString(value: any) {
  return typeof(value) === 'string' || value instanceof String;
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
    if (!isNumber(argument)) {
      throw new TypeError(
        `parameter ${parameterIndex + 1} shall be of type Number ` +
        `but is of type ${toTypename(argument)}`
      );
    }
    return true;
  }
  if (parameterTypes[parameterIndex] === String) {
    if (!isString(argument)) {
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
        const isNotEmpty = retrieveMetadataMapping(NOT_EMPTY, target, methodName, i);
        // Check parameter types
        console.log(arguments[i]);
        checkType(arguments[i], parameterTypes, i, isOptional);
        // If a parameter is null, set it to undefined
        if (isUndefinable && arguments[i] === null) {
          arguments[i] = undefined;
        }
        if (isNotEmpty) {
          notemptyCheck(arguments[i], i);
        }
      }
      return originalFunction.apply(this, arguments);
    };
  }
}
