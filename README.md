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

<<<<<<< Updated upstream
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
=======
### Creating a Command Handler

You can pass an object of options into the CommandHandler.

```js
let handler = new CommandHandler({
    // inputs must also begin with prefix
    // you can set this to an empty string
    prefix: "!",

    // by default, log uses console
    // set to false to disable logging
    log: false,
    // or put in your own logger
    log: myLogger,

    // you can also put the functions here to overwrite them,
    // instead of overriding them after initialization
    // note that these are still optional
    transformCommand: () => {},
    buildArguments: () => {},
});
```

### Writing Commands

Commands are just objects that must have two properties:

- `name` (string) The name of the command
- `run` (function) The 'runner function'

**Example Command:**

```js
let myCommand = {
    name: "ping",
    run: (ctx, args) => {
        console.log("Pong!");
    },
};
```

#### Runner Functions

By default, the arguments of the runner functions are as follows:

```js
run: (ctx, args) => {} 
```

The arguments of the Runner Functions are defined using `CommandHandler#buildArguments`

You can change the order, remove, or add new params to the runner functions by overwriting `CommandHandler#buildArguments` like so:

```js
handler.buildArguments = (b) => {
    return [b.args, b.ctx.username];
}

// which would make you be able to define the runner function as:
let run = (args, username) => {};
```

### Registering Commands

There are two ways to register commands:

**1. using an object:**

```js
handler.registerCommand(cmd);
handler.registerCommand({ ... });
```

**2. from a folder (recursively):**

```js
// path is "./commands" by default
handler.registerCommands();
handler.registerCommands(path);
handler.registerCommands("./src/cmds");
```

#### Registering old commands

If your project has old commands from another command handler that has differient command objects, you can still import them.

You can set the `CommandHandler#transformCommand` to a helper function that would 'transform' the exported object into a valid command object.

**Example:**

```js
let oldCommand = {
    help: {
        name: "ping"
    },
    execute: async () => {},
};

handler.transformCommand = (obj) => {
    if(!obj.name) obj.name = obj.help.name;
    if(!obj.run) obj.run = obj.execute;
    return obj;
}
```

### Checks

Your commands can also have custom checks. Its recommended to make the checks once and reuse them for commands.

Command Checks are just the same as runner functions, but they must return an object with these props:

- `pass` (boolean) - set to true if check succeeded
- `message` (string) - if it failed, the message explaining why

```js
{
    checks: [
        (ctx, args) => {
            // Im an useless check! Gonna make it run!
            return { pass: true };
        },

        (ctx, args) => {
            // just you wait until you hear that im after you
            return {
                pass: false,
                message: "Hardcoded Failiure",
            };
        },
    ]
}
```

### ArgumentParser

The argument parser is a complex system that parses and validates given arguments for you. This means no more if-else checks for arguments in every command :D

Argument parser will look into `args` of your command objects.

**Examples:**

Arguments are also just objects. They must have a `type`, the rest are **parser options**

Arguments can have custom names using `name`

For example, in the code below, the `rest: true` field is a parser option

```js
{
    name: "say",
    args: [{
        type: "text",
        name: "yourMessage",
        rest: true,
    }],
    run: () => {},
}
```

**String Resolving:**

You can also put strings instead of objects, but the side effect is that you cant define other parser options.

```js
args: ["text"]

// a ":" can be used to give it a name
args: ["yourMessage:text"]

// it can also be marked optional and required
args: ["[text]", "<text>"]

// you can use three dots in the end to set `rest: true`
args: ["text..."]

// you can also combine it like so:
args: ["<words:text>..."]

// you can also also turn the whole array into a string
args: "<user:text> <points:number> [comment:string]..."
```

#### Special Parser Options

**`rest` (boolean)** - if set to true, consumes the rest of the input with it
**`optional` (boolean)** - if set to true, this argument is considered optional
**`name` (string)** - define the name of the argument

#### Native Parsers

##### ArgumentParser: text

Options:

- `min` (number) - Minimum characters
- `max` (number) - Maximum characters

##### ArgumentParser: number

Options:

- `min` (number)
- `max` (number)
- `isInt` (boolean = false) - If the number should be an integer

##### ArgumentParser: bool

Options:

- `acceptNull` (boolean|string) - Will accept values not true or false as `null`. Set to `"strict"` to strictly check if value is `"null"` or not.

#### Writing Custom Argument Parsers

Arguments parsers are internally called **Usage Parser**s.

A usage parser is an object, like an argument, but with a `parse` function.

```js
// usage parser: "that"
{
    // underlying type
    type: "text",

    // options to pass into underlying type
    max: 1024,

    // the parse function
    async parse(ctx) {
        // the user input or parsed value
        ctx.arg;

        // the options
        ctx.opts.foo;

        // "custom name"
        ctx.name;
    }
}

args: [{ type: "that", name: "custom name", foo: 1 }]
```

**What should I return?**

If the parsing etc was successful, return an object with `parsed` as your value.

If there were any errors etc, return an object with `fail: true` and `message` set to the error message.

```js
// it doesnt have to be a variable btw
return { parsed: myValue };

return {
    fail: true,
    message: "Your argument failed the vibe check.",
}
```

Usage parsers can easily inherit other parsers using `type`.

ArgumentParser automatically parses the lowest type and builds up from there.

This means if you have an usage parser with type set to `"number"`, `ctx.arg` will be a number instead of a string.

**Inheritance Example:**

```js
const specialChars = "!'^+%&/()=?_-*>£#$½{[]}\\".split("");

handler.registerUsages({
    char: {
        type: "text",
        min: 1,
        max: 1,
    },

    specialChar: {
        type: "char",
        async parse(ctx) {
            if(specialChars.includes(ctx.arg)) {
                return { parsed: ctx.arg };
            } else {
                return {
                    fail: true,
                    message: "Your char isnt special.",
                }
            };
        },
    },
})
```

#### Registering Custom Argument Parsers

```js
handler.registerUsage(usage);
handler.registerUsage({ ... });

// obj: Object<string, UsageParser>
handler.registerUsages(obj);
handler.registerUsages({
    name1: usage1,
    ...
});
```

## TODO

- [ ] Discord.js Plugin
- [ ] Discord.js Slash commands plugin
- [ ] Subcommands
- [ ] Permissions
>>>>>>> Stashed changes

## Concepts

<<<<<<< Updated upstream
### Context
=======
**v1.0.0:**
>>>>>>> Stashed changes

Command resolving, execution etc are all made possible using Contexts.

The `BaseContext` contains `{ handler, input }`

Every middleware gets the last context and adds/removes/modifies properties.

For example, the `CommandResolver` middleware requires `{ commandName, handler }` in the context and adds `{ rootCommand, targetCommand }` to the context.

## Docs

### CommandHandler

```js
// Create a new Command Handler
let handler = new CommandHandler();

```

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
