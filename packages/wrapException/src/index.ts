import { types as nodeUtilTypes } from 'node:util';

export type AsyncFn<Args extends unknown[], Response = unknown> = (
  ...args: Args
) => Promise<Response>;

export type SyncFn<Args extends unknown[], Response = unknown> = (
  ...args: Args
) => Response;

export type WrappedResponse<Response = unknown> =
  | readonly [undefined, Response] // Success
  | readonly [unknown, undefined]; // Error

const isPromise = <Args extends unknown[], Response = unknown>(
  value:
    | AsyncFn<Args, Response>
    | SyncFn<Args, Response>
    | SyncFn<Args, PromiseLike<Response>>
    | Response
    | PromiseLike<Response>,
): value is AsyncFn<Args, Response> => {
  return (
    (value != null &&
      (typeof value === 'object' || typeof value === 'function') &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
      typeof (value as any).then === 'function') ||
    nodeUtilTypes.isAsyncFunction(value) ||
    nodeUtilTypes.isPromise(value)
  );
};

// async
function wrapException<Args extends unknown[], Response>(
  fn: AsyncFn<Args, Response>,
): (...args: Args) => Promise<WrappedResponse<Response>>;

// fully sync
function wrapException<Args extends unknown[], Response>(
  fn: SyncFn<Args, Response>,
): (...args: Args) => WrappedResponse<Response>;

// sync with promise on return
function wrapException<Args extends unknown[], Response>(
  fn: SyncFn<Args, PromiseLike<Response>>,
): (...args: Args) => Promise<WrappedResponse<Response>>;

/**
 * Wraps either async and sync functions
 * Returns a comprehensible tuple interface for better error handling
 * @returns [Error, Result]
 * @example async
  const wrappedFn = wrapException(async (param1: string) => {
    if (param1 === 'bar') throw new Error('bar');

    return await Promise.resolve('foo');
  });

  // wrappedFn will be typed with `const wrappedFn: (param1: string) => Promise<WrappedResponse<string>>`

  const [error, result] = await wrappedFn('bar');

  // error: unknown
  // result: string | undefined

  console.log('bar', error, result); // bar bar undefined
 * @example sync
  const wrappedFn = wrapException((param1: string) => {
    if (param1 === 'bar') throw new Error('bar');

    return 'foo';
  });

  // wrappedFn will be typed with `const wrappedFn: (param1: string) => WrappedResponse<string>`

  const [error, result] = wrappedFn('bar');

  // error: unknown
  // result: string | undefined

  console.log('bar', error, result); // bar bar undefined
 * @example "sync" but returning promise
  const wrappedFn = wrapException((param1: string) => {
    if (param1 === 'bar') return Promise.reject(new Error('bar'));

    return 'foo';
  });

  // wrappedFn will be typed with `const wrappedFn: (param1: string) => Promise<WrappedResponse<string>>`

  const [error, result] = wrappedFn('bar');

  // error: unknown
  // result: string | undefined

  console.log('bar', error, result); // bar bar undefined
  */
function wrapException<Args extends unknown[], Response>(
  fn:
    | AsyncFn<Args, Response>
    | SyncFn<Args, Response>
    | SyncFn<Args, PromiseLike<Response>>,
): (
  ...args: Args
) => Promise<WrappedResponse<Response>> | WrappedResponse<Response> {
  const handlePromise =
    (fnExec: AsyncFn<Args, Response>) =>
    async (...args: Args): Promise<WrappedResponse<Response>> => {
      try {
        // Cast FN to Promise
        const result = await Promise.resolve(
          typeof fnExec === 'function' ? fnExec(...args) : fnExec,
        )
          .then((r) => [undefined, r] as const)
          // Catches rejects from Promises & throws from AsyncFunctions - avoids "Unhandled promise rejection"
          .catch((error: unknown) => [error, undefined] as const);

        return result;
      } catch (error: unknown) {
        // Catches errors from the above execution
        return [error, undefined] as const;
      }
    };

  if (isPromise(fn)) {
    // Handles async functions
    return handlePromise(fn);
  }

  // Handles sync functions
  return (
    ...args: Args
  ): WrappedResponse<Response> | Promise<WrappedResponse<Response>> => {
    // Handles sync functions
    try {
      const possiblePromise = fn(...args);

      // Handles unknown functions
      if (isPromise(possiblePromise)) {
        return handlePromise(possiblePromise)(...args);
      }

      const result = possiblePromise as Response;

      return [undefined, result] as const;
    } catch (error: unknown) {
      return [error, undefined] as const;
    }
  };
}

export default wrapException;
