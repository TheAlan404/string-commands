import { CommandHandler } from "../CommandHandler";
import StringReader from "../classes/StringReader";
import Command from "./Command";

export type BaseExecutorContext = {
    handler: CommandHandler,
    rawInput: string,
    //input: string,
    //ctx: object,
    [others: string]: any;
};

type ExecutorContextCommand = {
    commandName: string,
    command: Command,
};

export type ExecutorContext = BaseExecutorContext & Partial<ExecutorContextCommand>;