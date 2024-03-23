import { BaseCommand } from "../Command";
import { BaseContext } from "../Context";
import { Middleware, MiddlewareFactory } from "../Middleware";
import { CommandReplierCtx } from "./CommandReplier";
import { CommandResolverCtx } from "./CommandResolver";
import { SplitStringCtx } from "./SplitString";

export const CommandExecutor = () => ({
    id: "command-executor",
    async run<C extends CommandResolverCtx & BaseContext>(ctx: C): Promise<C> {
        let { targetCommand, handler } = ctx;
        
        try {
            await targetCommand.run(ctx, []);
        } catch(e) {
            handler.emit("commandError", e, ctx);
            return;
        }

        return ctx;
    },
});
