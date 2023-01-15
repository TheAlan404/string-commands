[🡐 Back to README.md](../README.md#documentation)
[🡐 Back to CommandHandler.md](CommandHandler.md)

# Middlewares

With middlewares, you can extend your command handler even further.

## Example

Let's say I want to add a middleware that adds user info to the Custom Context.

One way I could do this is like so:

```js
handler.run(input, {
    ...etcetc,
    userdata: fetchFromDatabase(),
});
```

But that's very inefficient because it will fetch from the database on every input.

That's where middlewares come in:

```js
handler.use({
    id: "userinfo",
    before: "run",
    run(execCtx, next) {
        execCtx.ctx.userdata = fetchFromDatabase();
        next();
    }
});
```

The handler will now run this middleware **before** the `run` stage.

## Stages

The command handler has 5 "stages":

- `splitString`: User input is splitted for next stage
  - ``
- `resolveCommand`: The command is resolved from the input
- `parseUsages`: The [usages](Usages.md#what) of the command are parsed, and runArgs are built
- `checks`: The stage where [checks](Commands.md#checks) get run.
- `run`: The final stage. The command gets run here.

You can think of these stages as middlewares too.

## Middleware Definition

A middleware is an object with these properties:

- `id: string`: The identifier for the middleware
- `before?: string`: If specified, this middleware will be executed before the specified one.
- `after?: string`: If specified, this middleware will be executed after the specified one.
- `requires?: string[]`: If specified, the middleware will require all of the supplied ones to execute before itself.
- `run: (execCtx, next) => void`:
  - The function of the middleware.
  - `execCtx` is the [`ExecutorContext`](CommandHandler.md#executorcontext)
  - `next` is a function that, when called, will continue running the middlewares.

[^ Back to top](#middlewares)
