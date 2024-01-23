import { Command } from "../Command";
import { BaseContext } from "../Context";
import { Middleware, MiddlewareFactory } from "../Middleware";

export interface SplitStringCtx extends BaseContext {
    commandName: string,
    commandArguments: string,
}

export const SplitString: MiddlewareFactory<{}, SplitStringCtx> = () => ({
    id: "split-string",
    run(ctx) {
        let { input } = ctx;

        let command = handler.commands.get();

        return {
            ...ctx
        };
    },
});
