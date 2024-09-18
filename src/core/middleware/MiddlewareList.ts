import { Prev } from "simplytyped"
import { Middleware } from "./Middleware"

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
