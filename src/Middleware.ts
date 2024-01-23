import { BaseContext } from "./Context";

export interface Middleware<Context extends BaseContext> {
    id: string,
    run: (ctx: Context) => PromiseLike<Context>,
}

export type MiddlewareLike = Middleware;

export type MiddlewareFactory<Options, Context> = (options: Options) => Middleware<Context>;
