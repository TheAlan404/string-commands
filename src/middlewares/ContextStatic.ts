import { BaseContext } from "../Context";
import { MiddlewareFactory } from "../Middleware";

export const ContextStatic = <
    T extends Record<string, any>,
    B extends BaseContext
>(obj: T) => ({
    id: "_",
    run: async (ctx: B): Promise<B & T> => {
        return ({
            ...ctx,
            ...obj,
        })
    },
});
