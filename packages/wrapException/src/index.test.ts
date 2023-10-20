import wrapException from './index';

describe('wrapException - async', () => {
  describe('async/await', () => {
    it('should return the result in the second tuple position when the promise resolves', async () => {
      const wrappedFn = wrapException(async () => {
        return Promise.resolve('test');
      });

      const result = await wrappedFn();

      expect(result).toEqual([undefined, 'test']);
    });

    it('should return the error in the first tuple position when the promise rejects', async () => {
      // eslint-disable-next-line @typescript-eslint/require-await
      const wrappedFn = wrapException(async () => {
        throw new Error('test error');
      });

      const [error, result] = await wrappedFn();

      expect(result).toBeUndefined();

      expect(error).toBeInstanceOf(Error);
      expect(error).toHaveProperty('message', 'test error');
    });
  });

  describe('promise', () => {
    it('should return the result in a tuple with 2 positions when the promise resolves', async () => {
      const wrappedFn = wrapException(() => Promise.resolve('test'));

      const result = await wrappedFn();

      expect(result).toEqual([undefined, 'test']);
    });

    it('should return the error in a tuple with 2 positions when the promise rejects', async () => {
      const wrappedFn = wrapException(() =>
        Promise.reject(new Error('test error')),
      );

      const [error] = await wrappedFn();

      expect(error).toBeInstanceOf(Error);
      expect(error).toHaveProperty('message', 'test error');
    });
  });

  describe('promise constructor', () => {
    it('should return the result in a tuple with 2 positions when the promise resolves', async () => {
      const wrappedFn = wrapException(
        () =>
          new Promise((resolve) => {
            resolve('test');
          }),
      );

      const result = await wrappedFn();

      expect(result).toEqual([undefined, 'test']);
    });

    it('should return the error in a tuple with 2 positions when the promise rejects', async () => {
      const wrappedFn = wrapException(
        () =>
          new Promise((_resolve, reject) => {
            reject(new Error('test error'));
          }),
      );

      const [error] = await wrappedFn();

      expect(error).toBeInstanceOf(Error);
      expect(error).toHaveProperty('message', 'test error');
    });

    it('should return the error in a tuple with 2 positions when the promise throws', async () => {
      const wrappedFn = wrapException(
        async () =>
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          new Promise((_resolve, _reject) => {
            // something weird happened
            throw new Error('test error from throw');
          }),
      );

      const [error] = await wrappedFn();
      expect(error).toBeInstanceOf(Error);
      expect(error).toHaveProperty('message', 'test error from throw');
    });
  });

  describe('invalid async function', () => {
    it('should return the error in a tuple with 2 positions', async () => {
      const wrappedFn = wrapException(() => {
        throw new Error('test error');
      });

      const [error] = await wrappedFn();

      expect(error).toBeInstanceOf(Error);
      expect(error).toHaveProperty('message', 'test error');
    });
  });
});

describe('wrapException - sync', () => {
  it('should return the result in a tuple with 2 positions when the function executes', () => {
    const wrappedFn = wrapException(() => 'test');
    const result = wrappedFn();

    expect(result).toEqual([undefined, 'test']);
  });

  it('should return the error in a tuple with 2 positions when the function throws', () => {
    const wrappedFn = wrapException((num1: number) => {
      if (num1 === 0) throw new Error('test error');
    });

    const [error] = wrappedFn(0);
    expect(error).toBeInstanceOf(Error);
    expect(error).toHaveProperty('message', 'test error');
  });
});

describe('wrapException - advanced usage', () => {
  // TODO: write more scenarios
  it('should return the error in the first tuple position when the promise rejects using the custom type', async () => {
    const wrappedFn = wrapException<string, Error, [condition: boolean]>(
      // eslint-disable-next-line @typescript-eslint/require-await
      async (condition: boolean) => {
        if (condition) return 'somevalue';

        throw new Error('test error');
      },
    );

    const [error] = await wrappedFn(false);

    expect(error).toBeInstanceOf(Error);
  });
});
