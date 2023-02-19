/// <reference types="node" />

import { EventEmitter } from "node:events";

export as namespace stringcommands;
export as namespace strcmd;

type BaseRunnerArgs = any[];
type BaseCustomContext = {};

type Command<
    TRunnerArgs extends BaseRunnerArgs,
> = {
    name: string,
    run(...args: TRunnerArgs): Promise<void> | void,

    aliases?: string[],
    args?: UsageResolvableList,
    checks: CommandCheck<BasicExecutorContext, TRunnerArgs>[],
};

type CommandCheck<TExecutorContext, TRunnerArgs extends BaseRunnerArgs> = (execCtx: TExecutorContext, ...args: TRunnerArgs) => Promise<CommandCheckResult>;

interface CommandCheckPass { pass: true }
interface CommandCheckFail { pass: false, message: string }

type CommandCheckResult = CommandCheckPass | CommandCheckFail;

interface CommandHandlerOptions {
    prefix: string,
    log: typeof console | { log: AnyFunction, info: AnyFunction, error: AnyFunction, } | false,
}

/**
 * The string-commands command handler
 */
export class CommandHandler<
    Opts extends CommandHandlerOptions,

    CustomContext extends BaseCustomContext,
    RunnerArgs extends BaseRunnerArgs,

    _execContext extends ExecutorContext<CustomContext, RunnerArgs>,
> extends EventEmitter {
    constructor(opts?: Opts)

    prefix: Opts["prefix"] | string;
    Commands: Map<string, Command<RunnerArgs>>;
    Aliases: Map<string, string>;
    middlewares: CommandHandlerMiddleware[];

    argumentParser: ArgumentParser<CustomContext>;

    registerCommand(cmd: Command<RunnerArgs>): this;
    registerCommands(path: string): Promise<this>;

    addCommand(cmd: Command<RunnerArgs>): this;
    addCommands(path: string): Promise<this>;

    on(event: "invalidUsage", handler: (ctx: _execContext) => void): this;
    on(event: "failedChecks", handler: (ctx: _execContext) => void): this;

    buildArguments(ctx: _execContext): RunnerArgs;

    use(mw: CommandHandlerMiddleware): this;

    run(input: string, ctx: CustomContext): this;

    prettyPrint(cmd: Command<RunnerArgs>): string;
}

/**
 * The command executor context, used in various parts of the command handler.
 */
type ExecutorContext<
    CustomContext,
    TRunnerArgs extends BaseRunnerArgs,
> = {
    /** The raw input string */
    input: string,
    /** The custom context */
    ctx: CustomContext,
    /** Name of the executing command */
    name?: Command<TRunnerArgs>["name"],
    /** Unparsed arguments (raw) from the input string */
    rawArgs?: string[],
    /** The command's information */
    command?: Command<TRunnerArgs>,
    /** List of usage (argument parser) errors */
    errors?: UsageError[],
    /** Parsed arguments/usages */
    args?: any[], // TODO: typescript voodoo to make it relationship >:3
    /** Built runner args */
    runArgs?: TRunnerArgs,
    /** List of failed checks */
    checks?: CommandCheckFail[],
    /** An error, if occured while executing the command */
    error?: Error,
};

type BasicExecutorContext = ExecutorContext<any, any>;

// Usage System

export class ArgumentParser<CustomContext> {
    ArgumentParsers: Map<string, UsageParser<any, any>>;

    parseUsages<T extends UsageResolvable[]>(text: string,
        commandUsages: T,
        ctx: CustomContext): {
            args: any[],
            errors: UsageParserFail[],
        };
}

type UsageResolvableList = UsageResolvable[];

type UsageResolvable = string | { type: UsageResolvable };

interface Usage extends UsageParser<any, any> {
    name: string,
}

interface UsageParser<
    TInput,
    TOutput,
> {
    // The second in this union is for Usage compat.
    type: UsageResolvable,
    parse: (ctx: UsageParserContext<
        TInput
    >) => Promise<UsageParserResult<TOutput>>;
    optional?: boolean,
    default?: TOutput | ((ctx: UsageParserContext<
        TInput
    >) => Promise<TOutput>),
    rest?: boolean,
}

type UsageParserContext<
    TInput,
> = {
    arg: TInput;
    name: string;
    opts: {};
    fail(message: string): UsageParserFail;
    context: BaseCustomContext;
    style: {}; // TODO: ArgumentHandlerStylings
};

interface UsageParserSuccess<TOutput> { fail: false, parsed: TOutput }
interface UsageParserFail { fail: true, message: string }

type UsageParserResult<TOutput> = UsageParserSuccess<TOutput> | UsageParserFail;

interface UsageError extends UsageParserFail {
    usage: UsageParser<any, any>,
}

// Middlewares

type ExecutorStage = "splitString" | "resolveCommand" | "parseUsages" | "checks" | "run";
type MiddlewareConstraint<
    TMiddlewares extends CommandHandlerMiddleware<TMiddlewares>[],
> = TMiddlewares[number]["id"] | ExecutorStage;

export type CommandHandlerMiddleware = {
    id?: string,
    run: (ctx: ExecutorContext<any, any, any, any>, next: (() => void)) => void;
    requires?: ExecutorStage[],
} & ({
    before?: ExecutorStage,
} | {
    after?: ExecutorStage,
});