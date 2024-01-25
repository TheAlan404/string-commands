import { Command } from "../Command";
import { BaseContext } from "../Context";
import { Middleware, MiddlewareFactory } from "../Middleware";

export interface SplitStringCtx extends BaseContext {
    commandName: string,
    commandArguments: string,
}

export const SplitString: MiddlewareFactory<void, BaseContext, SplitStringCtx> = () => ({
    id: "split-string",
    async run(ctx) {
        let { input } = ctx;

        let [commandName, ...args] = input.split(" ");

        return {
            ...ctx,
            commandName,
            commandArguments: args.join(" "),
        };
    },
});
