// String Commands

/**
 * @typedef {Object} HandlerOptions
 * @property {string} prefix The prefix for the handler.
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
* @param {...any} customParams - If the handler class has a custom
*                                commandCallbackArgs set, the callback's parameters will be set to that.
*/

class Command {
  /**
  * Represents a Command object
  * You do not need to initialize this class to make CommandHandler#addCommand work,
  * you can just use a normal object with the properties.
  * @constructor
  * @param {object} data
  * @param {string} data.name - name of the command
  * @param {(string[]|string)} [data.aliases] - aliases of this command (must be string[] if an object)
  * @param {(CommandArgument[]|string[]) [data.usage] - shows the usage for this command
  * @param {commandCallback} data.run
  */
  constructor(data) {
    this.name = data.name || "ping";
    this.aliases = data.aliases ? (Array.isArray(data.aliases) ? data.aliases : [data.aliases] ) : [];
    this.usage = Array.isArray(data.usage) ? data.usage : [];
    this.run = data.run;
    this.isAlias = data.isAlias === undefined ? false : data.isAlias;
  }
}


module.exports = class CommandHandler {
  /**
  * Command Handler Class
  * @constructor
  * @param {HandlerOptions} opts
  */
  constructor(opts = {}) {
    this.prefix = typeof opts.prefix === 'string' ? opts.prefix : "";
    this.commands = new Map();
    this.dontLog = opts.dontLog;
  }
  
  /**
  * Sets the prefix for this handler
  * @param {string} prefix The new prefix.
  */
  setPrefix(prefix) {
    this.prefix = typeof prefix === "string" ? prefix : "";
    return this;
  }

  /**
  * Adds a command
  * @param {Command} command
  */
  addCommand(command = {}) {
    if(!command.name || !command.run) throw new Error("Command must have a name and a run function!");
    if(this.commands.has(command.name) && !this.dontLog) console.warn(`[string-commands] Command ${command.name} has already been added! Overwriting.`);
    this.commands.set(command.name, command);
    
    if(Array.isArray(command.aliases)) command.aliases.forEach((alias) => {
      if(this.commands.has(alias) && !this.dontLog) console.warn(`[string-commands] Command ${alias} has already been added! Overwriting. (alias of ${command.name})`);
      this.commands.set(alias, {
        ...command,
        isAlias: true,
      })
    })
  }
}
