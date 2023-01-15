/// <reference types="node" />

import { EventEmitter } from "node:events";

type ValueOfMap<M> = M extends Map<any, infer V> ? V : never
type KeyOfMap<M> = M extends Map<infer K, any> ? K : never
type ConvertToMap<obj> = Map<keyof obj, obj[keyof obj]>;
type AnyFunction = (...a: any) => any;
type ReturnTypePromise<T extends AnyFunction> = ReturnType<T> extends Promise<infer U> ? U : ReturnType<T>;
type KeyOfAsString<T> = Extract<keyof T, string>;

export as namespace stringcommands;
export as namespace strcmd;

type BaseRunnerArgs = any[];
type BaseUsageCollection = { [type: string]: UsageParser<any, any, any, any> };

type ResolveUsageParser<TUsages extends BaseUsageCollection, V> = V extends UsageParser<any, any, any, any> ? V :
    V extends Usage<any, any, any> ? (V["type"] extends string ? TUsages[V["type"]] : never) :
    V extends string ?
    V extends `${"<" | "[" | ""}${infer NA}${"..." | ""}${">" | "]" | ""}` ?
    NA extends `${infer N}:${infer RT}` ? TUsages[RT] : TUsages[NA]
    : never
    : never;
type _getUsageParserTOutput<TUsage> = TUsage extends UsageParser<any, any, infer TOutput, any> ?
    TOutput : (TUsage extends { parse: (...any) => { parsed: infer T } } ? T : never);

type StringToUsage<V> =
    {
        rest: V extends `${string}...` ? true : false,
        optional: V extends `[${string}]` ? true : false,
        type: V extends `${"<" | "[" | ""}${infer Mid}${">" | "]" | ""}` ?
        Mid extends `${infer Name}:${infer Type}` ?
        Type
        : Mid
        : never,
        name: V extends `${"<" | "[" | ""}${infer Name}:${infer Type}${">" | "]" | ""}` ?
        Name
        : "",
    };

export type Command<
    TName extends string,
    TAliases extends string[] | null,
    TRunnerArgs extends BaseRunnerArgs,
    TUsages extends BaseUsageCollection,
> = {
    name: TName,
    run(...args: TRunnerArgs): Promise<void> | void,

    aliases?: TAliases,
    args?: UsageResolvableList<TUsages>,
    checks: CommandCheck<TRunnerArgs>[],
};

export type CommandCheck<TRunnerArgs> = (...args: TRunnerArgs[]) => Promise<CommandCheckResult>;

export interface CommandCheckPass { pass: true }
export interface CommandCheckFail { pass: false, message: string }

export type CommandCheckResult = CommandCheckPass | CommandCheckFail;

export interface CommandHandlerOptions {
    prefix: string,
    log: typeof console | { log: AnyFunction, info: AnyFunction, error: AnyFunction, } | false,
}

/**
 * The string-commands command handler
 */
export class CommandHandler<
    Opts extends CommandHandlerOptions,

    CustomContext,
    RunnerArgs extends BaseRunnerArgs,

    _commands extends {
        [CName: string]: Command<
            typeof CName,
            any,
            RunnerArgs,
            _usages
        >
    },
    _aliases extends { [CAlias in _commands[keyof _commands]["aliases"][number]as string]: keyof _commands },
    _usages extends {
        [P in {} as string]: UsageParser<
            CustomContext,
            _usages,
            any,
            any
        >
    },
    _middlewares extends CommandHandlerMiddleware<_middlewares>[],

    _execContext extends ExecutorContext<CustomContext, _commands[string], RunnerArgs, _usages>,
> extends EventEmitter {
    constructor(opts?: Opts)

    prefix: Opts["prefix"] | string;
    Commands: ConvertToMap<_commands>;
    Aliases: ConvertToMap<_aliases>;
    middlewares: _middlewares;

    argumentParser: ArgumentParser<CustomContext, _usages>;

    registerCommand(cmd: Command<
        string,
        string[],
        RunnerArgs,
        _usages
    >): this;
    registerCommands(path: string): Promise<this>;

    addCommand(cmd: Command<
        string,
        string[],
        RunnerArgs,
        _usages
    >): this;
    addCommands(path: string): Promise<this>;

    on(event: "invalidUsage", handler: (ctx: _execContext) => void): this;
    on(event: "failedChecks", handler: (ctx: _execContext) => void): this;

    buildArguments(ctx: _execContext): RunnerArgs;

    use(mw: CommandHandlerMiddleware<_middlewares>): this;

    run(input: string, ctx: CustomContext): this;

    prettyPrint(cmd: _commands[string]): string;
}

