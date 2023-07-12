export type AsyncFn<Args extends unknown[], Result = unknown> = (
  ...args: Args
) => Promise<Result>;

export type SyncFn<Args extends unknown[], Result = unknown> = (
  ...args: Args
) => Result;

export type WrappedResponse<Result = unknown> =
  | readonly [undefined, Result]
  | readonly [unknown, undefined];

/**
 * Wraps an ASYNC function
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
  fn: AsyncFn<Args, Response>,
): (...args: Args) => Promise<WrappedResponse<Response>> {
  // Handles async functions
  return async (...args: Args): Promise<WrappedResponse<Response>> => {
    try {
      // Cast FN to Promise
      const result = await Promise.resolve(fn(...args))
        .then((r) => [undefined, r] as const)
        // Catches rejects from Promises & throws from AsyncFunctions - avoids "Unhandled promise rejection"
        .catch((error: unknown) => [error, undefined] as const);

      return result;
    } catch (error: unknown) {
      // Catches errors from the above execution
      return [error, undefined] as const;
    }
  };
}

/**
 * Wraps a SYNC function
 * Returns a comprehensible tuple interface for better error handling
 * @returns [Error, Result]
 * @example
  const wrappedFn = wrapException((param1: string) => {
    if (param1 === 'bar') throw new Error('bar');

    return 'foo';
  });

  // wrappedFn will be typed with `const wrappedFn: (param1: string) => WrappedResponse<string>`

  const [error, result] = wrappedFn('bar');

  // error: unknown
  // result: string | undefined

  console.log('bar', error, result); // bar bar undefined
  */
export function wrapExceptionSync<Args extends unknown[], Response>(
  fn: SyncFn<Args, Response>,
): (...args: Args) => WrappedResponse<Response> {
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
