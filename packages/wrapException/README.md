# @ts-to-go/wrap-exception

`@ts-to-go/wrap-exception` is a wrapper function that encapsulates both asynchronous and synchronous functions to return a comprehensible object containing both the error and the result.

By adopting this error handling pattern, `ts-to-go` allows for a more explicit management of error states, enhancing the readability of your TypeScript code as it allows for easier to write ["early return" pattern](https://gomakethings.com/the-early-return-pattern-in-javascript/).

<p align="center">
  <img src="../../docs/attachments/meme.jpg" />
</p>

## Getting started

You can install the `@ts-to-go/wrap-exception` package using any package manager:

```bash
npm i @ts-to-go/wrap-exception
# or
yarn add @ts-to-go/wrap-exception
# or
pnpm add @ts-to-go/wrap-exception
```

> PS: Bear in mind it needs to be a runtime dependency, so do not install it as a "devDependency".

## How to Use

Basic example:

```ts
const wrappedFunction =  wrapException(_someAsyncFunctionThatThrowsOrRejects_);

const { isError, error, data } = await wrappedFunction();

if (isError) {
  // Handle the error here
  console.error(error);
} else {
  // Data can be safely used here
  console.log(data);
}
```

TIP: always check if the result of a function execution is an error or not using the `isError` attribute. (more about it in the FAQ section)

### 1. Wrapping Asynchronous Functions (simple usage)

```ts
// An example of an async function
const myAsyncFn = async (param: string) => {
  if (param !== 'some-allowed-value') {
    throw new Error('Oops! An error occurred.');
  }

  await _doSomeAsyncProcessingThatCanThrow_();

  return { success: true };
};
```

```ts
import wrapException from '@ts-to-go/wrap-exception';

// Wrap it using wrapException
const wrappedAsyncFn = wrapException(myAsyncFn);

// Use the wrapped function
const { isError, error, data } = await wrappedAsyncFn('error');

if (isError) { // will be: true for this example
  console.error(error); // will log: Error: 'Oops! An error occurred.
} else {
  console.log(data); // will not be reached as it was an error
}
```

### 2. Wrapping Synchronous Functions (simple usage)

```ts
// An example of a sync function
const syncFn = (num1: number, num2: number) => {
  if (num1 === 0) throw new Error('Zero is not allowed.');

  return num1 + num2;
};
```

```ts
import wrapException from '@ts-to-go/wrap-exception';

// Wrap it using wrapException
const wrappedSyncFn = wrapException(syncFn);

// Use the wrapped function
const [error, result] = wrappedSyncFn(0, 1);

if (isError) { // will be: true for this example
  console.error(error); // will log: Error: 'Zero is not allowed.'
} else {
  console.log(data); // will not be reached as it was an error
}
```

### TIP: Wrapping any function by default

You can also adopt exporting functions wrapped by default:

```ts
// src/utils/some-utility.ts
import wrapException from '@ts-to-go/wrap-exception';

export const myAsyncFn = wrapException(async (param: string) => {
  if (param !== 'some-allowed-value') {
    throw new Error('Oops! An error occurred.');
  }

  return 'Success';
});
```

Then in your "handler" you can consume this function already wrapped: 

```ts
// src/my-actual-handler.ts
import { myAsyncFn } from 'src/utils/some-utility';

const { isError, error, data } = await myAsyncFn('will throw error');

// Now you can handle the error/response easily
console.log(isError); // true
console.log(error); // Error: 'Oops! An error occurred.'
console.log(data); // undefined
```

This reduces complexity managing `wrapException` instances in the code and enforces a standard for error handling in the whole project. 

### More examples

See [/packages/examples](../examples)

## Usage Complexity Levels

### Simple usage (RECOMMENDED)

It is important to note that the examples are mostly focusing in the "simple usage complexity level" of `wrapException`. 

This should cover most of the scenarios for every consumer as it also enforces the error handling to be more criterious and handle error types properly. As the error is also `unknown` by the function's author.

```ts
const someWrappedFn = wrapException(async () => { ... });

const { isError, error, data } = await someWrappedFn();

if (isError) {
  if (isAxiosError(error)) {
    // ... do something else...
  }
  if (error instanceof Error) {
    // ... do something...
  }

  // unknown error
  throw new Error('unknown error');
}
```

### Advanced usage (USE WITH CAUTION)

`wrapException` also can serve as a way to explicitly state what errors the function can throw. This is called "advanced - usage complexity level". 

This can be useful if the function's author is sure what kinds of errors the function can throw.

```ts
const myFn = async () => { ... };
const someWrappedFn = wrapException<typeof myFn, Error>(myFn);

const { isError, error, data } = await someWrappedFn();

if (isError) {
  // this will always be of type "Error"
  throw error.message;
}
```

#### Remark: Why advanced usage is "USE WITH CAUTION"? 

Because having the static types for errors can be misleading. 

If the function starts to throw other kinds of errors and the author forgot to update the type definitions, then consumers will not be prepared to handle those new errors and it might be that they break the error handling.


```ts
const myFn = async () => { ... };
const someWrappedFn = wrapException<typeof myFn, AxiosError>(myFn);

const { isError, error, data } = await someWrappedFn();

if (isError) {
  /**
   * If `myFn` starts to throw some other error type, such as:
   * @example Error
   * @example ValidationError
   * @example SyntaxError
   * ...
   * Then `error.response` below will be undefined
   * Breaking the previous implementation of the consumer, as like:
   */
  throw new HttpError(error.response.status); // throws: 'cannot access status of undefined'
}
```

## FAQ

### Why is there an `isError` attribute? And why always check it?

`wrapException` returns a control variable called `isError` that is useful to identify if the returned values from the executed function is an Error or a Success (`data`).

Ideally, this wouldn't be necessary and the check would be as follows:

```ts
const result = fn();
if (result.error) {
  // result.error is unknown so it has to be handled
  // result.data is undefined
} else {
  // result.error is undefined
  // result.data is the type the function defined.. T
}
```

This is not possible because the default returned type for the `error` is `unknown` as the following types:

```ts
type ErrorResponse = { error: unknown; data: undefined };
type SuccessResponse = { error: undefined; data: T };

type WrappedResponse = SuccessResponse | ErrorResponse;
```

In Typescript, `unknown` is ['stronger'](https://www.typescriptlang.org/docs/handbook/type-compatibility.html#any-unknown-object-void-undefined-null-and-never-assignability) than any other type because anything can be assigned to it. i.e. an union type of `unknown | undefined` becomes `unknown`. 

Which means the union of the above mentioned types becomes something like:

```ts
type WrappedResponse = { error: unknown; data: T | undefined };
```

Notice that the `undefined` union is now gone. This results in the following behavior:

```ts
const result = fn();
if (result.error) {
  // result.error is unknown so it has to be handled
  // result.data is T | undefined (which is not true! here the data would be undefined)
} else {
  // result.error is still unknown
  // result.data is T | undefined (which is not true! here data would already be of type "T")
}
```

`isError` for the rescue!

It serves as a unique identifier in the union type so that Typescript can infer the resulting type properly:

```ts
const result = fn();
if (result.isError) {
  // result.error is unknown so it has to be handled
  // result.data is unknown (serves the same purpose as "undefined")
} else {
  // result.error is undefined (now we can be SURE it is not an error)
  // result.data is the type the function defined = T
}
```
