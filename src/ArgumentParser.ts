import InternalError from "./classes/InternalError";
import StringReader from "./classes/StringReader";
import { Argument, ArgumentObject } from "./interfaces/Argument";
import Command, { CommandArgs } from "./interfaces/Command";
import { ExecutorContext } from "./interfaces/ExecutorContext";
import { Usage, ReaderContext } from "./interfaces/Usage";
import { TextUsage } from "./usages";

interface ArgumentParserOptions {
    noBuiltins?: boolean,
};

class ArgumentParser {
    usages: Map<string, Usage<any, any>> = new Map();

    constructor(opts?: ArgumentParserOptions & { usages?: Record<string, Usage<any, any>> }) {
        if(!opts) opts = {};
        if(!opts.noBuiltins) {
            this.usages.set("text", TextUsage);
            this.usages.set("string", TextUsage);
        };
    };

    resolveArgumentFromString(arg: string): ArgumentObject {
        let rest = false;
        let optional = false;
        if (arg.endsWith("...")) {
            rest = true;
            arg = arg.slice(0, -3);
        }

        let last = arg[arg.length - 1];
        if (arg[0] == "<") {
            if (last !== ">")
                throw new Error("Unclosed required argument identifier");
            arg = arg.slice(1).slice(0, -1);
        } else if (arg[0] == "[") {
            if (last !== "]")
                throw new Error("Unclosed optional argument identifier");
            optional = true;
            arg = arg.slice(1).slice(0, -1);
        }

        let sp = arg.split(":");
        let type = sp.length === 2 ? sp[1] : sp[0];
        let name = sp.length === 2 ? sp[0] : null;

        if (!this.usages.has(type)) {
            throw new Error(
                `Can't resolve argument from string because Usage '${type}' doesn't exist!`,
            );
        };

        return { type, name, rest };
    }

    getUsage(id: string) {
        return this.usages.get(id);
    };

    async parseArguments(ctx: ExecutorContext & {
        rawArgs: string,
        command: Command & CommandArgs,
    }) {
        let reader: StringReader = new StringReader(ctx.rawArgs);

        ctx.reader = reader;

        let args = [];

        for (let arg of ctx.command.args) {
            // cleanup
            ctx.value = null;
            ctx.options = {};

            await this.parseArgument(ctx, arg);

            args.push(ctx.value);
        };

        
    };

    getOptions(arg: ArgumentObject) {
        let { parse, read, type, ...options } = arg;
        return options;
    }

    async parseArgument<T>(ctx: ExecutorContext, arg: Argument): Promise<T> {
        if (typeof arg == "string") {
            return await this.parseArgument(ctx, this.resolveArgumentFromString(arg));
        }

        ctx.options = {
            ...ctx.options,
            ...this.getOptions(arg),
        };

        if(arg.type && arg.type !== "native") {
            let child = this.getUsage(arg.type);

            if(!child) throw new InternalError(ctx, `Usage '${arg.type}' doesn't exist`);

            ctx.options = this.getOptions({
                ...ctx.options,
                ...child,
            });

            await this.parseArgument(ctx, child);
        };

        if(ctx.value === null && arg.read) {
            ctx.value = arg.read(ctx);
        };

        if(arg.parse) {
            ctx.value = await arg.parse(ctx);
        };

        return ctx.value;

        //let usage = this.getUsage(arg.type!);
        //if(!usage) throw new Error("Can't find usage '" + arg.type + "'!");

        //return await usage.parse(ctx as ReaderContext<any>);
    };
};

export {
    ArgumentParser,
};