import { BaseCommand } from "../Command";
import { BaseContext } from "../Context";
import { Middleware, MiddlewareFactory } from "../Middleware";
import { CommandReplierCtx } from "./CommandReplier";
import { SplitStringCtx } from "./SplitString";

export type ReplyCommandNotFound = {
    type: "commandNotFound",
    commandName: string,
};

export interface CommandResolverCtx {
    rootCommand: BaseCommand<any>,
    targetCommand: BaseCommand<any>,
}

export const CommandResolver = () => ({
    id: "command-resolver",
    async run<T extends (SplitStringCtx & CommandReplierCtx<ReplyCommandNotFound> & BaseContext)>(ctx: T): Promise<T & CommandResolverCtx> {
        let { handler, commandName, reply } = ctx;

        if(!handler.commands.has(commandName)) {
            reply?.({
                type: "commandNotFound",
                commandName,
            }, ctx);
            return;
        }
        
        let rootCommand = handler.commands.get(commandName);

        return {
            ...ctx,
            rootCommand,
            // TODO: resolve subcommands
            targetCommand: rootCommand,
        };
    },
});
