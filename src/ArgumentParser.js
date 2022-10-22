import splitargs from 'splitargs';

// The Usage System

/**
 * @typedef {string|Usage|UsageParser} UsageResolvable
 */

/**
 * @typedef {UsageParser} Usage
 * @prop {string} type
 * @prop {string} name - Name of this argument
 * @prop {boolean} [optional] - True if optional
 * @prop {*} [default] - default value if optional
 */

/**
 * Definition for an Argument Parser
 * @typedef {Object} UsageParser
 * @prop {string|"native"} type - used for inheritance
 * @prop {string} name - name of the argument (shouldn't be given in UsageParser definitions)
 * @prop {boolean} [optional] - True if optional by default
 * @prop {*} [default] - default-default value if optional
 * @prop {boolean} [rest] - set to true to capture the rest of the input
 * @prop {UsageParserCallback} parse - the parse function
 */

/**
 * Parser function of UsageParser
 * @callback UsageParserCallback
 * @async
 * @param {UsageParserContext} ctx
 * @returns {UsageParserResult}
 */

/**
 * Argument of UsageParserCallback
 * @typedef {Object} UsageParserContext
 * @prop {string|any} arg - Value of the argument
 * @prop {string} name - Name of the argument
 * @prop {Object} opts
 * @prop {ArgumentHandlerStylings} style
 */

/**
 * Return type of UsageParserCallback
 * @typedef {Object} UsageParserResult
 * @prop {boolean} fail - True if error
 * @prop {string} message - Error message
 * @prop {any} parsed - Parsed value
 */

const fail = (m) => ({ fail: true, message: m });

/**
 * A collection of native/hardcoded argument parsers
 * @type {[string, UsageParser][]}
 */
const NativeUsages = Object.entries({
	text: {
		type: 'native',
		async parse(ctx) {
			if (ctx.opts.max !== undefined && ctx.arg.length > ctx.opts.max) {
				return fail(`${ctx.style.arg(ctx.name)} cannot be longer than ${ctx.style.arg(opts.max)} characters!`);
			}

			if (ctx.opts.min !== undefined && ctx.arg.length <= ctx.opts.min) {
				return fail(`${ctx.style.arg(ctx.name)} cannot be shorter than ${ctx.style.arg(ctx.opts.min)} characters!`);
			}

			return { parsed: ctx.arg };
		}
	},

	number: {
		type: 'native',
		async parse(ctx) {
			let arg = Number(ctx.arg);

			if (isNaN(arg)) {
				return fail(`${ctx.style.arg(ctx.name)} must be a number!`);
			}

			if (ctx.opts.isInt && arg % 1 !== 0) {
				return fail(`${ctx.style.arg(ctx.name)} must be a whole number!`);
			}

			if (ctx.opts.max !== undefined && arg > ctx.opts.max) {
				return fail(`${ctx.style.arg(ctx.name)} cannot be greater than ${ctx.style.arg(ctx.opts.max)}!`);
			}

			if (ctx.opts.min !== undefined && arg > ctx.opts.min) {
				return fail(`${ctx.style.arg(ctx.name)} cannot be smaller than ${ctx.style.arg(ctx.opts.min)} characters!`);
			}

			return { parsed: arg };
		}
	},
});

/**
 * The stylings object for ArgumentHandler.
 * @typedef {Object<string, function(string):string>} ArgumentHandlerStylings
 * @prop {function(string):string} argument - Styling for argument names
 */

/** @type {ArgumentHandlerStylings} */
const defaultStylings = {
    arg: (x) => x,
};


class ArgumentParser {
	constructor(opts = {}) {
		this.ArgumentParsers = new Map(NativeUsages);
        	this.styling = Object.assign(defaultStylings, opts.styling || {});
	}
	
	/**
	 * Registers an usage
	 * @param {string} id Usage Name
	 * @param {UsageParser} usage The usage to register
	 */
	registerUsage(id, usage) {
		this.ArgumentParsers.set(id, usage);
	}

