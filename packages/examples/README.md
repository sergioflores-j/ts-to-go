# @ts-to-go/examples

This library contains multiple example implementations of @ts-to-go packages.

Check the [./src](./src/) folder.

## List of examples:

- `wrapException`

| Wrapped function type | Usage Complexity Level | Description |
| --------------------- | ---------------------- | ----------- |
| Async                 | Simple                 | Types inferred & error unknown |
| Async                 | Advanced               | Error type explicitly set with generics |
| Async                 | Advanced               | Multiple Error types explicitly set with generics |
| Sync                  | Simple                 | Types inferred & error unknown |
| Sync                  | Advanced               | Error type explicitly set with generics |

> PS: Details on "usage complexity level" and when to use which refer to: [../wrapException/README.md](../wrapException/README.md#usage-complexity-levels).

<!-- TODO: use a diff tool to highlight the differences from simple vs advanced -->