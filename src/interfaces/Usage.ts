import StringReader from "../classes/StringReader";
import { MaybePromise } from "../types";
import { ExecutorContextCommand } from "./ExecutorContext";

interface UsageContext<O> extends ExecutorContextCommand {
    argumentName: string,
    reader: StringReader,
    options: O,
}

export default interface Usage<T, O> {
    type?: string,
    parse(ctx: UsageContext<O>): MaybePromise<T>,
}