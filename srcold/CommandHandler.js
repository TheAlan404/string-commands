import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { EventEmitter } from "node:events";
import { ArgumentParser } from "./ArgumentParser.js";
import { stageify } from "./stageify.js";

/**
 * @typedef {Object} Command
 * @prop {string} name - Name of the command
 * @prop {string[]} [aliases] - aliases
 * @prop {import("./usages.js").UsageResolvable[]} [args] - Arguments
 * @prop {CommandRun} run
 * @prop {CommandCheck[]} checks
 */

/**
 * Execute function of Command
 * @callback CommandRun
 * @param {...any} args - Runner function arguments, @see buildArguments
 */

/**
 * Check callback
 * @callback CommandCheck
 * @param {...any} args - Runner function arguments, @see buildArguments
 * @returns {Promise<CommandCheckResult>}
 */

/**
 * @typedef {Object} CommandCheckResult
 * @prop {boolean} pass - true if pass
 * @prop {string} message - message of not passing
 */

const noLogger = {
	log: () => {},
	info: () => {},
	debug: () => {},
	error: () => {},
};

class CommandHandler extends EventEmitter {
	constructor(opts = {}) {
		super();
		this.prefix = typeof opts.prefix == "string" ? opts.prefix : "";
		this.log = opts.log === false ? noLogger : opts.log || console;

		if (typeof opts.transformCommand == "function")
			this.transformCommand = opts.transformCommand;
		if (typeof opts.buildArguments == "function")
			this.buildArguments = opts.buildArguments;

		this.Commands = new Map();
		this.Aliases = new Map();

		this.middlewares = [];

		this.argumentParser = new ArgumentParser(opts.argumentParser);
		if (opts.usages) {
			for (let [k, v] of Object.entries(opts.usages))
				this.registerUsage(k, v);
		}
	}

	// alias
	addCommand = (...args) => this.registerCommand(...args);
	addCommands = (...args) => this.registerCommands(...args);

	/**
	 * Register a command
	 * @param {Command} cmd
	 */
	registerCommand(cmd = {}) {
		cmd = this.transformCommand(cmd);
		if (typeof cmd !== "object")
			throw new Error("registerCommand: Command must be an object");
		else if (!cmd.name)
			throw new Error("registerCommand: Command does not have a name");
		else if (!cmd.run)
			throw new Error(
				"registerCommand: Command does not have a runner function",
			);

		if (!Array.isArray(cmd.aliases)) cmd.aliases = [];

		if (typeof cmd.args === "string") cmd.args = cmd.args.split(" ");
		else if (!Array.isArray(cmd.args)) cmd.args = [];

		if (!Array.isArray(cmd.checks)) cmd.checks = [];

		this.Commands.set(cmd.name, cmd);
		cmd.aliases.forEach((alias) => this.Aliases.set(alias, cmd.name));

		this.log.info("Registered command: " + cmd.name);
		return this;
	}

	/**
	 * Register commands from a local folder
	 * @param {string} [folderPath] - Defaults to "./commands"
	 * @remarks The path begins at node's pwd
	 */
	async registerCommands(folderPath = "./commands") {
		let entries = readdirSync(resolve(folderPath), { withFileTypes: true });
		this.log.info("Registering folder: " + resolve(folderPath));
		for (let entry of entries) {
			let fd = resolve(folderPath, entry.name);
			if (entry.isDirectory()) await this.registerCommands(fd);
			else {
				let obj = {};
				try {
					obj = await import(fd);
				} catch (e) {
					try {
						if (e.code == "ERR_UNSUPPORTED_ESM_URL_SCHEME") {
							obj = await import("file://" + fd);
						} else {
							throw e;
						}
					} catch (ee) {
						this.log.error(
							"Cannot register command " +
								fd +
								" because of error: " +
								ee.toString(),
						);
					}
				}
				if (obj && !obj.name && obj.default && obj.default.name)
					obj = obj.default;
				this.registerCommand(obj);
			}
		}
		return this;
	}

	/**
	 * Transform an object into a valid Command.
	 * This is intended for backwards compatability with other command handlers.
	 * @param {Object} obj - the supposed command object
	 * @returns {Command}
	 */
	transformCommand(obj) {
		return obj;
	}

