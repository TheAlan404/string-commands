import { MaybePromise } from "../types";
import { ExecutorContext } from "./ExecutorContext";

export default interface Middleware {
    id: string,
    run: (ctx: ExecutorContext, next: (() => void)) => MaybePromise<void>,
    before?: string,
    after?: string,
    requires?: string[],
};