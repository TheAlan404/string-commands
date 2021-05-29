// String Commands
const { readdirSync } = require('fs');
const { basename, join } = require("path");

/** The prefix used in console. Change using setConsolePrefix */
let PREFIX = "string-commands";

/**
 * @typedef {Object} HandlerOptions
 * @property {string} prefix The prefix for the handler.
 * @property {Boolean} dontLog A boolean that controls whether to log warns or not. Defaults to false.
 */

/**
* A command argument. The first character of the string represents if it is required or not.
* ':' means required and ';' means optional.
* @typedef {string[]} CommandArgument
* @example [":required1", ":required2", ";optional1"]
*/

/**
* Represents a commandCallback. This function is run when the command gets run.
* Do your command logic inside this function.
* @callback commandCallback
* @param {string[]} args - arguments of the command string
* @param {...any} extraParams - extra parameters given by the handler
*/

/**
* The function run when the handler cannot find the command
* It is optional. You can add this to make your app give a 404 error message.
* @callback UnknownCommandCallback
* @param {string} commandName
* @param {string} fullString
* @param {...any} extraArgs
*/

/**
* The function run when the required args arent given.
* @callback incorrectUsageCallback
* @param {string} commandName
* @param {string} usage
* @param {string} fullString
* @param {...any} extraArgs
*/

/**
 * @typedef {Object} CommandOptions
 * @property {string} name - The name of the command
 * @property {string[]|string} aliases - aliases of this command (must be string[] if an object)
 * @property {CommandArgument[]|string[]} usage - shows the usage for this command
 * @property {object|string} desc - description of command
 * @property {object|string} description - shorthand for description
 * @property {commandCallback} run
 */

class Command {
	/**
	* Represents a Command object
	* You do not need to initialize this class to make CommandHandler#addCommand work,
	* you can just use a normal object with the properties.
	* @constructor
	* @param {CommandOptions} data
	* Or you can use the same params as Command.from
	*/
	constructor(data, ...extra) {
		if (extra.length || typeof data !== "object") return Command.from(data, ...extra);
		
		this.name = typeof data.name === 'string' && data.name.length ? data.name : "ping";
		this.aliases = data.aliases ? (Array.isArray(data.aliases) && data.aliases.length > 1 ? data.aliases : [data.aliases] ) : [];
		this.usage = Array.isArray(data.usage) ? data.usage : [];
		this.desc = data.desc || data.description || "";
		this.run = data.run;
		this.isAlias = data.isAlias === undefined ? false : data.isAlias;
	}
	
	get description() {
		return this.desc;
	}
	
	/**
	* Shorthand for making commands
	* @param {string} name
	* @param {string|string[]} aliases - if a string, seperate using spaces
	* @param {string[]} usage
	* @param {commandCallback} run
	*/
	static from(name, aliases, usage, run) {
		return new Command({
			name,
			aliases: (typeof aliases === "string" ? aliases.split(" ") : aliases),
			usage,
			run,
		});
	}
}


class CommandHandler {
	/**
	* Command Handler Class
	* @constructor
	* @param {HandlerOptions} opts
	*/
	constructor(opts = {}) {
		this.setPrefix(opts.prefix);
		this.commands = new Map();
		this.dontLog = !!opts.dontLog;
	}
	
	/**
	* List all of the commands.
	* @return {string[]} names of the commands
	*/
	listAll() {
		return [...this.commands.keys()].filter(name => !this.commands.get(name).isAlias);
	}
	
	/**
	* Sets the prefix for this handler
	* @param {string} [prefix] The new prefix.
	*/
	setPrefix(prefix) {
		this.prefix = typeof prefix === "string" ? prefix : "";
		return this;
	}
  
	/**
	* Sets the default commandCallback parameters
	* @param {...any} list
	*/
	setDefaultArgs(...list) {
		this.defaultArgs = list;
		return this;
	}

	/**
	* Sets the function that is run when the command isnt found.
	* @param {UnknownCommandCallback} func
	*/
	setUnknownCommand(func) {
		if (!func || typeof func !== 'function') throw new TypeError("'UnknownCommandCallback' must be a function.");
		this.unknownCommand = func;
		return this;
	}
	
	/**
	* Sets the function that is run when required args arent given
	* @param {incorrectUsageCallback} func
	*/
	setIncorrectUsage(func) {
		if (!func || typeof func !== 'function') throw new TypeError("'incorrectUsageCallback' must be a function.");
		this.incorrectUsage = func;
		return this;
	}

	/**
	* Adds a command
	* @param {Command|Object} command
	*/
	addCommand(command = {}) {
		if (!command.name || !command.run) throw new Error("Command must have a name and a run function!");
		if (this.commands.has(command.name) && !this.dontLog) console.warn(`[${PREFIX}] Command ${command.name} has already been added! Overwriting.`);
		this.commands.set(command.name, command);
		
		if (Array.isArray(command.aliases)) {
			for (const alias of (command.aliases || [])) {
				if (this.commands.has(alias) && !this.dontLog) console.warn(`[${PREFIX}] Command ${alias} has already been added! Overwriting. (alias of ${command.name})`);
				this.commands.set(alias, {
					...command,
					isAlias: true,
				});
			}
		}
	}

