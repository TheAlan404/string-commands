/**
 * @typedef {Object} CommandOptions
 * @property {string} name - The name of the command
 * @property {string[]|string} aliases - aliases of this command (must be string[] if an object)
 * @property {CommandArgument[]|string[]} usage - shows the usage for this command
 * @property {object|string} desc - description of command
 * @property {object|string} description - shorthand for description
 * @property {commandCallback} run
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
		this.desc = data.desc ?? data.description ?? "";
		this.run = data.run ?? data.exec; // Fallbacks
		if(!this.run || typeof this.run !== "function") throw new Error("Command callback (command.run = function(){}) is not given");
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

module.exports = Command;
