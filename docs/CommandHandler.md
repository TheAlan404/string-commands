[🡐 Back to README.md](../README.md#documentation)

# CommandHandler

The command handler. Yes.

## Short Tutorial

### Creating a command handler

You can create a handler like so:

```js
import { CommandHandler } from "string-commands";

let handler = new CommandHandler({
    ...opts,
});
```

The options:

- `prefix: string`: The prefix that will be checked for you automatically
- `log: Logger`: A "logger" to use. It must be like `console`. Set to `false` to disable logging (default).

You can also supply the [`buildArguments`](#runnerargs) and [`transformCommand`](#backwards-compatability) functions as properties here to overwrite them while creating the handler.

### Adding commands

See **[Commands.md](Commands.md)** for more info about commands.

```js
handler.addCommand({
    name: "owo",
    run: () => console.log("uwu"),
});
```

You can import from a folder recursively:

```js
handler.addCommands("./commands");
```

### Running user input

Input being a string and ctx being [CustomContext](#customcontext)

```js
let input = "!say hi";
let ctx = { role: "admin" };

handler.run(input, ctx);
```

### Prettify

Want a prettified string representation? Here!:

```js
let command = {
    name: "give",
    args: [
        { name: "player", type: "text", },
        { name: "amount", type: "number", },
        { name: "meta", type: "text", optional: true },
    ]
};
handler.prettyPrint(command);
// "!give <player> <amount:number> [meta]"
```

And yes, even this is customizable! Check- *TODO: ArgumentHandlerStylings* ...oops

-----

## Events

### Invalid Usage

The event `'invalidUsage'` is fired with one argument being [ExecutorContext](#executorcontext)

It's fired when the input doesn't satisfy the command arguments, or there was an error while parsing the argument.

Find more about **usages/args** [here](Usages.md)

You can use the `errors` property to reply to the user about the invalid usages:

```js
handler.on("invalidUsage", (ctx) => {
    ctx.ctx.reply("bruh, suppy correct args istg, heres what you did wrong:");
    ctx.ctx.reply(ctx.errors.map((x) => "- " + x.message).join("\n"));
    ctx.ctx.reply("And here's the usage: " + handler.prettyPrint(ctx.command));
})
```

### Failed Checks

The event `'failedChecks'` is fired with one argument being [ExecutorContext](#executorcontext)

You can use the `checks` property to reply to the user about the failed checks:

```js
handler.on("failedChecks", (ctx) => {
    ctx.ctx.reply("bruh, command didnt run, here:");
    ctx.ctx.reply(ctx.checks.map((x) => "- " + x.message).join("\n"));
})
```

Find more about **checks** [here](Commands.md#checks)

## Terminology

### CustomContext

Every command would need a context of some sorts, right? For example, it's often the `DiscordMessage` in discord.js bots. A *CustomContext* in string-commands is the context you provide via the `handler.run` function.

```js
let customCtx = { username: "reisxd" }
handler.run("!balance", customCtx)
```

Now if we assume that the runner args are like so:

```js
handler.buildArgs = ({ ctx }) => [ctx];
```

We can access the Custom Context in our commands like so:

```js
let balanceCommand = {
    name: "balance",
    run(ctx) {
        let balance = data.users[ctx.username].balance;
        console.log(`${ctx.username} has ${balance} $`);
    },
}
```

Keep in mind that the custom context can be anything, including `undefined`, that means it's optional.

But some plugins/middlewares might add or modify the custom context, so you probably should make it an object just in case.

### RunnerArgs

In other command handlers, your commands had to fit a single form of arguments for commands' execute functions. This isn't the case for string-commands.

You define your own argument list using the `buildArguments` function like so:

```js
handler.buildArguments = (executorContext) => {
    return [
        executorContext.ctx,
        executorContext.args,
    ]
}
```

It takes the [ExecutorContext](#executorcontext) as the first argument.

The returning array of the `buildArguments` are called **Runner Args**. They define how the `run` function of your commands get their arguments:

```js
let myCommand = {
    name: "lol",
    run: (ctx, args) => {
        // do stuff
    },
};
```

The default runner args are `[CustomContext, args]`.

Here's another example:

```js
handler.buildArguments = (b) => {
  return [b.args, b.ctx.username];
};

// which would make you be able to define the runner function as:
let run = (args, username) => {};

// note that the username comes from 'ctx' which is the CustomContext
// so you'd need to:
handler.run(input, { username: "juliadev" });
```

*Note: While it is possible to give differient runner args to differient commands, its discouraged. I can't tell you what to do though.*

### ExecutorContext

The executor context is an object that holds information about the execution of a command.

It has the following properties:

- `input: string`: The raw input given to `handler.run`
- `ctx: CustomContext`: [CustomContext](#customcontext) given using `handler.run`
- `name: string`: The name of the command.
- `rawArgs: string[]`: Unparsed arguments (raw) from the input string
- `command: Command`: The command that's being executed
- Only in event `invalidUsage`:
  - `errors: UsageError[]`: List of usage errors.
- `args`: Array of parsed usages, from command's args
- `runArgs`: The built [Runner Args](#runnerargs)
- Only in event `failedChecks`:
  - `checks: CommandCheckFail[]`: List of failed checks
- `error: Error`: The error that occurred while running the command

The executor context is used in [`buildArguments`](#runnerargs) and mainly [middlewares](Middlewares.md).

### Backwards Compatability

The `transformCommand` function takes in an object and returns a Command.

You can overwrite this function to add backwards compatability with another command handler:

```js
handler.transformCommand = (obj) => {
    obj.run = obj.execute;
    return obj;
};
```

**Example:**

```js
let oldCommand = {
  help: {
    name: "ping",
  },
  execute: async () => {},
};

handler.transformCommand = (obj) => {
  if (!obj.name) obj.name = obj.help.name;
  if (!obj.run) obj.run = obj.execute;
  return obj;
};
```

-----

[^ Back to top](#commandhandler)
