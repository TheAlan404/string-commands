// String Commands
const { readdirSync } = require('fs');
const { basename, join } = require("path");

const Command = require("./Command");
const CommandHandler = require("./CommandHandler");
const DiscordCommandHandler = require("./discordCommandHandler.js");

module.exports = {
	Command,
	CommandHandler,
	DiscordCommandHandler,
}
