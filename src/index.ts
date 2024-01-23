import { CommandHandler } from "./CommandHandler";
import { CommandReplier } from "./middlewares/CommandReplier";
import { CommandResolver } from "./middlewares/CommandResolver";

let handler = new CommandHandler();
handler.use(CommandReplier({
    reply(data, ctx) {
        console.log(data.type);
    },
}));
handler.use(CommandResolver());

handler.add({
    name: "owo",
    run(ctx, args) {
        console.log("uwu");
    },
})

handler.run("owo", {});
