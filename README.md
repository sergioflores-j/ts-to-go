# ts-to-go

`ts-to-go` is a TypeScript utility library designed with a Golang flair. It provides a way to enhance error handling in your TypeScript applications. The main feature is a wrapper function that encapsulates both asynchronous and synchronous functions to return arrays containing both errors and results.

## Getting started

You can install any `ts-to-go` package using npm or yarn with as the following commands:

```bash
npm i @ts-to-go/wrap-exception
# or
yarn add @ts-to-go/wrap-exception
```

## How to Use

Please refer to each package documentation:

[@ts-to-go/wrap-exception](./packages/wrapException)

## Contributing

### Development

This project is setup using NPM workspaces and Turborepo. Read more about it here:

- [NPM Workspaces](https://docs.npmjs.com/cli/v10/using-npm/workspaces)
- [Turborepo](https://turbo.build/repo/docs)

From the root of the project:

1. Set the right node and package manger versions:
```
nvm use
corepack prepare
```

2. Install dependencies:

```
npm i
```

3. Make your changes in the package

4. Run build/test/lint for your changes:

```
npm run build-affected
npm run lint-affected
npm run test-affected
```