	/**
	 * Resolves an Usage Parser
	 * @param {UsageResolvable} parser 
	 * @returns {UsageParser}
	 */
	resolveUsageParser(parser) {
		if(typeof parser == "string") {
			let rest = false;
			let optional = false;
			if(parser.endsWith("...")) {
				rest = true;
				parser = parser.slice(0, -3);
			};

			let last = parser[parser.length - 1];
			if(parser[0] == "<") {
				if(last !== ">") throw new Error("Unclosed required argument identifier");
				parser = parser.slice(1).slice(0, -1);
			} else if(parser[0] == "[") {
				if(last !== "]") throw new Error("Unclosed optional argument identifier");
				optional = true;
				parser = parser.slice(1).slice(0, -1);
			};

			let sp = parser.split(":");
			let type = sp.length === 2 ? sp[1] : sp[0];
			let name = sp.length === 2 ? sp[0] : null;
			parser = this.ArgumentParsers.get(type);
			if(!parser) {
				return;
			};
			if(name) parser.name = name;
			if(rest) parser.rest = rest;
		};

		return parser;
	};

	/**
	 * Renders usages into a string
	 * @param {UsageResolvable[]} usages - Array of usages
	 * @returns {string}
	 */
	usagesToString(usages = []) {
		return usages.map(this.usageToString).join(" ");
	}

	/**
	 * Renders an usage into a string
	 * @param {UsageResolvable} usage Usage to turn into string
	 * @returns {string}
	 */
	usageToString(usage = "text") {
		usage = this.resolveUsageParser(usage);

		let braceOpen = usage.optional ? "[" : "<";
		let braceClose = braceOpen;

		let usageTypeName = usage.desc;

		return braceOpen + usage.name + (usageTypeName ? (": " + usageTypeName) : "") + braceClose;
	}

	/**
	 * 
	 * @param {string} text - text to parse
	 * @param {UsageResolvable[]} _usages 
	 */
	async parseUsages(text = "", _usages = []) {
		let rawArgs = splitargs(text);

		let usages = _usages.map(this.resolveUsageParser);

		let errors = [];
		let finalArgs = [];

		// iterates over usages and parses them
		// adds to errors if it fails
		// adds to finalArgs if succeeds
		for(let i = 0; i < usages.length; i++) {
			let rawArg = rawArgs[i];
			let currentUsage = usages[i];

			if(currentUsage.rest) {
				rawArg = rawArgs.slice(i).join(" ");
			};

			if(!rawArg.trim() && !currentUsage.optional) {
				errors.push({
					usage: currentUsage,
					message: `${inlineCode(currentUsage.name)} is required!`,
				});
				continue;
			}

			let result = await this.parseUsage(currentUsage, rawArg);
			if(result.fail) {
				errors.push({
					usage: currentUsage,
					message: result.message,
				});
			} else {
				finalArgs.push(result.parsed);
			}
		};

		return { args: finalArgs, errors };
	};

	/**
	 * 
	 * @param {UsageParser} usage 
	 * @param {string} raw 
	 * @returns {UsageParserResult}
	 */
	async parseUsage(usage, raw) {
		/** @type {UsageParserCallback[]} */
		let parsers = [];

		let cursor = usage;
		while(cursor.type !== "native") {
			// collect parser
			if(cursor.parse) parsers.push(cursor.parse);
			// populate usage
			for (const key in cursor) {
				if (usage[key] === undefined) {
					usage[key] = cursor[key];
				}
			}
			
			cursor = this.resolveUsageParser(cursor.type);
			if(!cursor) break;
		};

		// because of the condition on the while loop
		// the final native parse fn doesnt get collected
		// so we do it manually
		// fixme!
		if(cursor.parse) parsers.push(cursor.parse);

		// reverse it so the lowest parser is first
		parsers.reverse();

		if(!raw) {
			if (usage.optional) {
				return {
					parsed: usage.default ?? null,
				};
			} else {
				return fail(`${inlineCode(usage.name)} is required!`);
			}
		}

		let value = raw;
		for(let parser of parsers) {
			/** @type {UsageParserResult} */
			let result = await parser({
				arg: value,
				name: usage.name,
				opts: usage,
				style: this.styling,
			});

			if(result.fail) {
				// forward result if its a fail
				return result;
			};

			value = result.parsed;
		};

		return { parsed: value };
	}
};

export {
	ArgumentParser
};
