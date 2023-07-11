# ts-to-go

Utilities to go for coding Typescript in Golang style!

## Getting started

- Installation

```
npm i ts-to-go

yarn add ts-to-go
```

### Wrapping Async functions

```ts
import { wrapException } from 'ts-to-go';

const wrappedFn = wrapException(async (param1: string) => {
  if (param1 === 'bar') throw new Error('bar');

  return await Promise.resolve('foo');
});

const [error, result] = await wrappedFn('bar');

// error: unknown
// result: string | undefined

if (error instanceof Error) {
  console.log('handling the error')
}

console.log('bar', error, result); // bar bar undefined
```

### Wrapping non Async functions

```ts
export const sum = wrapException((num1: number, num2: number): number | undefined => {
  if (num1 === 0) throw new Error('Error!!');

  return num1 + num2;
});

const [errorS, resultS] = sum(1, 1); // types errorS: unknown, resultS: number | undefined

console.log('sum', errorS, resultS); // sum undefined 2
```