import { CommandHandler } from "./CommandHandler";
import { CommandExecutor } from "./middlewares/CommandExecutor";
import { CommandResolver } from "./middlewares/CommandResolver";
import { ContextStatic } from "./middlewares/ContextStatic";
import { SplitString } from "./middlewares/SplitString";

let handler = new CommandHandler()
    .use(SplitString())
    .use({
        id: "_",
        async run(ctx) {
            return {
                ...ctx,
            }
        },
    })
    .use(CommandResolver())
    .use(CommandExecutor())

handler.add({
    name: "owo",
    async run(ctx, args) {
        console.log("uwu");
    },
})

handler.run("nya");
