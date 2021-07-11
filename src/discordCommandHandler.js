const { CommandHandler } = require("./index.js");

class DiscordCommandHandler extends CommandHandler {
	/**
	* A discord client command handler extension.
	* @param {HandlerOptions} opts
	* @param {Discord.Client} opts.client - if present will call this.attach with it
	*/
	constructor (opts = {}) {
		super(opts);
		this.commands = new (require("discord.js")).Collection();
		
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

module.exports = { DiscordCommandHandler };
