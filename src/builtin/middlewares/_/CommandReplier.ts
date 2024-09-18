import { BaseContext } from "../../_/Context";
import { MiddlewareFactory } from "../../../core/middleware/Middleware";

export interface ReplyData extends Record<string, any> {
    type: string,
}

export interface CommandReplierCtx<T extends ReplyData> {
    reply?: (data: T, ctx: BaseContext & CommandReplierCtx<T>) => PromiseLike<void>,
}
