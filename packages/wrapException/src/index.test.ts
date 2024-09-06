import { expectType, TypeEqual } from 'ts-expect';

import {
  successAsyncStringExplicit,
  successAsyncStringInferred,
  successSyncStringExplicit,
  successSyncStringInferred,
  throwingAsyncExplicit,
  throwingAsyncInferred,
  throwingSyncExplicit,
  throwingSyncInferred,
  toggleableAsyncExplicit,
  toggleablePromiseConstructorExplicit,
  toggleablePromiseExplicit,
  toggleableSyncExplicit,
} from './__tests__/functions';

import wrapException, {
  AsyncWrapped,
  SyncWrapped,
  WrappedResponse,
} from './index';

describe('wrapException - async', () => {
  describe('general type checks', () => {
    it('should switch the type when checking for error', async () => {
      const wrappedFn = wrapException(successAsyncStringInferred);
      const result = await wrappedFn();

      expectType<TypeEqual<WrappedResponse<string, unknown>, typeof result>>(
        true,
      );

      const typeCheck = () => {
        // Both are unknown before checking isError
        expectType<TypeEqual<unknown, typeof result.data>>(true);
        expectType<TypeEqual<unknown, typeof result.error>>(true);

        if (result.isError) {
          // Data is unknown when isError is true
          expectType<TypeEqual<unknown, typeof result.data>>(true);
          // Error is unknown so consumer can handle it (e.g. error instanceof Error)
          expectType<TypeEqual<unknown, typeof result.error>>(true);
        } else {
          // Data is the function return type when not an error
          expectType<TypeEqual<string, typeof result.data>>(true);
          // Error is undefined when not an error
          expectType<TypeEqual<undefined, typeof result.error>>(true);
        }
      };

      typeCheck();
      expect(result).toBeDefined();
    });

    it('should switch the type when checking for error keeping original function type', async () => {
      const wrappedFn = wrapException(toggleableAsyncExplicit);
      const result = await wrappedFn();

      expectType<
        TypeEqual<WrappedResponse<string[] | undefined, unknown>, typeof result>
      >(true);

      const typeCheck = () => {
        expectType<TypeEqual<unknown, typeof result.data>>(true);
        expectType<TypeEqual<unknown, typeof result.error>>(true);

        if (result.isError) {
          expectType<TypeEqual<unknown, typeof result.data>>(true);
          expectType<TypeEqual<unknown, typeof result.error>>(true);
        } else {
          // Data is still the function return type when not an error
          expectType<
            TypeEqual<
              Awaited<ReturnType<typeof toggleableAsyncExplicit>>,
              typeof result.data
            >
          >(true);
          expectType<TypeEqual<undefined, typeof result.error>>(true);
        }
      };

      typeCheck();
      expect(result).toBeDefined();
    });

    it('should switch the type when checking for error - advanced usage', async () => {
      const wrappedFn = wrapException<typeof successAsyncStringInferred, Error>(
        successAsyncStringInferred,
      );
      const result = await wrappedFn();

      expectType<TypeEqual<WrappedResponse<string, Error>, typeof result>>(
        true,
      );

      const typeCheck = () => {
        if (result.isError) {
          expectType<TypeEqual<unknown, typeof result.data>>(true);
          expectType<TypeEqual<Error, typeof result.error>>(true);
        } else {
          expectType<TypeEqual<string, typeof result.data>>(true);
          expectType<TypeEqual<undefined, typeof result.error>>(true);
        }
      };

      typeCheck();
      expect(result).toBeDefined();
    });
  });

  describe('async/await', () => {
    describe('when the function succeeds', () => {
      it('should return the function result and an empty error - when function type is inferred', async () => {
        // Function with implicit return type
        const wrappedFn = wrapException(successAsyncStringInferred);

        // Checks if the wrapped function is still a promise
        expectType<
          TypeEqual<
            AsyncWrapped<() => Promise<string>, unknown, Promise<string>>,
            typeof wrappedFn
          >
        >(true);

        const result = await wrappedFn();

        expectType<TypeEqual<WrappedResponse<string, unknown>, typeof result>>(
          true,
        );

        expect(result).toEqual({
          isError: false,
          error: undefined,
          data: 'test',
        });
      });

      it('should return the function result and an empty error - when function type is explicit', async () => {
        // Function with explicit return type
        const wrappedFn = wrapException(successAsyncStringExplicit);

        // Checks if the wrapped function is still a promise
        expectType<
          TypeEqual<
            AsyncWrapped<() => Promise<string>, unknown, Promise<string>>,
            typeof wrappedFn
          >
        >(true);

        const result = await wrappedFn();

        expectType<TypeEqual<WrappedResponse<string, unknown>, typeof result>>(
          true,
        );

        expect(result).toEqual({
          isError: false,
          error: undefined,
          data: 'test',
        });
      });

      it('should return the function result and an empty error - when function type is explicit - slightly complex type', async () => {
        const wrappedFn = wrapException(toggleableAsyncExplicit);

        // Checks if the wrapped function is still a promise
        expectType<
          TypeEqual<
            AsyncWrapped<
              (arg?: boolean) => Promise<string[] | undefined>,
              unknown,
              Promise<string[] | undefined>
            >,
            typeof wrappedFn
          >
        >(true);

        const result1 = await wrappedFn(true);

        expectType<
          TypeEqual<
            WrappedResponse<string[] | undefined, unknown>,
            typeof result1
          >
        >(true);

        expect(result1).toEqual({
          isError: false,
          error: undefined,
          data: ['test'],
        });

        const result2 = await wrappedFn(false);
        expect(result2).toEqual({
          isError: false,
          error: undefined,
          data: undefined,
        });
      });

      it('should return the function result and an empty error - when function type is inferred - anonymous', async () => {
        // inline/anonymous function
        const wrappedFn = wrapException(async () => {
          return Promise.resolve(['test']);
        });

        // Checks if the wrapped function is still a promise
        expectType<
          TypeEqual<
            AsyncWrapped<() => Promise<string[]>, unknown, Promise<string[]>>,
            typeof wrappedFn
          >
        >(true);

        const result = await wrappedFn();

        expectType<
          TypeEqual<WrappedResponse<string[], unknown>, typeof result>
        >(true);

        expect(result).toEqual({
          isError: false,
          error: undefined,
          data: ['test'],
        });
      });

      it('should return the function result and an empty error - when function type is explicit - anonymous', async () => {
        // inline function
        const wrappedFn = wrapException(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          async (arg?: boolean): Promise<string[] | undefined> => {
            if (arg) {
              throw new Error('test error');
            }
            return Promise.resolve(['test']);
          },
        );

        // function should still have the original arguments and return type
        expectType<
          TypeEqual<
            AsyncWrapped<
              (arg?: boolean) => Promise<string[] | undefined>,
              unknown,
              Promise<string[] | undefined>
            >,
            typeof wrappedFn
          >
        >(true);

        const result = await wrappedFn();

        expectType<
          TypeEqual<
            WrappedResponse<string[] | undefined, unknown>,
            typeof result
          >
        >(true);

        expect(result).toEqual({
          isError: false,
          error: undefined,
          data: ['test'],
        });
      });
    });

    describe('when the function fails', () => {
      it('should return the error object - when function type is inferred', async () => {
        const wrappedFn = wrapException(throwingAsyncInferred);

        // Function has no return
        expectType<
          TypeEqual<
            AsyncWrapped<() => Promise<never>, unknown, Promise<never>>,
            typeof wrappedFn
          >
        >(true);

        const { error, data, isError } = await wrappedFn();

        if (isError) {
          expectType<TypeEqual<unknown, typeof error>>(true);
          expectType<TypeEqual<unknown, typeof data>>(true);
        } else {
          expectType<TypeEqual<undefined, typeof error>>(true);
          expectType<TypeEqual<never, typeof data>>(true);
        }

        expect(isError).toBeTruthy();
        expect(data).toBeUndefined();
        expect(error).toBeInstanceOf(Error);
        expect(error).toHaveProperty('message', 'test error');
      });

      it('should return the error object - when function type is explicit', async () => {
        const wrappedFn = wrapException(throwingAsyncExplicit);

        // Function has no return
        expectType<
          TypeEqual<
            AsyncWrapped<() => Promise<void>, unknown, Promise<void>>,
            typeof wrappedFn
          >
        >(true);

        const result = await wrappedFn();

        expect(result).toEqual({
          isError: true,
          data: undefined,
          error: new Error('test error'),
        });
      });

      it('should return the error object - when function type is explicit - anonymous', async () => {
        const wrappedFn = wrapException(
          async (arg?: boolean): Promise<void> => {
            if (arg) {
              throw new Error('test error');
            }

            return Promise.resolve();
          },
        );

        // Function has no return
        expectType<
          TypeEqual<
            AsyncWrapped<
              (arg?: boolean) => Promise<void>,
              unknown,
              Promise<void>
            >,
            typeof wrappedFn
          >
        >(true);

        const result = await wrappedFn(true);

        if (result.isError) {
          expectType<TypeEqual<unknown, typeof result.error>>(true);
          expectType<TypeEqual<unknown, typeof result.data>>(true);
        } else {
          expectType<TypeEqual<undefined, typeof result.error>>(true);
          expectType<TypeEqual<void, typeof result.data>>(true);
        }

        expect(result).toEqual({
          isError: true,
          data: undefined,
          error: new Error('test error'),
        });
      });
    });
  });

  describe('promise', () => {
    describe('when the function succeeds', () => {
      it('should return the function result and an empty error - when function type is inferred - anonymous', async () => {
        const wrappedFn = wrapException(() => Promise.resolve('test'));

        // Must be AsyncWrapped - so "await" is required
        expectType<
          TypeEqual<
            AsyncWrapped<() => Promise<string>, unknown, Promise<string>>,
            typeof wrappedFn
          >
        >(true);

        const result = await wrappedFn();

        expectType<TypeEqual<WrappedResponse<string, unknown>, typeof result>>(
          true,
        );

        expect(result).toEqual({
          isError: false,
          error: undefined,
          data: 'test',
        });
      });

      it('should return the function result and an empty error - when function type is explicit', async () => {
        const wrappedFn = wrapException(toggleablePromiseExplicit);

        // Must be AsyncWrapped - so "await" is required
        expectType<
          TypeEqual<
            AsyncWrapped<
              (arg: boolean) => Promise<string>,
              unknown,
              Promise<string>
            >,
            typeof wrappedFn
          >
        >(true);

        const result = await wrappedFn(true);

        expect(result).toEqual({
          isError: false,
          error: undefined,
          data: 'test',
        });
      });
    });

    describe('when the function fails', () => {
      it('should return the error object - when function type is inferred - anonymous', async () => {
        const wrappedFn = wrapException(() =>
          Promise.reject(new Error('test error')),
        );

        // Must be AsyncWrapped - so "await" is required
        expectType<
          TypeEqual<
            AsyncWrapped<() => Promise<unknown>, unknown, Promise<unknown>>,
            typeof wrappedFn
          >
        >(true);

        const { error, data, isError } = await wrappedFn();

        expectType<TypeEqual<unknown, typeof error>>(true);
        expectType<TypeEqual<unknown, typeof data>>(true);

        expect(isError).toBeTruthy();
        expect(error).toBeInstanceOf(Error);
        expect(error).toHaveProperty('message', 'test error');
      });

      it('should return the error object - when function type is explicit', async () => {
        const wrappedFn = wrapException(toggleablePromiseExplicit);

        // Must be AsyncWrapped - so "await" is required
        expectType<
          TypeEqual<
            AsyncWrapped<
              (arg: boolean) => Promise<string>,
              unknown,
              Promise<string>
            >,
            typeof wrappedFn
          >
        >(true);

        const result = await wrappedFn(false);

        expect(result).toEqual({
          isError: true,
          error: new Error('test error'),
          data: undefined,
        });
      });
    });
  });

  describe('promise constructor', () => {
    describe('when the function succeeds', () => {
      it('should return the function result and an empty error - when function type is inferred - anonymous', async () => {
        const wrappedFn = wrapException(
          () =>
            new Promise<string>((resolve) => {
              resolve('test');
            }),
        );

        // Must be AsyncWrapped - so "await" is required
        expectType<
          TypeEqual<
            AsyncWrapped<() => Promise<string>, unknown, Promise<string>>,
            typeof wrappedFn
          >
        >(true);

        const result = await wrappedFn();

        expectType<TypeEqual<WrappedResponse<string, unknown>, typeof result>>(
          true,
        );

        expect(result).toEqual({
          isError: false,
          error: undefined,
          data: 'test',
        });
      });

      it('should return the function result and an empty error - when function type is explicit', async () => {
        const wrappedFn = wrapException(toggleablePromiseConstructorExplicit);

        // Must be AsyncWrapped - so "await" is required
        expectType<
          TypeEqual<
            AsyncWrapped<
              (arg: boolean) => Promise<string>,
              unknown,
              Promise<string>
            >,
            typeof wrappedFn
          >
        >(true);

        const result = await wrappedFn(true);

        expectType<TypeEqual<WrappedResponse<string, unknown>, typeof result>>(
          true,
        );

        expect(result).toEqual({
          isError: false,
          error: undefined,
          data: 'test',
        });
      });
    });

    describe('when the function fails', () => {
      it('should return the error object when the promise rejects - function type is inferred - anonymous', async () => {
        const wrappedFn = wrapException(
          () =>
            new Promise<void>((_resolve, reject) => {
              // E.g. a validation error
              reject(new Error('test error'));
            }),
        );

        // Must be AsyncWrapped - so "await" is required
        expectType<
          TypeEqual<
            AsyncWrapped<() => Promise<void>, unknown, Promise<void>>,
            typeof wrappedFn
          >
        >(true);

        const result = await wrappedFn();

        expectType<TypeEqual<WrappedResponse<void, unknown>, typeof result>>(
          true,
        );

        expect(result).toEqual({
          isError: true,
          error: new Error('test error'),
          data: undefined,
        });
      });

      it('should return the error object when the promise throws - function type is inferred - anonymous', async () => {
        const wrappedFn = wrapException(
          async () =>
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            new Promise((_resolve, _reject) => {
              // something weird happened
              throw new Error('test error from throw');
            }),
        );

        // Must be AsyncWrapped - so "await" is required
        expectType<
          TypeEqual<
            AsyncWrapped<() => Promise<unknown>, unknown, Promise<unknown>>,
            typeof wrappedFn
          >
        >(true);

        const result = await wrappedFn();

        expectType<TypeEqual<WrappedResponse<unknown, unknown>, typeof result>>(
          true,
        );

        expect(result).toEqual({
          isError: true,
          error: new Error('test error from throw'),
          data: undefined,
        });
      });

      it('should return the error object when the promise throws - function type is explicit', async () => {
        const wrappedFn = wrapException(toggleablePromiseConstructorExplicit);

        // Must be AsyncWrapped - so "await" is required
        expectType<
          TypeEqual<
            AsyncWrapped<
              (arg: boolean) => Promise<string>,
              unknown,
              Promise<string>
            >,
            typeof wrappedFn
          >
        >(true);

        const result = await wrappedFn(false);

        expectType<TypeEqual<WrappedResponse<string, unknown>, typeof result>>(
          true,
        );

        expect(result).toEqual({
          isError: true,
          error: new Error('test error'),
          data: undefined,
        });
      });
    });
  });

  describe('invalid async function usage', () => {
    it('should have type signature of sync function and return the same with or without await', async () => {
      const wrappedFn = wrapException((): void => {
        throw new Error('test error');
      });

      expectType<
        TypeEqual<SyncWrapped<() => void, unknown, void>, typeof wrappedFn>
      >(true);

      // eslint-disable-next-line @typescript-eslint/await-thenable
      const resultWithAwait = await wrappedFn();
      const resultWithoutAwait = wrappedFn();

      expect(resultWithoutAwait).toEqual(resultWithAwait);
    });
  });
});

