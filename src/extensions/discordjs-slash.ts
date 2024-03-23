import { CacheType, ChatInputCommandInteraction, Client, Events, Interaction, REST, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes, SlashCommandBuilder } from "discord.js";
import { BaseContext, BaseCommand, CommandHandler } from "..";
import { CommandExecutor, CommandResolverCtx, ContextStatic } from "../middlewares";

export interface DiscordClientCtx {
    client: Client,
};

export interface InteractionCtx {
    interaction: ChatInputCommandInteraction,
}

export class DiscordSlashCommandHandler<
    Context extends BaseContext & DiscordClientCtx & InteractionCtx
> extends CommandHandler<Context> {
    client: Client;
    clientId: string;
    rest: REST;

    constructor({
        client,
        token,
        clientId,
    }: {
        client: Client,
        token?: string,
        clientId?: string,
    }) {
        super();

        this.client = client;
        this.client.token = token || process.env.TOKEN;
        this.clientId = clientId || process.env.CLIENT_ID;
        this.use(ContextStatic({ client }))
            .use({
                id: "discord-command-resolver",
                run: async <T extends BaseContext & InteractionCtx & DiscordClientCtx>(ctx: T): Promise<T & CommandResolverCtx> => {
                    let cmd = ctx.handler.commands.get(ctx.interaction.commandName);

                    let targetCommand = cmd;

                    let subcommandGroup = ctx.interaction.options.getSubcommandGroup();
                    let subcommand = ctx.interaction.options.getSubcommand();
                    if(subcommandGroup) {
                        targetCommand = cmd.subcommands[subcommandGroup].subcommands[subcommand];
                    } else if(subcommand) {
                        targetCommand = cmd.subcommands[subcommand];
                    }

                    return {
                        ...ctx,
                        rootCommand: cmd,
                        targetCommand,
                    };
                },
            })
            .use(CommandExecutor());

        this.rest = new REST()
            .setToken(this.client.token);
    }

    getSlashCommandData() {
        const toData = (cmd: BaseCommand<Context>) => {
            let builder = new SlashCommandBuilder();
            builder.setName(cmd.name);
            builder.setDescription(cmd.description || "");

            if (cmd.subcommands) {
                for (let [name, subcommand] of Object.entries(cmd.subcommands)) {
                    let isGroup = !!subcommand.subcommands;
                    if (isGroup) {
                        builder.addSubcommandGroup(
                            (group) => {
                                group
                                    .setName(name)
                                    .setDescription(subcommand.description || "");

                                for (let [name, sub] of Object.entries(subcommand.subcommands)) {
                                    group.addSubcommand(
                                        b => b.setName(name).setDescription(sub.description || "")
                                    )
                                }

                                return group;
                            }
                        );
                    } else {
                        builder.addSubcommand(
                            b => b.setName(name).setDescription(subcommand.description || "")
                        )
                    }
                }
            }
            
            return builder.toJSON();
        }

        let arr: RESTPostAPIChatInputApplicationCommandsJSONBody[] = [];

        for(let [name, cmd] of this.commands.entries()) {
            arr.push(toData(cmd));
        }

        return arr;
    }

    async publishCommandsGuild(guildId: string) {
        let data = this.getSlashCommandData();

        return await this.rest.put(
            Routes.applicationGuildCommands(this.clientId, guildId),
            { body: data }
        );
    }

    async publishCommandsGlobal() {
        let data = this.getSlashCommandData();

        return await this.rest.put(
            Routes.applicationCommands(this.clientId),
            { body: data }
        );
    }

    registerEvents() {
        this.client.on(Events.InteractionCreate, this.onInteractionCreate.bind(this));
    }

    async onInteractionCreate(interaction: Interaction<CacheType>) {
        if(interaction.isChatInputCommand()) {
            this.run({
                input: interaction.commandName,
                interaction,
            })
        }
    }

    async login() {
        return await this.client.login();
    }
}
