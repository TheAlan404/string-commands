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
* @param {string} fullString
* @param {...any} extraArgs
*/

/**
 * @typedef {Object} CommandOptions
 * @property {string} name The name of the command
 * @property {string[]|string} aliases aliases of this command (must be string[] if an object)
 * @property {CommandArgument[]|string[]} usage shows the usage for this command
 * @property {commandCallback} run
 */

class Command {
  /**
  * Represents a Command object
  * You do not need to initialize this class to make CommandHandler#addCommand work,
  * you can just use a normal object with the properties.
  * @constructor
  * @param {CommandOptions} data
  */
  constructor(data) {
    this.name = typeof data.name === 'string' && data.name ? data.name : "ping";
    this.aliases = data.aliases ? (Array.isArray(data.aliases) && data.aliases.length > 1 ? data.aliases : [data.aliases] ) : [];
    this.usage = Array.isArray(data.usage) ? data.usage : [];
    this.run = data.run;
    this.isAlias = data.isAlias === undefined ? false : data.isAlias;
  }
}


class CommandHandler {
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
    this.unknownCommand = func;
    return this;
  }

  /**
  * Sets the function that is run when required args arent given
  * @param {incorrectUsageCallback} func
  */
  setIncorrectUsage(func) {
    this.incorrectUsage = func;
    return this;
  }

  /**
  * Adds a command
  * @param {Command|Object} command
  */
  addCommand(command = {}) {
    if (!command.name || !command.run) throw new Error("Command must have a name and a run function!");
    if (this.commands.has(command.name) && !this.dontLog) console.warn(`[string-commands] Command ${command.name} has already been added! Overwriting.`);
    this.commands.set(command.name, command);
    
    if (Array.isArray(command.aliases))
      for (const alias of (command.aliases || [])) {
        if (this.commands.has(alias) && !this.dontLog) console.warn(`[string-commands] Command ${alias} has already been added! Overwriting. (alias of ${command.name})`);
        this.commands.set(alias, {
          ...command,
          isAlias: true,
        });
      }
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
      const req = c.usage.filter(u => u.startsWith(':')).length;
      if (req > 0 && !args[req - 1] && this.incorrectUsage)
        this.incorrectUsage(commandName, string, ...extraArgs);
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
        if (this.errorHandler) this.errorHandler(e);
        else throw e;
      });
    }
  }
}



module.exports = {
  CommandHandler,
  Command,
}