describe('wrapException - sync', () => {
  describe('general type checks', () => {
    it('should switch the type when checking for error', () => {
      const wrappedFn = wrapException(successSyncStringInferred);
      const result = wrappedFn();

      expectType<TypeEqual<WrappedResponse<string, unknown>, typeof result>>(
        true,
      );

      const typeCheck = () => {
        // Both are unknown before checking isError
        expectType<TypeEqual<unknown, typeof result.data>>(true);
        expectType<TypeEqual<unknown, typeof result.error>>(true);

        if (result.isError) {
          // Data is unknown when isError is true
          expectType<TypeEqual<unknown, typeof result.data>>(true);
          // Error is unknown so consumer can handle it (e.g. error instanceof Error)
          expectType<TypeEqual<unknown, typeof result.error>>(true);
        } else {
          // Data is the function return type when not an error
          expectType<TypeEqual<string, typeof result.data>>(true);
          // Error is undefined when not an error
          expectType<TypeEqual<undefined, typeof result.error>>(true);
        }
      };

      typeCheck();
      expect(result).toBeDefined();
    });

    it('should switch the type when checking for error keeping original function type', () => {
      const wrappedFn = wrapException(toggleableSyncExplicit);
      const result = wrappedFn();

      expectType<
        TypeEqual<WrappedResponse<string[] | undefined, unknown>, typeof result>
      >(true);

      const typeCheck = () => {
        expectType<TypeEqual<unknown, typeof result.data>>(true);
        expectType<TypeEqual<unknown, typeof result.error>>(true);

        if (result.isError) {
          expectType<TypeEqual<unknown, typeof result.data>>(true);
          expectType<TypeEqual<unknown, typeof result.error>>(true);
        } else {
          // Data is still the function return type when not an error
          expectType<
            TypeEqual<
              Awaited<ReturnType<typeof toggleableAsyncExplicit>>,
              typeof result.data
            >
          >(true);
          expectType<TypeEqual<undefined, typeof result.error>>(true);
        }
      };

      typeCheck();
      expect(result).toBeDefined();
    });

    it('should switch the type when checking for error - advanced usage', () => {
      const wrappedFn = wrapException<typeof successSyncStringInferred, Error>(
        successSyncStringInferred,
      );
      const result = wrappedFn();

      expectType<TypeEqual<WrappedResponse<string, Error>, typeof result>>(
        true,
      );

      const typeCheck = () => {
        if (result.isError) {
          expectType<TypeEqual<unknown, typeof result.data>>(true);
          expectType<TypeEqual<Error, typeof result.error>>(true);
        } else {
          expectType<TypeEqual<string, typeof result.data>>(true);
          expectType<TypeEqual<undefined, typeof result.error>>(true);
        }
      };

      typeCheck();
      expect(result).toBeDefined();
    });
  });

  describe('when the function succeeds', () => {
    it('should return the result - function type is inferred - anonymous', () => {
      const wrappedFn = wrapException(() => 'test');

      expectType<
        TypeEqual<SyncWrapped<() => string, unknown, string>, typeof wrappedFn>
      >(true);

      const result = wrappedFn();

      expect(result).toEqual({
        isError: false,
        error: undefined,
        data: 'test',
      });
    });

    it('should return the result - function type is inferred', () => {
      const wrappedFn = wrapException(successSyncStringInferred);

      expectType<
        TypeEqual<SyncWrapped<() => string, unknown, string>, typeof wrappedFn>
      >(true);

      const result = wrappedFn();

      expect(result).toEqual({
        isError: false,
        error: undefined,
        data: 'test',
      });
    });

    it('should return the result - function type is explicit', () => {
      const wrappedFn = wrapException(successSyncStringExplicit);

      expectType<
        TypeEqual<SyncWrapped<() => string, unknown, string>, typeof wrappedFn>
      >(true);

      const result = wrappedFn();

      expect(result).toEqual({
        isError: false,
        error: undefined,
        data: 'test',
      });
    });

    it('should return the result - function type is explicit - slightly complex type', () => {
      const wrappedFn = wrapException(toggleableSyncExplicit);

      expectType<
        TypeEqual<
          SyncWrapped<
            (arg?: boolean) => string[] | undefined,
            unknown,
            string[] | undefined
          >,
          typeof wrappedFn
        >
      >(true);

      const result = wrappedFn(true);

      expect(result).toEqual({
        isError: false,
        error: undefined,
        data: ['test'],
      });

      const result2 = wrappedFn(false);

      expect(result2).toEqual({
        isError: false,
        error: undefined,
        data: undefined,
      });
    });
  });

  describe('when the function fails', () => {
    it('should return the error object - function type is inferred - anonymous', () => {
      const wrappedFn = wrapException((num1: number) => {
        if (num1 === 0) throw new Error('test error');
      });

      expectType<
        TypeEqual<
          SyncWrapped<(num1: number) => void, unknown, void>,
          typeof wrappedFn
        >
      >(true);

      const result = wrappedFn(0);

      expect(result).toEqual({
        isError: true,
        error: new Error('test error'),
        data: undefined,
      });
    });

    it('should return the error object - function type is explicit', () => {
      const wrappedFn = wrapException(throwingSyncExplicit);

      expectType<
        TypeEqual<SyncWrapped<() => void, unknown, void>, typeof wrappedFn>
      >(true);

      const result = wrappedFn();

      expect(result).toEqual({
        isError: true,
        error: new Error('test error'),
        data: undefined,
      });
    });

    it('should return the error object - function type is inferred', () => {
      const wrappedFn = wrapException(throwingSyncInferred);

      // TODO: FIX THIS - never is messing up the return type, transforming this SYNC function into an ASYNC function
      expectType<
        TypeEqual<SyncWrapped<() => never, unknown, never>, typeof wrappedFn>
        // @ts-expect-error: type is messed up, should be SyncWrapped
      >(true);

      const result = wrappedFn();

      expect(result).toEqual({
        isError: true,
        error: new Error('test error'),
        data: undefined,
      });
    });
  });
});
