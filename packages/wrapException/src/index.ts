import { types as nodeUtilTypes } from 'node:util';

export type AsyncFn<Args extends unknown[], Response> = (
  ...args: Args
) => PromiseLike<Response>;

export type SyncFn<Args extends unknown[], Response> = (
  ...args: Args
) => Response;

export type ErrorResponse<ErrorTypes = unknown> = {
  isError: true;
  /**
   * This contains the error thrown by the function.
   */
  error: ErrorTypes;
  /**
   * @warning check `isError` property before accessing `data` or `error`
   */
  data: unknown;
};

export type SuccessResponse<Response = unknown> = {
  isError: false;
  /**
   * undefined if the function executed successfully
   */
  error: undefined;
  /**
   * This contains the successful result of the function.
   */
  data: Response;
};

export type WrappedResponse<Response, ErrorTypes> =
  | SuccessResponse<Response>
  | ErrorResponse<ErrorTypes>;

const isPromise = <
  Fn extends (...args: unknown[]) => unknown,
  Response = ReturnType<Fn>,
>(
  value:
    | AsyncFn<Parameters<Fn>, Response>
    | SyncFn<Parameters<Fn>, Response>
    | SyncFn<Parameters<Fn>, PromiseLike<Response>>
    | Response
    | PromiseLike<Response>,
): value is AsyncFn<Parameters<Fn>, Response> => {
  return (
    (value != null &&
      (typeof value === 'object' || typeof value === 'function') &&
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
      typeof (value as any).then === 'function') ||
    nodeUtilTypes.isAsyncFunction(value) ||
    nodeUtilTypes.isPromise(value)
  );
};

const getResponse = <Response, ErrorTypes>(
  { isError }: { isError: boolean },
  returnValue: unknown,
): WrappedResponse<Response, ErrorTypes> => {
  if (isError) {
    return { isError, error: returnValue as ErrorTypes, data: undefined };
  }

  return { isError, error: undefined, data: returnValue as Response };
};

export type AsyncWrapped<
  Fn extends AsyncFn<Parameters<Fn>, unknown>,
  ErrorTypes = unknown,
  Response = ReturnType<Fn>,
> = (
  ...args: Parameters<Fn>
) => Promise<WrappedResponse<Awaited<Response>, ErrorTypes>>;

export type SyncWrapped<
  Fn extends SyncFn<Parameters<Fn>, Response>,
  ErrorTypes = unknown,
  Response = ReturnType<Fn>,
> = (...args: Parameters<Fn>) => WrappedResponse<Response, ErrorTypes>;

type NotPromise<T> = T extends PromiseLike<unknown> ? never : T;

// The examples are duplicated so JSDoc can work. See more: https://github.com/microsoft/TypeScript/issues/55056
// TODO: have a way to have individual jsdocs and examples per overload (sync/async)
// /**
//  * Async function wrapper
//  * @description
//  * Returns a comprehensible object interface for better error handling
//  * @overload
//  */

/**
 * Wraps either async and sync functions to handle errors as return statements.
 * @description
 * Returns a comprehensible object interface for better error handling
 *
 * For more examples refer to:
 * @link https://github.com/sergioflores-j/ts-to-go
 *
 * @example
 * async - simple usage
 * ```
 * const wrappedFn = wrapException(async (param1: string) => {
 *    if (param1 === 'bar') throw new Error('bar');
 *    return await Promise.resolve('foo');
 * });
 *
 * const {isError, error, data} = await wrappedFn('bar');
 *
 * // isError: unknown
 * // error: unknown
 * // data: unknown
 *
 * if (isError) {
 *   // error: unknown
 *   // data: unknown
 *   console.log('log:', error, data); // log: bar undefined
 * } else {
 *   // data: string
 * }
 * ```
 *
 * @example
 * sync - simple usage
 * ```
 * const wrappedFn = wrapException((param1: string) => {
 *  if (param1 === 'syncError') throw new Error('syncError');
 *
 *  return 'syncSuccess';
 * });
 *
 * const {isError, error, data} = wrappedFn('syncError');
 *
 * // isError: unknown
 * // error: unknown
 * // data: unknown
 *
 * if (isError) {
 *   // error: unknown
 *   // data: unknown
 *   console.log('log:', error, data); // log: syncError undefined
 * } else {
 *   // data: string
 * }
 * ```
 */
function wrapException<
  // any because we want to accept any kind of function parameter, return must be a promise
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Fn extends (...args: any[]) => PromiseLike<unknown>,
  ErrorTypes,
  Response = ReturnType<Fn>,
