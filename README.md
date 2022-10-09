# string-commands

The command handler and argument parser for anything.

### Features
- Recursive folder importing
- Configurable message stylings
- Command checks (requirements)
- Custom Command Arguments Parser
- Custom command run function arguments builder

### Example

For the best example please see [consoleExample.js](/examples/consoleExample.js)

```js
import { CommandHandler } from "string-commands";

let handler = new CommandHandler({
    prefix: "!",
});

handler.registerCommand({
    name: "count",
    desc: "Count how many characters are in input",
    args: [{
        type: "text",
        rest: true,
    }],
    run: async (ctx, args) => {
        console.log(`Hello ${ctx.username}, you invoked ${this.name} and ` +
        `your input '${args[0]}' has ${args[0].length} characters!`);
    },
});

handler.run("!count hello world", { username: "voltrex" });
// Hello voltrex, you invoked count and your input 'hello world' has 11 characters!
```

### Exporting Commands

In an ES6 module, you can use `export default` like so:
```js
export default {
    name: "ping",
    run: async () => {},
};
```

If you are using CommonJS you can just use `module.exports`:
```js
module.exports = {
    name: "ping",
    run: async () => {},
};
```

### Importing Commands

todo: write documentation for this (its implemented already)