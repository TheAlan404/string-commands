import { BaseCommand } from "../../../_/Command";
import { BaseContext } from "../../_/Context";
import { Middleware, MiddlewareFactory } from "../../../core/middleware/Middleware";
import { CommandReplierCtx } from "./CommandReplier";
import { CommandResolverCtx } from "./CommandResolver";
import { SplitStringCtx } from "./SplitString";

export const CommandExecutor = () => (async <C extends CommandResolverCtx & BaseContext>(ctx: C): Promise<C> => {
    let { targetCommand, handler } = ctx;
    
    try {
        await targetCommand.run(ctx, []);
    } catch(e) {
        handler.emit("commandError", e, ctx);
        return;
    }

    return ctx;
});
