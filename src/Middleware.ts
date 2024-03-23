import { BaseContext } from "./Context";

export interface Middleware<T extends BaseContext, U extends T> {
    id: string,
    run: (ctx: T) => Promise<U> | U,
}

export type MiddlewareLike<T extends BaseContext, U extends T> =
    Middleware<T, U>
    | MiddlewareLike<T, U>[];

export type MiddlewareFactory<Options, T extends BaseContext, U extends T> =
    (options: Options) => Middleware<T, U>;
export type LastMiddlewareReturnType<T extends Middleware<any, any>[]> = T extends [...infer _, infer Last] ? Last extends Middleware<any, infer R> ? R : BaseContext : BaseContext;

export type InputOf<T extends Middleware<any, any>> = T extends Middleware<infer I, any> ? I : never;
export type OutputOf<T extends Middleware<any, any>> = T extends Middleware<any, infer O> ? O : never;
