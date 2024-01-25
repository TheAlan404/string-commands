import { BaseContext } from "../Context";
import { MiddlewareFactory } from "../Middleware";

export interface ReplyData extends Record<string, any> {
    type: string,
}

export interface CommandReplierCtx<T extends ReplyData> {
    reply: (data: T, ctx: BaseContext & CommandReplierCtx<T>) => PromiseLike<void>,
}
