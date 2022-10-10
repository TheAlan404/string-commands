# string-commands

The command handler and argument parser for anything.

## Features
- Recursive folder importing
- Configurable message stylings
- Command checks (requirements)
- Custom Command Arguments Parser
- Custom command run function arguments builder

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
- `isInt` (boolean = false) - If the number should be a whole number/no decimals/integer

#### Writing Custom Argument Parsers

Arguments parsers are internally called **Usage Parser**s.

An usage parser is an object, like an argument, but with a `parse` function.

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

Usage parsers can easily inherit other parsers using `type`. ArgumentParser automatically parses the lowest type and builds up from there. This means if you have an usage parser with type set to `"number"`, `ctx.arg` will be a number instead of a string.

## TODO

- [ ] Subcommands
- [ ] Permissions

## Changelog

**v.1.0.0:**

- Created project
- Added documentation
