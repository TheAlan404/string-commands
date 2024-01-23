import { CommandHandler } from "./CommandHandler";

export interface BaseContext {
    handler: CommandHandler<typeof this>;
    input: string;
}