	/**
	* Loads a file and adds the commands in it
	* @param {string} - path
	* @param {...any} - extraArgs
	*/
	loadFile(path="", ...extraArgs) {
		let filename = basename(path, ".js");
		try {
			let mod = require(path);
			if (!mod.load) {
				if (!this.dontLog) console.warn(`[${PREFIX}] Cannot load file '${filename}' because exports.load is not defined`);
				return;
			}
			mod.load(this.addCommand, ...extraArgs);
		} catch(e) {
			console.log(`[${PREFIX}] An error occured while loading command '${filename}':\n`, e);
		}
		if (this.log && this.log.commandLoaded) console.log(`[string-commands] Loaded command '${filename}'`);
	}
  
	/**
	* Runs a command depending on the string
	* @param {string} string
	* @param {...any} extraArgs - if the handler sees null or undefined,
	*                             it will look for the defaultArgs list (UNIMPLEMENTED).
	*/
	run(string, ...extraArgs) {
		if (!string.startsWith(this.prefix)) return;
		string = string.slice(this.prefix.length);
		
		const args = string.split(" ");
		const commandName = args.shift().toLowerCase();
		if (!this.commands.has(commandName)) {
			if (this.unknownCommand) this.unknownCommand(commandName, string, ...extraArgs);
			return;
		}
		let command = this.commands.get(commandName);
		// TODO: add middleware (for ex. check perms for a discord bot)

		if (Array.isArray(command.usage) && command.usage.length) {
			const req = command.usage.filter(u => u.startsWith(':')).length;
			if (req > 0 && !args[req - 1]) {
				if (this.incorrectUsage) this.incorrectUsage(commandName, command.usage.map(x => /^:/.test(x) ? `<${x.replace(/:/g, '')}>` : `[${x.replace(/;/g, '')}]`).join(" "), ...extraArgs);
				return;
			}
		}

		let callbackOutput;
		try {
			callbackOutput = command.run(args, ...extraArgs);
		} catch (e) {
			if (this.surpressErrors) return;
			if (this.errorHandler) this.errorHandler(e);
			else throw e;
		}
		if (callbackOutput instanceof Promise) {
			callbackOutput.catch(e => {
				if (this.surpressErrors) return;
				else if (this.errorHandler) this.errorHandler(e);
				else throw e;
			});
		}
	}
}

class DiscordCommandHandler extends CommandHandler {
	/**
	* A discord client command handler extension.
	* @param {HandlerOptions} opts
	* @param {Discord.Client} opts.client - if present will call this.attach with it
	*/
	constructor (opts = {}) {
		super(opts);
		this.commands = new require("discord.js").Collection();
		
		if (opts.client) this.attach(opts.client);
	}
	
	/** Helper to run with extra argument of message */
	run(message) {
		super.run(message.content, message, this.client, ...this.defaultArgs);
	}
	
	// @see CommandHandler#listAll
	listAll() {
		return this.commands.keyArray().filter(name => !this.commands.get(name).isAlias);
	}
	
	/**
	* Imports a template file (known as 'altyapi' in turkish)
	* @param {string} path - must be a full path because `require` function is relative to the package/file
	*/
	importTemplateFile(path="") {
		let filename = basename(path, ".js");
		try {
			let mod = require(path);
			
			// Wrap the function, reorders given arguments. This is done for compatability.
			let wrapper = this.dontWrap ? mod.run : (args, message, client) => mod.run(client, message, args);
			
			this.addCommand({
				...(mod.help || {}),
				...(mod.conf || {}),
				run: wrapper,
			});
		} catch(e) {
			console.log(`[${PREFIX}] An error occured while loading command '${filename}':\n`, e);
		}
		if (this.log && this.log.commandLoaded) console.log(`[${PREFIX}] Loaded command '${filename}'`);
	}
	
	// @see CommandHandler#loadFile
	loadFile(path, ...extraArgs) {
		super.loadFile(path, this.client, ...extraArgs);
	}
	
	/**
	* Imports commands from a directory
	* @param {string} folderpath
	*/
	importTemplates(folderpath) {
		for (const filename of readdirSync(path))
			this.importTemplateFile(join(folderpath, filename));
	}
	
	/**
	* Attaches the handler to the client
	* @param {Discord.Client} client
	*/
	attach(client) {
		this.client = client;
		client.on("message", message => this.run(message));
	}
}

module.exports = {
	CommandHandler,
	Command,
	setConsolePrefix: (str) => PREFIX = str,	
	DiscordCommandHandler,
}