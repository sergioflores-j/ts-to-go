/* eslint-disable @typescript-eslint/require-await */

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
