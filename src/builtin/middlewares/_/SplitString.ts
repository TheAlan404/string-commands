import { BaseCommand } from "../../../_/Command";
import { BaseContext } from "../../_/Context";
import { Middleware, MiddlewareFactory } from "../../../core/middleware/Middleware";

export interface SplitStringCtx {
    commandName: string,
    commandArguments: string,
}

export const SplitString = () => (async <T extends BaseContext>(ctx: T): Promise<T & SplitStringCtx> => {
    let { input } = ctx;

    let [commandName, ...args] = input.split(" ");

    return {
        ...ctx,
        commandName,
        commandArguments: args.join(" "),
    };
});
