# @ts-to-go/wrapException

`@ts-to-go/wrapException` is a wrapper function that encapsulates both asynchronous and synchronous functions to return a tuple containing both the error and the result.

```ts
const [error, result] = await wrapException(_someAsyncFunctionThatThrowsOrRejects_);

if (error) {
  // Do something
} else {
  console.log(result);
}
```

By adopting this error handling pattern, `ts-to-go` allows for a more explicit management of error states, enhancing the readability of your TypeScript code.

## Examples

### 1. Wrapping Asynchronous Functions

```ts
import { wrapException } from 'ts-to-go';

// An async function
const asyncFn = async (param: string) => {
  if (param === 'error') throw new Error('Oops! An error occurred.');

  return 'Success';
};

// Wrap it using wrapException
const wrappedAsyncFn = wrapException(asyncFn);

// Use the wrapped function
const [error, result] = await wrappedAsyncFn('error');

// Now you can handle the error and result easily
console.log(error, result); // Error: 'Oops! An error occurred.' Result: undefined
```

### 2. Wrapping Synchronous Functions

```ts
import { wrapException } from 'ts-to-go';

// A sync function
const syncFn = (num1: number, num2: number) => {
  if (num1 === 0) throw new Error('Zero is not allowed.');

  return num1 + num2;
};

// Wrap it using wrapException
const wrappedSyncFn = wrapException(syncFn);

// Use the wrapped function
const [error, result] = wrappedSyncFn(0, 1);

// Now you can handle the error and result easily
console.log(error, result); // Error: 'Zero is not allowed.' Result: undefined
```

### More examples

See [/packages/examples](../examples)
