# string-commands v2 rewrite

String Commands is a new experimental command handler with differient ideas.

This `v2` branch is a full rewrite, in typescript.

## Goals

- Customizability
- Extensible
- Async by default

## TODO

- [ ] CommandHandler
  - [x] run
  - [x] add
  - [x] use
  - [ ] addFolder
  - [ ] remove
  - [ ] removeFolder
- [ ] Core middlewares
  - [x] Split string
  - [x] Command resolver
    - [ ] Aliases
  - [x] Executor
  - [ ] Command checks
  - [ ] Argument system
- [ ] Adapters
  - [ ] lowdb
  - [ ] i18next
  - [ ] discord.js
- [ ] Utilities
  - [ ] Pretty printer
- [ ] Documentation
  - [ ] Core middlewares



## Changelog

**v1.2.0:**

- More major changes!
- :warning: **BREAKING:** Command checks now use `ExecutorContext`! For compatability reasons, the runner args are still being kept in the function arguments, but you need to add a dummy argument at the start. Check the docs for more info.
- :warning: **BREAKING:** `ExecutorContext` got lots of renaming:
  - `checks` => `failedChecks`

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
