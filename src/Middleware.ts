import { Prev, PromiseOr } from "simplytyped"

export const NOOPMiddleware = (<T>(x: T) => x);

export type Middleware<T, U extends T> = ((ctx: T) => PromiseOr<U | undefined>) & { displayName?: string };

export type MiddlewareFactory<Options, T, U extends T> =
    (options: Options) => Middleware<T, U>;

export type AnyMiddleware = Middleware<any, any>;

type ParseInt<T> =
    T extends any
    ? (T extends `${infer Digit extends number}`
        ? Digit
        : never)
    : never

export type MiddlewareList<Input, List extends any[]> = {
    [Index in keyof List]: (
        Middleware<
            Index extends "0" ? (
                Input
            ) : (
                List[Prev<ParseInt<Index>>]
            ),
            List[Index]
        >
    )
}

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
    T extends Middleware<infer I, infer O> ? Middleware<I, O> : never
);
export type ResolveMiddlewares<T extends MiddlewareResolvable[]> = {
    [Index in keyof T]: ResolveMiddleware<T[Index]>;
};

export type Requires<Types extends MiddlewareResolvable[]> = Concat<MiddlewareOutputs<ResolveMiddlewares<Types>>>





type A = { a: number }
type B = { b: number }
type C = { c: string } & B


type _A = Requires<[
    Middleware<B, B>,
]>


