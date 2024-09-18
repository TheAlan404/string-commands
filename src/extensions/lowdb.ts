import { Low } from "lowdb";
import { BaseContext } from "../_/Context";

export interface LowDBCtx<T> {
    db: Low<T>,
}

export const LowDBExtension = <T>(low: Low<T>) => {
    low.read();

    return async <C extends BaseContext>(ctx: C): Promise<C & LowDBCtx<T>> => ({
        ...ctx,
        db: low,
    });
};

export const LowDBSave = <T>() => (async <C extends LowDBCtx<T>>(ctx: C): Promise<C> => {
    await ctx.db.write();
    return ctx;
})
