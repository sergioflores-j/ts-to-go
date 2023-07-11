import { wrapException } from './index';

describe('wrapException - async', () => {
  describe('async/await', () => {
    it('should return the result in an array when the promise resolves', async () => {
      const wrappedFn = wrapException(async () => 'test');
      const result = await wrappedFn();
      expect(result).toEqual([undefined, 'test']);
    });

    it('should return the error in an array when the promise rejects', async () => {
      const wrappedFn = wrapException(async () => {
        throw new Error('test error');
      });
      const [error] = await wrappedFn();
      expect(error).toBeInstanceOf(Error);
      expect(error).toHaveProperty('message', 'test error');
    });
  });

  describe.skip('promise', () => {
    it('should return the result in an array when the promise resolves', async () => {
      const wrappedFn = wrapException(() => Promise.resolve('test'));
      const result = await wrappedFn();
      expect(result).toEqual([undefined, 'test']);
    });

    it('should return the error in an array when the promise rejects', async () => {
      const wrappedFn = wrapException(() =>
        Promise.reject(new Error('test error'))
      );
      const [error] = await wrappedFn();
      expect(error).toBeInstanceOf(Error);
      expect(error).toHaveProperty('message', 'test error');
    });
  });

  describe.skip('promise constructor', () => {
    it('should return the result in an array when the promise resolves', async () => {
      const wrappedFn = wrapException(() => new Promise((resolve) => resolve('test')));
      const result = await wrappedFn();
      expect(result).toEqual([undefined, 'test']);
    });

    it('should return the error in an array when the promise rejects', async () => {
      const wrappedFn = wrapException(() =>
        Promise.reject(new Error('test error'))
      );
      const [error] = await wrappedFn();
      expect(error).toBeInstanceOf(Error);
      expect(error).toHaveProperty('message', 'test error');
    });
  });
});

describe('wrapException - sync', () => {
  it('should return the result in an array when the function executes', () => {
    const wrappedFn = wrapException(() => 'test');
    const result = wrappedFn();
    expect(result).toEqual([undefined, 'test']);
  });

  it('should return the error in an array when the function throws', () => {
    const wrappedFn = wrapException((num1: number) => {
      if (num1 === 0) throw new Error('test error');
    });

    const [error] = wrappedFn(0);
    expect(error).toBeInstanceOf(Error);
    expect(error).toHaveProperty('message', 'test error');
  });
});
