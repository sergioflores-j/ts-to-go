# ts-to-go

`ts-to-go` is a TypeScript utility library designed with a Golang flair. It provides a way to enhance error handling in your TypeScript applications. The main feature is a wrapper function that encapsulates both asynchronous and synchronous functions to return arrays containing both errors and results.

## Getting started

You can install the `ts-to-go` package using npm or yarn with the following commands:

```bash
npm i ts-to-go
# or
yarn add ts-to-go
```

## How to Use

### 1. Wrapping Asynchronous Functions

You can wrap your asynchronous functions using `wrapException` to enhance error handling. It returns an array with either `[undefined, Result]` when the promise is resolved successfully or `[Error, undefined]` when the promise is rejected.

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

You can wrap synchronous functions using `wrapException` in a similar way. It returns an array with either `[undefined, Result]` when the function execution is successful or `[Error, undefined]` when an error is thrown.

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

By adopting this error handling pattern, `ts-to-go` allows for a more explicit management of error states, enhancing the readability of your TypeScript code.
