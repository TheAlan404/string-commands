import { BaseContext } from "./Context";

export interface Middleware<T extends BaseContext, U extends T> {
    id: string,
    run: (ctx: T) => PromiseLike<U>,
}

export type MiddlewareLike<T extends BaseContext, U extends T> =
    Middleware<T, U>
    | MiddlewareLike<T, U>[];

export type MiddlewareFactory<Options, T extends BaseContext, U extends T> =
    (options: Options) => Middleware<T, U>;
