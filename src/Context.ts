import { CommandHandler } from "./CommandHandler";

export interface BaseContext {
    handler: typeof this extends CommandHandler<infer C, infer M> ? CommandHandler<C, M> : never;
    input: string;
}
