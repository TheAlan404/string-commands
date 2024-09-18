import { Middleware } from "./Middleware";

export type MiddlewareFactory<Options, T, U extends T> =
    (options: Options) => Middleware<T, U>;

    



