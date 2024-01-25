import { Command } from "../Command";
import { BaseContext } from "../Context";
import { Middleware, MiddlewareFactory } from "../Middleware";

export interface SplitStringCtx {
    commandName: string,
    commandArguments: string,
}

export const SplitString= () => ({
    id: "split-string",
    async run<T extends BaseContext>(ctx: T): Promise<T & SplitStringCtx> {
        let { input } = ctx;

        let [commandName, ...args] = input.split(" ");

        return {
            ...ctx,
            commandName,
            commandArguments: args.join(" "),
        };
    },
});
