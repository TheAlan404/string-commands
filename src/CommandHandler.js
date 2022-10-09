import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { EventEmitter } from "node:events";
import { ArgumentParser } from "./ArgumentParser.js";

/**
 * @typedef {Object} Command
 * @prop {string} name - Name of the command
 * @prop {string[]} [aliases] - aliases
 * @prop {import("./usages").UsageResolvable[]} [args] - Arguments
 * @prop {CommandRun} run
 * @prop {CommandCheck[]} checks
 */

/**
 * Execute function of Command
 * @callback CommandRun
 * @param {Message} msg
 * @param {any[]} args
 * @param {Object} ctx
 */

/**
 * Check callback
 * @callback CommandCheck
 * @async
 * @param {Message} msg
 * @param {any[]} args
 * @param {Object} ctx
 * @returns {CommandCheckResult}
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
    /**
     * 
     * @param {Object} opts - Options for the command handler
     * @param {string} opts.prefix - Prefix of the command handler. Defaults to `"!"`
     * @param {Object} opts.argumentParser - ArgumentParser options
     * @param {Object|false} opts.log - The logger to use.
     *                                - Set to `false` to disable logging.
     *                                - Default is `console`
     * @param {function(Object):Command} opts.transformCommand - @see transformCommand
     * @param {function(Object):any[]} opts.buildArguments - @see buildArguments
     */
    constructor(opts = {}) {
        super();
        this.prefix = typeof(opts.prefix) == "string" ? opts.prefix : "!";
        this.log = opts.log === false ? noLogger : (opts.log || console);

        if(typeof opts.transformCommand == "function") this.transformCommand = opts.transformCommand;
        if(typeof opts.buildArguments == "function") this.buildArguments = opts.buildArguments;

        /** @type {Map<string, Command>} */
        this.Commands = new Map();
        /** @type {Map<string, string>} */
        this.Aliases = new Map();

        this.argumentParser = new ArgumentParser();
    }

    /**
     * Register a command
     * @param {Command} cmd
     */
    registerCommand(cmd = {}) {
        if(typeof cmd !== "object") throw new Error("registerCommand: Command must be an object");

        if(!cmd.name) throw new Error("registerCommand: Command does not have a name");
        if(!cmd.run) throw new Error("registerCommand: Command does not have a runner function");

        if(!Array.isArray(cmd.aliases))
            cmd.aliases = [];
        if(typeof cmd.args === "string")
            cmd.args = cmd.args.split(" ");
        if(!Array.isArray(cmd.args))
            cmd.args = [];
        if(!Array.isArray(cmd.checks))
            cmd.checks = [];

        this.Commands.set(cmd.name, cmd);
        cmd.aliases.forEach(alias => Aliases.set(alias, cmd.name));

        this.log.info("Registered command: " + cmd.name);
    }

    /**
     * Register commands from a local folder
     * @param {string} [folderPath] - Defaults to "./commands"
     * @remarks The path begins at node's pwd
     */
    async registerCommands(folderPath = "./commands") {
        let entries = readdirSync(resolve(folderPath), { withFileTypes: true });
        this.log.info("Registering folder: " + resolve(folderPath));
        for(let entry of entries) {
            let fd = resolve(dir, entry.name);
            if(entry.isDirectory())
                registerCommands(fd);
            else {
                let obj = await import(fd);
                registerCommand(obj);
            };
        };
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
     * This function returns an array that will be supplied to {@link Command#run}.
     * Modify this using the configuration or overwrite it yourself.
     * Intended for backwards compatability and ease of use.
     * @param {Object} context - Argument builder context 
     * @param {any[]} context.args - The parsed arguments array from {@link ArgumentParser}
     * @param {Object} context.ctx - Other contextual values supplied in {@link CommandHandler#run}
     * @returns {any[]}
     * 
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
    buildArguments({
        args,
        ctx,
    }) {
        return [ctx, args];
    };

    /**
     * 
     * @param {Object} context
     * @param {function():string} context.getFullString - gives you a nicely rendered string
     */
    invalidUsageMessage({
        ctx,
        input,
        name,
        command,
        getFullString,
    }) {

    };

    failedChecksMessage({
        ctx,
        input,
        name,
        command,
        checks,
    }) {

    };

    async run(input, ctx) {
        if(!input.startsWith(this.prefix)) return;

        // parse text

        let split = input.slice(this.prefix.length).split(" ");
        let cmdName = split[0];
        let cmdArgs = split.slice(1).join(" ");

        // resolve

        if(!cmdName) return;
        cmdName = cmdName.toLowerCase();
        // todo replacers locales

        let cmd;

        if(this.Commands.has(cmdName)) {
            cmd = this.Commands.get(cmdName);
        } else if(this.Aliases.has(cmdName)) {
            let alias = this.Aliases.get(cmdName);
            if(!this.Commands.has(alias)) throw new Error("run: Alias points to nothing");
            cmd = this.Commands.get(alias);
        } else {
            this.emit("unknownCommand", {
                input,
                name: cmdName,
                ctx,
            });
            return;
        };

        // parse args

        let {
            args,
            errors,
        } = await this.argumentParser.parseUsages(cmdArgs, cmd.args);

        if(errors.length) {
            this.invalidUsageMessage({
                ctx,
                input,
                name: cmdName,
                command: cmd,
                getFullString: () => prefix + cmdName + " " + this.usagesToString(cmd.args),
            });
            return;
        }

        // build arguments

        let fnArgs = this.buildArguments({
            input,
            ctx,
            args,
        });

        // checks

        let failedChecks = [];
        for(let check of cmd.checks) {
            /** @type {CommandCheckResult} */
            let result = await check(...fnArgs);
            if(!result.pass) {
                failedChecks.push(result.message);
            }
        }

        if(failedChecks.length) {
            this.failedChecksMessage({
                ctx,
                input,
                name: cmdName,
                command: cmd,
                checks: failedChecks,
            });
            return;
        }

        // run

        try {
            let fn = cmd.run.bind(cmd);
            fn(...fnArgs);
            this.emit("commandRun", {
                command: cmd,
                name: cmdName,
                input,
                ctx,
                args,
                runArgs: fnArgs,
            });
        } catch(e) {
            console.log(e);
            this.emit("commandError", {
                error: e,
                command: cmd,
                name: cmdName,
                input,
                ctx,
                args,
                runArgs: fnArgs,
            });
        }
    };

    /**
     * Pretty print the usage of a command
     * @param {Command} cmd command
     */
    prettyPrint(cmd) {
        return this.prefix + cmd.name + (cmd.args?.length ? (" " + this.argumentParser.usagesToString(cmd.args)) : "");
    }
}

export {
    CommandHandler,
};