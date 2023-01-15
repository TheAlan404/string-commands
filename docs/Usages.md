[🡐 Back to README.md](../README.md#documentation)
[🡐 Back to CommandHandler.md](CommandHandler.md)
[🡐 Back to Commands.md](Commands.md)

# Usages

## What?

An **usage** is an argument of a command.
Usages have **types**, which point to an **usage parser** on the Argument Parser.
Usages also can have optional **names** that are used for prettifying (for example, in a help command or invalid usage error message)

***TODO: Write this section again. It's old and bad.***

```js
{
    name: "print",
    args: [{
        type: "text",
        name: "myText",
        rest: true,
    }]
}
```

Usages can be a string that points to an already existing **usage parser**:

```js
args: ["text"]
```

And you can use a colon to give it a name:

```js
args: ["a:number"]
// is the same as
args: [{ type: "number", name: "a" }]
```

You can also surround them with `<>` or `[]`, the `[]` braces mark it as `optional: true`.

It's possible to also set `rest: true` by adding a `...` at the end like so:

```js
args: ["prompt:text..."]
```

## Special Parser Options

**`rest` (boolean)** - if set to true, consumes the rest of the input with it
**`optional` (boolean)** - if set to true, this argument is considered optional
**`name` (string)** - define the name of the argument

## Native Parsers

### ArgumentParser: text

Options:

- `min` (number) - Minimum characters
- `max` (number) - Maximum characters

### ArgumentParser: number

Options:

- `min` (number)
- `max` (number)
- `isInt` (boolean = false) - If the number should be a whole number/no decimals/integer

## Writing Custom Argument Parsers

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
};
```

Usage parsers can easily inherit other parsers using `type`. ArgumentParser automatically parses the lowest type and builds up from there. This means if you have an usage parser with type set to `"number"`, `ctx.arg` will be a number instead of a string.

[^ Back to top](#usages)
