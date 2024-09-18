import { PromiseOr } from "simplytyped"

export type Middleware<T, U> = ((ctx: T) => PromiseOr<U | void>) & { displayName?: string };
export type AnyMiddleware = Middleware<any, any>;

export const createMiddleware = <T, U>(mw: Middleware<T, U>, displayName?: string) => {
    mw.displayName = displayName;
    return mw;
};

export type NOOPMiddleware<T> = Middleware<T, T>;
export const NOOPMiddleware: NOOPMiddleware<unknown> = createMiddleware(<T>(x: T) => x, "NOOPMiddleware");
