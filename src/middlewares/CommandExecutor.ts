import { Command } from "../Command";
import { BaseContext } from "../Context";
import { Middleware, MiddlewareFactory } from "../Middleware";
import { CommandReplierCtx } from "./CommandReplier";
import { CommandResolverCtx } from "./CommandResolver";
import { SplitStringCtx } from "./SplitString";

export const CommandExecutor = () => ({
    id: "command-executor",
    async run<T extends CommandResolverCtx>(ctx: T): Promise<T> {
        let { command } = ctx;
        
        // @ts-ignore
        command.run(ctx, []);

        return ctx;
    },
});