>(fn: Fn): AsyncWrapped<Fn, ErrorTypes, Response>;

// The examples are duplicated so JSDoc can work. See more: https://github.com/microsoft/TypeScript/issues/55056
// /**
//  * Sync function wrapper
//  * @description
//  * Returns a comprehensible object interface for better error handling
//  * @overload
//  */

/**
 * Wraps either async and sync functions to handle errors as return statements.
 * @description
 * Returns a comprehensible object interface for better error handling
 *
 * For more examples refer to:
 * @link https://github.com/sergioflores-j/ts-to-go
 *
 * @example
 * async - simple usage
 * ```
 * const wrappedFn = wrapException(async (param1: string) => {
 *    if (param1 === 'bar') throw new Error('bar');
 *    return await Promise.resolve('foo');
 * });
 *
 * const {isError, error, data} = await wrappedFn('bar');
 *
 * // isError: unknown
 * // error: unknown
 * // data: unknown
 *
 * if (isError) {
 *   // error: unknown
 *   // data: unknown
 *   console.log('log:', error, data); // log: bar undefined
 * } else {
 *   // data: string
 * }
 * ```
 *
 * @example
 * sync - simple usage
 * ```
 * const wrappedFn = wrapException((param1: string) => {
 *  if (param1 === 'syncError') throw new Error('syncError');
 *
 *  return 'syncSuccess';
 * });
 *
 * const {isError, error, data} = wrappedFn('syncError');
 *
 * // isError: unknown
 * // error: unknown
 * // data: unknown
 *
 * if (isError) {
 *   // error: unknown
 *   // data: unknown
 *   console.log('log:', error, data); // log: syncError undefined
 * } else {
 *   // data: string
 * }
 * ```
 */
function wrapException<
  // any because we want to accept any kind of function parameter, return must be NOT a promise
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Fn extends (...args: any[]) => NotPromise<Response>,
  ErrorTypes,
  Response = ReturnType<Fn>,
>(fn: Fn): SyncWrapped<Fn, ErrorTypes, Response>;

// IMPLEMENTATION (TODO: should have the jsdoc here)
function wrapException<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Fn extends (...args: any[]) => any, // any is important to accept any kind of function as a parameter
  ErrorTypes,
  Response = ReturnType<Fn>,
>(
  fn: Fn,
):
  | AsyncWrapped<Fn, ErrorTypes, Response>
  | SyncWrapped<Fn, ErrorTypes, Response> {
  const handlePromise =
    (fnExec: AsyncFn<Parameters<Fn>, Response> | PromiseLike<Response>) =>
    async (
      ...args: Parameters<Fn>
    ): ReturnType<AsyncWrapped<Fn, ErrorTypes, Response>> => {
      try {
        // Cast fnExec to Promise, will work if value is a Promise (e.g. Promise.resolve) or an AsyncFunction
        const result: WrappedResponse<
          Awaited<Response>,
          ErrorTypes
        > = await Promise.resolve(
          typeof fnExec === 'function' ? fnExec(...args) : fnExec,
        )
          .then((r) =>
            getResponse<Awaited<Response>, ErrorTypes>({ isError: false }, r),
          )
          // Catches rejects from Promises & throws from AsyncFunctions - avoids "Unhandled promise rejection"
          .catch((error: unknown) =>
            getResponse<Awaited<Response>, ErrorTypes>(
              { isError: true },
              error,
            ),
          );

        return result;
      } catch (error: unknown) {
        // Catches errors from the above execution
        return getResponse<Awaited<Response>, ErrorTypes>(
          { isError: true },
          error,
        );
      }
    };

  if (isPromise(fn)) {
    // Handles async functions
    return handlePromise(fn);
  }

  // Handles sync functions
  const handleSyncAndPossiblePromise = (...args: Parameters<Fn>) => {
    // Handles sync functions
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const maybeAPromise = fn(...args);

      // E.g. function returns "Promise.resolve"
      if (isPromise(maybeAPromise)) {
        return handlePromise(maybeAPromise)(...args);
      }

      const result = maybeAPromise as Response;

      return getResponse<Response, ErrorTypes>({ isError: false }, result);
    } catch (error: unknown) {
      return getResponse<Response, ErrorTypes>({ isError: true }, error);
    }
  };

  // @ts-ignore: can't find a way to type this properly - casting to avoid TS error
  return handleSyncAndPossiblePromise as SyncWrapped<Fn, ErrorTypes, Response>;
}

export default wrapException;
