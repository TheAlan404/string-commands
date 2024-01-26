import { Client } from "discord.js";
import { DiscordSlashCommandHandler } from "../src/extensions/discordjs-slash";
import { config } from "dotenv";

config();

const handler = new DiscordSlashCommandHandler({
    client: new Client({
        intents: [
            "Guilds"
        ]
    }),
});

handler.registerEvents();

handler.add({
    name: "test",
    description: "tests stuff",
    run({ interaction }) {
        interaction.reply({
            content: "hello world",
            ephemeral: true,
        });
    },
})


handler.add({
    name: "list",
    description: "manage lists",
    subcommands: {
        create: {
            description: "creat",
            run({ interaction }) {
                interaction.reply({ content: "no" })
            },
        }
    }
})

handler.publishCommandsGuild(process.env.GUILD_ID as string);

handler.client.on("ready", () => {
    console.log("Bot is ready!");
});

handler.login();

