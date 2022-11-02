import { CommandHandler } from "../src";
import { Client, channelMention, ChannelType } from "discord.js";

/**
 * @type {Object<string, import("../src/ArgumentParser").UsageParser>}
 */
const DiscordUsages = {
	_mentionable: {
		type: "text",
		async parse(ctx) {
			return ctx.arg.replace(/[<@#!&>]/g, "");
		},
	},

	user: {
		type: "_mentionable",
		async parse(ctx) {
			let user = ctx.context.client.users
				.fetch(ctx.arg)
				.catch(() => null);

			if (!user) {
				return ctx.fail(`${ctx.opts.bot ? "Bot" : "User"} not found!`);
			}

			if (ctx.opts.bot && !user.bot)
				return ctx.fail(
					`${ctx.style.bold(user.username)} isn't a bot!`,
				);
			else if (!opts.bot && user.bot)
				return ctx.fail(`${ctx.style.bold(user.username)} is a bot!`);

			return { parsed: user };
		},
	},

	member: {
		type: "user",
		async parse(ctx) {
			const { guild } = ctx.context.message;
			const member = await guild.members
				.fetch(ctx.arg.id)
				.catch(() => null);

			if (!member)
				return ctx.fail(
					`${ctx.style.bold(
						ctx.arg.username,
					)} isn't on ${ctx.style.bold(guild.name)}!`,
				);

			return { parsed: member };
		},
	},

	role: {
		type: "_mentionable",
		async parse(ctx) {
			const { guild } = ctx.context.message;
			const role = await guild.roles.fetch(ctx.arg).catch(() => null);

			if (!role) return ctx.fail(`Role not found!`);

			return { parsed: role };
		},
	},

	channel: {
		type: "_mentionable",
		async parse(ctx) {
			const { guild } = ctx.context.message;
			const channel = await guild.channels
				.fetch(ctx.arg)
				.catch(() => null);

			if (!channel) return ctx.fail(`Channel not found!`);

			if (
				ctx.opts.channelType !== undefined &&
				ctx.opts.channelType != channel.type
			) {
				return ctx.fail(
					`${channelMention(channel.id)} isn't ${ctx.style.bold(
						ChannelType[ctx.opts.channelType],
					)}`,
				);
			}

			return { parsed: channel };
		},
	},

	textChannel: {
		type: "channel",
		channelType: ChannelType.GuildText,
	},

	voiceChannel: {
		type: "channel",
		channelType: ChannelType.GuildVoice,
	},
};

const DiscordChecks = {
	requirePermissions(permissions) {},

	async requireGuildOwner(client, msg, args) {
		return msg.guild.ownerId == msg.author.id
			? {
					pass: true,
			  }
			: {
					pass: false,
					message: "You must be the owner of this guild",
			  };
	},
};

/**
 * @typedef {import("../src/CommandHandler").CommandHandlerOptions} DiscordCommandHandlerOptions
 */

class DiscordCommandHandler extends CommandHandler {
	/**
	 *
	 * @param {Client} client The discord client
	 * @param {DiscordCommandHandlerOptions} opts - Options for the command handler
	 */
	constructor(client, opts = {}) {
		super(
			Object.assign(
				{
					argumentParser: {
						styling: {
							arg: (x) => `\`${x}\``,
							bold: (x) => `**${x}**`,
						},
					},
				},
				opts,
			),
		);
		this.client = client;
		this.client.handler = this;

		for (let [id, usage] of Object.entries(DiscordUsages))
			this.registerUsage(id, usage);
	}

	buildArguments({ args, ctx }) {
		return [ctx.client, ctx.message, args];
	}

	// handles discord.js messages
	handleMessage(msg) {
		this.run(msg.content, {
			message: msg,
			client: this.client,
		});
	}
}

export { DiscordCommandHandler, DiscordUsages };
