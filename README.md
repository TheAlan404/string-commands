# string-commands v2 rewrite

String Commands is a new experimental command handler with differient ideas.

This `v2` branch is a full rewrite, in typescript.

## Goals

- Customizability
- Extensible
- Async by default

## Example

See tested and working examples:
- [Console REPL](./examples/stdin.ts)
- [discord.js with Slash Commands](./examples/discordjs-slash.ts)

```js
let handler = new CommandHandler();

// Set up middlewares depending on what you need:

handler
  .use(MultiPrefix({ prefixes: ["!", ".", "/"] }))
  .use(SplitString())
  .use(CommandResolver())
  .use(CommandExecutor())

// You can also define your own middlewares

let globalNumber = 0;
handler.use({
  id: "command-number",
  run: (ctx) => ({ ..ctx, number: globalNumber++ }),
})

// Add your commands

handler.add({
  name: "hello",
  run: ({ number }) => {
    console.log(`Hi! This is execution #${number}, provided by the custom middleware.`);
  }
})

// and run them

handler.run({
  input: "hello",
})
```

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
  - [ ] reader impl
  - [ ] extensible parsers
- [ ] Adapters
  - [ ] lowdb
  - [ ] i18next
  - [ ] discord.js
- [ ] Utilities
  - [ ] Pretty printer
- [ ] Documentation
  - [ ] Core middlewares

## Concepts

### Context

Command resolving, execution etc are all made possible using Contexts.

The `BaseContext` contains `{ handler, input }`

Every middleware gets the last context and adds/removes/modifies properties.

For example, the `CommandResolver` middleware requires `{ commandName, handler }` in the context and adds `{ rootCommand, targetCommand }` to the context.

## Docs

### Middleware: Inspect

**Options** `fn: (ctx: T) => void`

Inspects the current context, useful for debugging

```js
handler
  // Logs { handler: CommandHandler, ... }
  .use(Inspect())

  // Custom function
  .use(Inspect((ctx) => { ... }))
```

### Middleware: Prefix

`input: string` => `input: string`

**Options:** `{ prefix: string }`

Ignore runs where the input does not start with `prefix` and strip it when it does.

```js
handler
  .use(Inspect()) // { input: "!help", ... }
  .use(Prefix({ prefix: "!" }))
  .use(Inspect()) // { input: "help", ... }

handler.run({ input: "!help" })
```

### Middleware: MultiPrefix

`input: string` => `input: string`

**Options:** `{ prefixes: string[] }`

Same as `Prefix` middleware, but supports multiple.

### Middleware: SplitString

**Requires:** `{ input: string }`

**Outputs:** `{ commandName: string, commandArgs: string }`

Splits the first word of the input to be able to pass it into a command resolver

```js
handler
  .use(SplitString())
  .use(Inspect()) // { commandName: "roll", commandArgs: "1d6", ... }

handler.run({ input: "roll 1d6" })
```

### Middleware: ContextStatic

**Options:** any object

This utility middleware adds the properties given via options to the context.

```js
handler
  .use(ContextStatic({ a: 1 }))
  .use(Inspect()) // { a: 1, ... }
```

### Middleware: CommandExecutor

**Requires:** `{ targetCommand, handler }`

This middleware executes aka calls the `run` method of the command.

### Middleware: CommandResolver

**Requires:** `{ commandName, handler }`

**Outputs:** `{ rootCommand, targetCommand }`

This middleware resolves the command based on the `commandName` property.

If a command is not found, the `commandNotFound` reply is invoked.

`targetCommand` is usually equal to `rootCommand` unless there are subcommands, in which case the resolved subcommand is assigned to `targetCommand`.
