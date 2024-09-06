/* eslint-disable @typescript-eslint/require-await */

// -----
// ASYNC
// -----
export const successAsyncStringInferred = async () => {
  return 'test';
};

export const successAsyncStringExplicit = async (): Promise<string> => {
  return 'test';
};

export const toggleableAsyncExplicit = async (
  arg?: boolean,
): Promise<string[] | undefined> => {
  if (!arg) {
    return undefined;
  }

  const data = await Promise.resolve(['test']);

  return data;
};

export const throwingAsyncInferred = async () => {
  throw new Error('test error');
};

export const throwingAsyncExplicit = async (): Promise<void> => {
  throw new Error('test error');
};

// -----
// SYNC
// -----
export const successSyncStringInferred = () => {
  return 'test';
};

export const successSyncStringExplicit = (): string => {
  return 'test';
};

export const toggleableSyncExplicit = (arg?: boolean): string[] | undefined => {
  if (!arg) {
    return undefined;
  }

  return ['test'];
};

export const throwingSyncInferred = () => {
  throw new Error('test error');
};

export const throwingSyncExplicit = (): void => {
  throw new Error('test error');
};

// -----
// Promise
// -----
export const toggleablePromiseExplicit = (arg: boolean): Promise<string> => {
  if (!arg) {
    return Promise.reject(new Error('test error'));
  }

  return Promise.resolve('test');
};

// -----
// Promise constructor
// -----
export const toggleablePromiseConstructorExplicit = (
  arg: boolean,
): Promise<string> => {
  const pro = new Promise<string>((resolve) => {
    resolve('test');
  });

  if (!arg) {
    throw new Error('test error');
  }

  return pro;
};
