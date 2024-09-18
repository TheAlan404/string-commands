import { Client } from "discord.js";
import { DiscordFramework } from "../src/extensions/discordjs-slash";
import { config } from "dotenv";

config();

let fw = new DiscordFramework({
    client: new Client({
        intents: [
            "Guilds"
        ]
    }),
});

fw.registerEvents();

fw.slashCommands.add({
    name: "test",
    description: "tests stuff",
    run({ interaction }) {
        interaction.reply({
            content: "hello world",
            ephemeral: true,
        });
    },
})

fw.slashCommands.add({
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

fw.publishSlashCommandsGuild(process.env.GUILD_ID as string);

fw.client.on("ready", () => {
    console.log("Bot is ready!");
});

fw.login();

