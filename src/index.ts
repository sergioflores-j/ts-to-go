import util from 'node:util';

export interface PromiseReturningFn<Args extends unknown[], Result = unknown>
  extends Promise<Result> {
  (...args: Args): Promise<Result>;
}

export interface NonPromiseReturningFn<Args extends unknown[], Result = unknown>
  extends Function {
  then?: never;
  (...args: Args): Result;
}

export type WrappedResponse<Result = unknown> =
  | readonly [undefined, Result]
  | readonly [unknown, undefined];

/**
 * Type guard to check whether the received function is a promise returning function
 */
function isPromiseReturningFn<Args extends unknown[], Result>(
  fn: PromiseReturningFn<Args, Result> | NonPromiseReturningFn<Args, Result>
): fn is PromiseReturningFn<Args, Result> {
  return (
    util.types.isAsyncFunction(fn) ||
    util.types.isPromise(fn) ||
    // eslint-disable-next-line promise/prefer-await-to-then
    typeof fn.then === 'function'
  );
}

// Overloads
export function wrapException<Args extends unknown[], Response>(
  fn: PromiseReturningFn<Args, Response>
): (...args: Args) => Promise<WrappedResponse<Response>>;
export function wrapException<Args extends unknown[], Response>(
  fn: NonPromiseReturningFn<Args, Response>
): (...args: Args) => WrappedResponse<Response>;

// Implementation
/**
 */
/**
 * Wraps a function that returns a Promise or not
 * Returns a comprehensible tuple interface for better error handling
 * @returns [Error, Result]
 * @example
  const wrappedFn = wrapException(async (param1: string) => {
    if (param1 === 'bar') throw new Error('bar');

    return await Promise.resolve('foo');
  });

  // wrappedFn will be typed with `const wrappedFn: (param1: string) => Promise<WrappedResponse<string>>`

  const [error, result] = await wrappedFn('bar');

  // error: unknown
  // result: string | undefined

  console.log('bar', error, result); // bar bar undefined
  */
export function wrapException<Args extends unknown[], Response>(
  fn: PromiseReturningFn<Args, Response> | NonPromiseReturningFn<Args, Response>
): (
  ...args: Args
) => Promise<WrappedResponse<Response>> | WrappedResponse<Response> {
  // Handles async functions
  if (isPromiseReturningFn(fn)) {
    return async (...args: Args): Promise<WrappedResponse<Response>> => {
      try {
        const result = await fn(...args);
        return [undefined, result] as const;
      } catch (error) {
        return [error, undefined] as const;
      }
    };
  }

  return (...args: Args): WrappedResponse<Response> => {
    // Handles sync functions
    try {
      const result = fn(...args);
      return [undefined, result] as const;
    } catch (error: unknown) {
      return [error, undefined] as const;
    }
  };
}
