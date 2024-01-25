import { createInterface } from "readline";
import { CommandHandler } from "../src";
import { CommandExecutor, CommandResolver, SplitString } from "../src/middlewares";

let handler = new CommandHandler()
    .use(SplitString())
    .use(CommandResolver())
    .use(CommandExecutor());

handler.add({
    name: "help",
    description: "Show a list of commands",
    run({ handler }, []) {
        console.log(`Available commands:`);
        for (let [name, cmd] of handler.commands.entries()) {
            console.log(` - ${name} : ${cmd.description}`);
        }
    },
});

handler.add({
    name: "hello",
    description: "world",
    run({}, []) {
        console.log("world!");
    },
});

const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> ",
})

rl.on("line", async (line) => {
    await handler.run(line.trim());
    rl.prompt();
});

rl.on("close", () => {
    console.log('exiting...');
    process.exit(0);
});

rl.prompt();
