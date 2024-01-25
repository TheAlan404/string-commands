import { CommandHandler } from "./CommandHandler";
import { CommandExecutor } from "./middlewares/CommandExecutor";
import { CommandResolver } from "./middlewares/CommandResolver";
import { ContextStatic } from "./middlewares/ContextStatic";
import { SplitString } from "./middlewares/SplitString";

let handler = new CommandHandler()
    .use(SplitString())
    .use(CommandResolver())
    .use(ContextStatic({ a: 1 }))
    .use(CommandExecutor());

handler.add({
    name: "owo",
    async run(ctx, args) {
        console.log("uwu");
    },
})

handler.run("nya");
