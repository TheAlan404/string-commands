import { BaseContext } from "./Context";
import { MaybePromise } from "./utils";

export type Middleware<T extends BaseContext, U extends T> = (ctx: T) => MaybePromise<U> | MaybePromise<undefined>;

export type MiddlewareLike<T extends BaseContext, U extends T> =
    Middleware<T, U>
    | MiddlewareLike<T, U>[];

export type MiddlewareFactory<Options, T extends BaseContext, U extends T> =
    (options: Options) => Middleware<T, U>;
export type LastMiddlewareReturnType<T extends Middleware<any, any>[]> = T extends [...infer _, infer Last] ? Last extends Middleware<any, infer R> ? R : BaseContext : BaseContext;

export type InputOf<T extends Middleware<any, any>> = T extends Middleware<infer I, any> ? I : never;
export type OutputOf<T extends Middleware<any, any>> = T extends Middleware<any, infer O> ? O : never;
