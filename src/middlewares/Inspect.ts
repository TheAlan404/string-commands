import { Middleware } from "../Middleware";

export const Inspect = <T>(fn: (ctx: T) => void = console.log): Middleware<T, T> => ((ctx) => {
    fn(ctx);
    return ctx;
})
