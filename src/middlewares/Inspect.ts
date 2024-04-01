export const Inspect = (fn: <T>(ctx: T) => void = console.log) => ((ctx) => {
    fn(ctx);
    return ctx;
})
