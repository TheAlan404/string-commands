//const Log = require("./Log.js");
const { EventEmitter } = require("events");

/**
 * @typedef {Object} HandlerOptions
 * @property {string} prefix The prefix for the handler.
 * @property {Boolean} dontLog A boolean that controls whether to log warns or not. Defaults to false.
 */

/**
* event
* @callback unknownCommand
* @param {string} commandName
* @param {string} fullString
* @param {...any} extraArgs
*/

/**
* event
* @callback incorrectUsage
* @param {string} commandName
* @param {string} usage
* @param {string} fullString
* @param {...any} extraArgs
*/

class CommandHandler extends EventEmitter {
	/**
	* Command Handler Class
	* @constructor
	* @param {HandlerOptions} opts
	*/
	constructor(opts = {}) {
		super();
		this.setPrefix(opts.prefix);
		this.commands = new Map();
		this.dontLog = !!opts.dontLog;
		this.defaultArgs = [];
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
			this.emit("unknownCommand", commandName, string, ...extraArgs);
			return;
		}
		let command = this.commands.get(commandName);
		// TODO: add middleware (for ex. check perms for a discord bot)

		if (Array.isArray(command.usage) && command.usage.length) {
			const req = command.usage.filter(u => u.startsWith(':')).length;
			if (req > 0 && !args[req - 1]) {
				this.emit("incorrectUsage", commandName, command.usage.map(x => /^:/.test(x) ? `<${x.replace(/:/g, '')}>` : `[${x.replace(/;/g, '')}]`).join(" "), ...extraArgs);
				return;
			}
		}

		let callbackOutput;
		try {
			callbackOutput = command.run(args, ...extraArgs);
		} catch (e) {
			if (this.surpressErrors) return;
			this.emit("commandError", e);
		}
		if (callbackOutput instanceof Promise) {
			callbackOutput.catch(e => {
				if (this.surpressErrors) return;
				this.emit("commandError", e);
			});
		}
	}
}

module.exports = CommandHandler;
