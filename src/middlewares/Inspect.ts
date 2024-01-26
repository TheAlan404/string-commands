export const Inspect = (fn: <T>(ctx: T) => void = console.log) => ({
    id: "inspect_" + Math.floor(Math.random() * 1000),
    run: (ctx) => {
        fn(ctx);
        return ctx;
    }
})
