import { BaseContext } from "../Context";
import { MiddlewareFactory } from "../Middleware";

export const ContextStatic = <
    T extends Record<string, any>,
>(obj: T) => ({
    id: "_",
    run: async <B extends BaseContext>(ctx: B): Promise<B & T> => ({
        ...ctx,
        ...obj,
    }),
});
