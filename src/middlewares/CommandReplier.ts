import { BaseContext } from "../Context";
import { MiddlewareFactory } from "../Middleware";

export interface ReplyData extends Record<string, any> {
    type: string,
}

export interface CommandReplierCtx<T extends ReplyData> extends BaseContext {
    reply: (data: T, ctx: BaseContext & CommandReplierCtx<T>) => PromiseLike<void>,
}

export interface CommandReplierOptions<T extends ReplyData> {
    reply: (data: T, ctx: BaseContext & CommandReplierCtx<T>) => PromiseLike<void>,
}

export const CommandReplier: MiddlewareFactory<CommandReplierOptions<T>, CommandReplierCtx<T>> = <T extends ReplyData>({
    reply,
}) => {
    return {
        id: "command-replier",
        run(ctx) {
            return {
                ...ctx,
                reply,
            };
        },
    }
}
