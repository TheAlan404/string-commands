[🡐 Back to README.md](../README.md#documentation)
[🡐 Back to CommandHandler.md](CommandHandler.md)

# Commands

You know what a command is. In string-commands, a command is an object.

```js
let myCommand = {
    name: "hello",
    run: () => console.log("Hi!"),
}
```

## The Properties

### Basic Properties

- `name: string`: The name of the command
- `run: (...RunnerArgs) => void`: The runner function of the command
  - **Whats the parameters?** See [runner args](CommandHandler.md#runnerargs).
- `aliases?: string[]`: Optional aliases of the command

**Non-standard:**

These properties aren't used for the command handler, but is recommended for other plugins/middlewares etc:

- `desc?: string`: A short description
- `category?: string`: A category for your command

### Arguments

The `args` property is an `UsageResolvable[]`, which is explained more on [here](Usages.md#what).

In short, you can supply the arguments of your command and string-commands will parse and validate them for you:

```js
// Assume:
handler.buildArguments = ({ args, ctx }) => [args, ctx];

let myCommand = {
    name: "floor",
    desc: "Floors the number",
    args: ["number"],
    run: (args, ctx) => {
        // args[0] will always be a js number
        // if not, handler event 'invalidUsage' will be emitted
        ctx.reply(`Your floored number is ${Math.floor(args[0])}! :tada:`);
    }
}
```

### Checks

Your commands can also have custom checks. Its recommended to make the checks once and reuse them for commands.

Command Checks are similar to runner functions, but there's a differience.

The function's first argument is the [`ExecutorContext`](./CommandHandler.md#executorcontext) and the rest are [`Runner Args`](./CommandHandler.md#runnerargs), like this: `(execCtx, a, b, c) => {...}`. This is for other packages to be easily imported and used.

**Migrating to 1.2.0:** just add an `_` argument to your checks, its that easy (`function(a,b){}` => `function(_,a,b){}`)

The command checks need to return a `CommandCheckResult`, which is something like this:

- `pass` (boolean) - set to true if check succeeded
- `message` (string) - if it failed, the message explaining why

Example: `{ pass: false, message: "Thou shall not pass" }`

They can also be **asynchronous**

```js
{
  checks: [
    (execCtx) => {
      // Im an useless check! Gonna make it run!
      return { pass: true };
    },

    async (execCtx) => {
      // haha No.
      return {
        pass: false,
        message: "Hardcoded Failiure",
      };
    },
  ];
}
```

For catching when commands fail checks, see [here](./CommandHandler.md#failed-checks)

You can also add other extra properties to the `CommandCheckResult` for more customization:

```js
{
  checks: [
    ({ ctx }) => {

      if(ctx.cool < 5) {
        return {
          pass: false,
          message: "Not cool enough",
          code: "UNCOOL",
          coolness: ctx.cool,
        };
      } else {
        return { pass: true }
      };

    },
  ]
}

handler.on("failedChecks", ({ checks }) => {
  if(checks[0].code == "UNCOOL") {
    // do custom message stuff
  }
})
```

[^ Back to top](#commands)
