# string-commands

The all powerful command handler for anything.

## Features

- Easy to use
- Recursive folder importing
- Compatability with older commands
- Configurable messages (no defaults)
- Command checks (requirements)
- Middlewares
- Argument handling with custom argument support

## Examples

For the best example please see [consoleExample.js](/examples/consoleExample.js)

## Usage

### Installing

You can install this package using

```sh
npm i string-commands
```

And then import using

```js
import { CommandHandler } from "string-commands";
```

### Documentation

See these for docs:

- [Command Handler](./docs/CommandHandler.md)
- [Commands](./docs/Commands.md)
- [Usages](./docs/Usages.md)
- [Middlewares](./docs/Middlewares.md)

## TODO

- [x] Complete typings
- [x] Middleware
- [ ] Subcommands
- [ ] Database Middlewares
- [ ] Permissions Middleware

## Changelog

**v1.1.0:**

- :warning: **BREAKING:** In `ExecutorContext` (ctx in `failedChecksMessage(ctx)`/now `on("failedChecks", (ctx)=>{})`), the **`checks`** property is now `CommandCheckResult[]` instead of `string[]`. This allows Command Checks to supply additional information about the failed checks, such as
  - Codes for custom error messages
  - Additional context information (for example, you could supply the user's score or something so your failed checks handler doesnt have to fetch it from a database again, or maybe supply the needed threshold etc)
- :warning: The `invalidUsageMessage` and `failedChecksMessage` functions have been removed. Please use the `invalidUsage` and `failedChecks` events instead.
- Default prefix is now `""` (empty string)

- Added [Middlewares](./docs/Middlewares.md)
- Added `index.d.ts` declarations file that's needlessly complex (and also incomplete)
- Added more documentation

**v1.0.0:**

- Created project
- Added documentation
