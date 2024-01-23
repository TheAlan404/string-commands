import { Command } from "../Command";
import { BaseContext } from "../Context";
import { Middleware, MiddlewareFactory } from "../Middleware";

export interface CommandResolverCtx extends BaseContext {
    command: Command<BaseContext & CommandResolverCtx>,
}

export const CommandResolver: MiddlewareFactory<{}, CommandResolverCtx> = () => ({
    id: "command-resolver",
    run(ctx) {
        let { handler } = ctx;

        let command = handler.commands.get();

        return {
            ...ctx
        };
    },
});