/**
 * The command executor context, used in various parts of the command handler.
 */
type ExecutorContext<
    CustomContext,
    TCommand extends Command<string, string[], TRunnerArgs, TUsages>,
    TRunnerArgs extends BaseRunnerArgs,
    TUsages extends BaseUsageCollection,
> = {
    /** The raw input string */
    input: string,
    /** The custom context */
    ctx: CustomContext,
    /** Name of the executing command */
    name?: TCommand["name"],
    /** Unparsed arguments (raw) from the input string */
    rawArgs?: string[],
    /** The command's information */
    command?: TCommand,
    /** List of usage (argument parser) errors */
    errors?: UsageError<TUsages[string]>[],
    /** Parsed arguments/usages */
    args?: any[], // TODO: typescript voodoo to make it relationship >:3
    /** Built runner args */
    runArgs?: TRunnerArgs,
    /** List of failed checks */
    checks?: CommandCheckFail[],
    /** An error, if occured while executing the command */
    error?: Error,
};

// Usage System

class ArgumentParser<
    CustomContext,
    _usages extends BaseUsageCollection,
> {
    ArgumentParsers: ConvertToMap<_usages>;

    parseUsages<T extends UsageResolvable<_usages>[]>(text: string,
        commandUsages: T,
        ctx: CustomContext): {
            args: { [I in keyof T]: _getUsageParserTOutput<ResolveUsageParser<_usages, T[I]>> },
            errors: [],
        };
}

export type UsageResolvableList<TUsages extends BaseUsageCollection> = UsageResolvable<TUsages>[];

export type UsageResolvable<TUsages extends BaseUsageCollection> =
    `${`${"<" | ""}${KeyOfAsString<TUsages> | `${string}:${KeyOfAsString<TUsages>}`}${">" | ""}`
    | `[${KeyOfAsString<TUsages> | `${string}:${KeyOfAsString<TUsages>}`}]`
    }${"..." | ""}` | { type: KeyOfAsString<TUsages> };

export interface Usage<
    CustomContext,
    TName extends KeyOfAsString<TUsages>,
    TUsages extends BaseUsageCollection
> extends UsageParser<
    CustomContext,
    TUsages,
    any,
    any
> {
    name: TName,
    type: UsageResolvable<TUsages>,
    optional?: boolean,
}

export interface UsageParser<
    CustomContext,
    TUsages extends BaseUsageCollection,
    TOutput,
    TOpts,
> {
    // The second in this union is for Usage compat.
    type: string | { type: string },
    parse: (ctx: UsageParserContext<
        CustomContext,
        ReturnTypePromise<TUsages[keyof TUsages]["parse"]>,
        TOutput,
        TOpts
    >) => Promise<UsageParserResult<TOutput>>;
    optional?: boolean,
    default?: TOutput | ((ctx: UsageParserContext<
        CustomContext,
        ReturnTypePromise<TUsages[keyof TUsages]["parse"]>,
        TOutput,
        TOpts
    >) => TOutput),
    rest?: boolean,
}

export type UsageParserContext<
    CustomContext,
    TInput,
    TOutput,
    TOpts,
> = {
    arg: TInput;
    name: string;
    opts: TOpts;
    fail(message: string): Extract<UsageParserResult<TOutput>, { fail: true }>;
    context: CustomContext;
    style: {}; // TODO: ArgumentHandlerStylings
}

export interface UsageParserSuccess<TOutput> { fail: false, parsed: TOutput }
export interface UsageParserFail { fail: true, message: string }

export type UsageParserResult<TOutput> = UsageParserSuccess<TOutput> | UsageParserFail;

export type UsageError<
    TUsage extends UsageParser<any, any, any, any>,
> = {
    usage: TUsage,
    message: UsageParserFail["message"],
};

// Middlewares

export type ExecutorStage = "splitString" | "resolveCommand" | "parseUsages" | "checks" | "run";
export type MiddlewareConstraint<
    TMiddlewares extends CommandHandlerMiddleware<TMiddlewares>[],
> = TMiddlewares[number]["id"] | ExecutorStage;

export type CommandHandlerMiddleware<
    TMiddlewares extends CommandHandlerMiddleware<any>[],
> = {
    id?: string,
    run: (ctx: ExecutorContext<any, any, any, any>, next: (() => void)) => void;
    requires?: (TMiddlewares[number]["id"])[],
} & ({
    before?: MiddlewareConstraint<TMiddlewares>,
} | {
    after?: MiddlewareConstraint<TMiddlewares>,
});