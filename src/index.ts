import { types as t } from "util";

export type PromiseReturningFn<Args extends unknown[], Result = unknown> = (
  ...args: Args
) => Promise<Result>;

export type NonPromiseReturningFn<Args extends unknown[], Result = unknown> = (
  ...args: Args
) => Result;

export type WrappedResponse<Result = unknown> =
  | readonly [undefined, Result]
  | readonly [unknown, undefined];

/**
 * Type guard to check whether the received function is a promise returning function
 */
function isPromiseReturningFn<Args extends unknown[], Result>(
  fn: PromiseReturningFn<Args, Result> | NonPromiseReturningFn<Args, Result>
): fn is PromiseReturningFn<Args, Result> {
  // Check if function is async or if it has a 'then' method
  return t.isAsyncFunction(fn) || typeof (fn as any).then === "function";
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
 * Wraps a function that returns a Promise or not
 * Returns a comprehensible tuple interface for better error handling
 * @returns [Error, Result]
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
        return [undefined, result] as const;
      } catch (error) {
        return [error, undefined] as const;
      }
    };
  }

  // Handles sync functions
  return (...args: Args): WrappedResponse<Response> => {
    try {
      const result = fn(...args);
      return [undefined, result] as const;
    } catch (error: unknown) {
      return [error, undefined] as const;
    }
  };
}
