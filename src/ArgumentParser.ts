import StringReader from "./classes/StringReader";
import { Argument, ArgumentObject } from "./interfaces/Argument";
import { ExecutorContext } from "./interfaces/ExecutorContext";
import Usage from "./interfaces/Usage";

interface ArgumentParserPayload {
    string: string,
    args: Argument[],
};

class ArgumentParser {
    usages: Map<string, Usage<any>> = new Map();

    constructor() {

    };

    resolveArgument(arg: Argument): ArgumentObject {
        if(typeof arg == "string") {
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
        };

        return arg;
    }

    getUsage(id: string) {
        return this.usages.get(id);
    };

    parseArguments(input: string, args: Argument[], ctx: ExecutorContext) {
        let reader: StringReader = new StringReader(input);

        for(let arg of args) {
            let opts = this.resolveArgument(arg);
            this.parseArgument(opts, ctx);
        }
    };

    async parseArgument(arg: ArgumentObject, ctx: ExecutorContext) {
        let usage = this.getUsage(arg.type!);
        if(!usage) throw new Error("Can't find usage '" + arg.type + "'!");

        return await usage.parse(ctx);
    };
};

export {
    ArgumentParser,
    ArgumentParserPayload,
};