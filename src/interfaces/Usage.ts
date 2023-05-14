import StringReader from "../classes/StringReader";
import { MaybePromise } from "../types";
import { ExecutorContext } from "./ExecutorContext";

export interface ReaderContext<O> extends ExecutorContext {
    reader: StringReader,
    options: O,
    throw: (code: string) => never,
}

export interface ValueContext<T, O> extends ReaderContext<O> {
    value: T,
}

// ? ...?? wha
export type ParserUsage<In, Out, O> = {
    parse?(ctx: ValueContext<In, O>): MaybePromise<Out>,
} & Usage<Out, O>;

export interface Usage<T, O> {
    type?: string,
    read?(ctx: ReaderContext<O>): MaybePromise<T>,
    parse?<TValue>(ctx: ValueContext<TValue, O>): MaybePromise<T>,
}