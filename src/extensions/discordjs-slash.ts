import { ButtonInteraction, CacheType, ChatInputCommandInteraction, Client, Events, Interaction, MessageComponentInteraction, MessageContextMenuCommandInteraction, ModalSubmitInteraction, REST, RESTPostAPIChatInputApplicationCommandsJSONBody, Routes, SlashCommandBuilder, UserContextMenuCommandInteraction } from "discord.js";
import { BaseContext, BaseCommand, CommandHandler, Middleware } from "..";
import { CommandExecutor, CommandResolverCtx, ContextStatic } from "../builtin/middlewares";
import { TypedEmitter } from "tiny-typed-emitter";

export interface DiscordClientCtx {
    client: Client,
};

export interface InteractionCtx<T> {
    interaction: T,
}

export type CommonContext = BaseContext & DiscordClientCtx;

export class DiscordFramework<Context> extends TypedEmitter<{}> {
    client: Client;
    clientId: string;
    rest: REST;

    slashCommands: CommandHandler<CommonContext & InteractionCtx<ChatInputCommandInteraction>>;
    modals: CommandHandler<CommonContext & InteractionCtx<ModalSubmitInteraction>>;
    buttons: CommandHandler<CommonContext & InteractionCtx<ButtonInteraction>>;
    userContextMenuCommands: CommandHandler<CommonContext & InteractionCtx<UserContextMenuCommandInteraction>>;
    messageContextMenuCommands: CommandHandler<CommonContext & InteractionCtx<MessageContextMenuCommandInteraction>>;
    messageComponents: CommandHandler<CommonContext & InteractionCtx<MessageComponentInteraction>>;
    messageCommands: CommandHandler<any>;

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
        this.client.token = token || process.env.DISCORD_TOKEN || process.env.TOKEN;
        this.clientId = clientId || process.env.CLIENT_ID;

        this.rest = new REST()
            .setToken(this.client.token);

        this.slashCommands = new CommandHandler()
            .use(ContextStatic({ client }))
            .use(async <T extends BaseContext & InteractionCtx<ChatInputCommandInteraction> & DiscordClientCtx>(ctx: T): Promise<T & CommandResolverCtx> => {
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
            });

        this.messageCommands = new CommandHandler()
            .use(ContextStatic({ client }));

    }

    use<T extends CommonContext, U extends T>(mw: Middleware<T, U>): typeof this {
        // @ts-ignore
        this.slashCommands.use(mw);
        // @ts-ignore
        this.messageCommands.use(mw);
        // @ts-ignore
        return this;
    }

    useExecutor() {
        // @ts-ignore
        this.slashCommands = this.slashCommands.use(CommandExecutor());
        // @ts-ignore
        this.messageCommands = this.messageCommands.use(CommandExecutor());
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

        for(let [name, cmd] of this.slashCommands.commands.entries()) {
            // @ts-ignore
            arr.push(toData(cmd));
        }

        return arr;
    }

    async publishSlashCommandsGuild(guildId: string) {
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
            this.slashCommands.run({
                input: interaction.commandName,
                interaction,
            })
        } else if (interaction.isMessageComponent()) {

        }
    }

    async login() {
        return await this.client.login();
    }
}