	/**
	 * @example
	 * myHandler.buildArguments((build) => [build.ctx.message, build.args, build.ctx.db]);
	 *
	 * myHandler.run("!hi", { message: msg, db: getDB() });
	 *
	 * let cmd = {
	 *  name: "hi",
	 *  run: async (message, args, db) => {
	 *      //look  ^^^^^^^^^^^^^^^^^
	 *  },
	 * };
	 */
	buildArguments({ args, ctx }) {
		return [ctx, args];
	}

	use(mw) {
		if (typeof mw === "function") {
			mw = {
				before: "run",
				run: mw,
			};
		} else if (typeof mw !== "object")
			throw new Error("Middleware should be an object");

		if (!mw.run) throw new Error("Middleware run() doesn't exist");
		if (!mw.id) mw.id = "mw-" + this.middlewares.length;

		this.middlewares.push(mw);
		return this;
	}

	async run(input, ctx) {
		if (!input.startsWith(this.prefix)) return;

		let { execute } = stageify([
			{
				id: "splitString",
				run: (execCtx, next) => {
					let split = execCtx.input
						.slice(this.prefix.length)
						.split(" ");
					let cmdName = split[0].toLowerCase();
					let cmdArgs = split.slice(1).join(" ");

					execCtx.name = cmdName;
					execCtx.rawArgs = cmdArgs;

					if (!cmdName) return;

					next();
				},
			},
			{
				id: "resolveCommand",
				after: "splitString",
				run: (execCtx, next) => {
					let cmd;
					let { name } = execCtx;

					if (this.Commands.has(name)) {
						cmd = this.Commands.get(name);
					} else if (this.Aliases.has(name)) {
						let alias = this.Aliases.get(name);
						if (!this.Commands.has(alias))
							throw new Error("run: Alias points to nothing");
						cmd = this.Commands.get(alias);
					} else {
						this.emit("unknownCommand", execCtx);
						return;
					}

					execCtx.command = cmd;
					next();
				},
			},
			{
				id: "parseUsages",
				after: "resolveCommand",
				run: async (execCtx, next) => {
					let { args, errors } =
						await this.argumentParser.parseUsages(
							execCtx.rawArgs,
							execCtx.command.args,
							execCtx.ctx,
						);

					if (errors.length) {
						this.emit("invalidUsage", {
							...execCtx,
							errors,
						});
						return;
					}

					execCtx.args = args;

					// also build args here lol
					execCtx.runArgs = this.buildArguments(execCtx);

					next();
				},
			},
			{
				id: "checks",
				after: "parseUsages",
				run: async (execCtx, next) => {
					let failedChecks = [];
					for (let check of execCtx.command.checks) {
						/** @type {CommandCheckResult} */
						let result = await check(execCtx, execCtx.runArgs);
						if (!result.pass) {
							failedChecks.push(result);
						}
					}

					if (failedChecks.length) {
						this.emit("failedChecks", {
							...execCtx,
							failedChecks,
						});
						return;
					}

					next();
				},
			},
			{
				id: "run",
				after: "checks",
				run: (execCtx, next) => {
					try {
						let fn = execCtx.command.run.bind(execCtx.command);
						fn(...execCtx.runArgs);
						this.emit("commandRun", execCtx);
					} catch (e) {
						console.log(e);
						this.emit("commandError", {
							...execCtx,
							error: e,
						});
					}

					next();
				},
			},
			...this.middlewares,
		]);

		execute({
			input,
			ctx,
			handler: this,
		});

		return this;
	}

	/**
	 * Pretty print the usage of a command
	 * @param {Command} cmd command
	 * @returns {string}
	 */
	prettyPrint(cmd) {
		return (
			this.prefix +
			cmd.name +
			(cmd.args?.length
				? " " + this.argumentParser.usagesToString(cmd.args)
				: "")
		);
	}

	/**
	 * {@inheritDoc ArgumentParser#registerUsage}
	 */
	registerUsage(...args) {
		this.argumentParser.registerUsage(...args);
		return this;
	}
}

export { CommandHandler };
