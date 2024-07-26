import { types as nodeUtilTypes } from 'node:util';

export type AsyncFn<Args extends unknown[], Response> = (
  ...args: Args
) => Promise<Response>;

export type SyncFn<Args extends unknown[], Response> = (
  ...args: Args
) => Response;

export type ErrorResponse<ErrorTypes = unknown> = readonly [
  error: ErrorTypes,
  response: undefined,
];

export type SuccessResponse<Response> = readonly [
  error: undefined,
  response: Response,
];

export type WrappedResponse<Response, ErrorTypes> =
  | SuccessResponse<Response>
  | ErrorResponse<ErrorTypes>;

const isPromise = <Args extends unknown[], Response>(
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

const getResponse = <Response, ErrorTypes>(
  { isError }: { isError: boolean },
  returnValue: unknown,
): WrappedResponse<Response, ErrorTypes> => {
  if (isError) {
    return [returnValue as ErrorTypes, undefined] as ErrorResponse<ErrorTypes>;
  }

  return [undefined, returnValue as Response] as SuccessResponse<Response>;
};

// async
function wrapException<Response, ErrorTypes, Args extends unknown[]>(
  fn: AsyncFn<Args, Response>,
): (...args: Args) => Promise<WrappedResponse<Response, ErrorTypes>>;

// fully sync
function wrapException<Response, ErrorTypes, Args extends unknown[]>(
  fn: SyncFn<Args, Response>,
): (...args: Args) => WrappedResponse<Response, ErrorTypes>;

// sync with promise on return
function wrapException<Response, ErrorTypes, Args extends unknown[]>(
  fn: SyncFn<Args, PromiseLike<Response>>,
): (...args: Args) => Promise<WrappedResponse<Response, ErrorTypes>>;

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
function wrapException<Response, ErrorTypes, Args extends unknown[]>(
  fn:
    | AsyncFn<Args, Response>
    | SyncFn<Args, Response>
    | SyncFn<Args, PromiseLike<Response>>,
): (
  ...args: [...Args]
) =>
  | Promise<WrappedResponse<Response, ErrorTypes>>
  | WrappedResponse<Response, ErrorTypes> {
  const handlePromise =
    (fnExec: AsyncFn<Args, Response>) =>
    async (
      ...args: Parameters<typeof fn>
    ): Promise<WrappedResponse<Response, ErrorTypes>> => {
      try {
        // Cast FN to Promise
        const result = await Promise.resolve(
          typeof fnExec === 'function' ? fnExec(...args) : fnExec,
        )
          .then((r) => getResponse<Response, ErrorTypes>({ isError: false }, r))
          // Catches rejects from Promises & throws from AsyncFunctions - avoids "Unhandled promise rejection"
          .catch((error: unknown) =>
            getResponse<Response, ErrorTypes>({ isError: true }, error),
          );

        return result;
      } catch (error: unknown) {
        // Catches errors from the above execution
        return getResponse<Response, ErrorTypes>({ isError: true }, error);
      }
    };

  if (isPromise(fn)) {
    // Handles async functions
    return handlePromise(fn);
  }

  // Handles sync functions
  return (
    ...args: Parameters<typeof fn>
  ):
    | WrappedResponse<Response, ErrorTypes>
    | Promise<WrappedResponse<Response, ErrorTypes>> => {
    // Handles sync functions
    try {
      const possiblePromise = fn(...args);

      // Handles unknown functions
      if (isPromise(possiblePromise)) {
        return handlePromise(possiblePromise)(...args);
      }

      const result = possiblePromise as Response;

      return getResponse<Response, ErrorTypes>({ isError: false }, result);
    } catch (error: unknown) {
      return getResponse<Response, ErrorTypes>({ isError: true }, error);
    }
  };
}

export default wrapException;
