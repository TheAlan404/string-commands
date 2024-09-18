import { AnyMiddleware, Middleware } from "./Middleware";
import { MiddlewareFactory } from "./MiddlewareFactory";

type Concat<T> = T extends [infer A] ? A : (
    T extends [infer A, ...infer Rest] ? A & Concat<Rest> : never
);

export type MiddlewareOutput<M extends AnyMiddleware> = M extends Middleware<any, infer O> ? O : never;
export type MiddlewareInput<M extends AnyMiddleware> = M extends Middleware<infer I, any> ? I : never;

export type MiddlewareOutputs<Types extends AnyMiddleware[]> = {
    [Index in keyof Types]: MiddlewareOutput<Types[Index]>
};

export type MiddlewareInputs<Types extends AnyMiddleware[]> = {
    [Index in keyof Types]: MiddlewareInput<Types[Index]>
};

export type MiddlewareResolvable = AnyMiddleware | MiddlewareFactory<any, any, any>;
export type ResolveMiddleware<T> = T extends MiddlewareFactory<any, infer I, infer O> ? Middleware<I, O> : (
    T extends Middleware<infer I, infer O> ? Middleware<I, O> : T
);
export type ResolveMiddlewares<T extends MiddlewareResolvable[]> = {
    [Index in keyof T]: ResolveMiddleware<T[Index]>;
};

export type ExtractOutputs<Types extends MiddlewareResolvable[]> = Concat<MiddlewareOutputs<ResolveMiddlewares<Types>>>
export type ExtractInputs<Types extends MiddlewareResolvable[]> = Concat<MiddlewareInputs<ResolveMiddlewares<Types>>>
