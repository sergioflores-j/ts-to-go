export type PromiseReturningFn<Args extends unknown[], Result = unknown> = (
  ...args: Args
) => Promise<Result>;

export type NonPromiseReturningFn<Args extends unknown[], Result = unknown> = (
  ...args: Args
) => Result;

export type ErrorResult = { error: unknown };
export type SuccessResult<Result> = { result: Result };
export type WrappedResponse<Result = unknown> =
  | ErrorResult
  | SuccessResult<Result>;

/**
 * Type guard to check whether the received function is a promise returning function
 */
function isPromiseReturningFn<Args extends unknown[], Result>(
  fn: PromiseReturningFn<Args, Result> | NonPromiseReturningFn<Args, Result>
): fn is PromiseReturningFn<Args, Result> {
  return (
    fn[Symbol.toStringTag] === "AsyncFunction" ||
    fn[Symbol.toStringTag] === "Promise"
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
  if (isPromiseReturningFn(fn)) {
    return async (...args: Args): Promise<WrappedResponse<Response>> => {
      try {
        const result = await fn(...args);
        return { result };
      } catch (error) {
        return { error };
      }
    };
  }

  return (...args: Args): WrappedResponse<Response> => {
    try {
      const result = fn(...args);
      return { result };
    } catch (error) {
      return { error };
    }
  };
}
