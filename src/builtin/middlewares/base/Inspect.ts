import { NOOPMiddleware } from "../../../core";

export type InspectCallback<T> = (ctx: T) => any;

export const Inspect = <T>(fn: InspectCallback<T> = console.log): NOOPMiddleware<T> => ((ctx) => {
    fn(ctx);
    return ctx;
})
