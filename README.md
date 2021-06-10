# string-commands
A string based command handler

```bash
$ npm i string-commands
```

# Example
```js
const { Client } = require('discord.js');
const { DiscordCommandHandler } = require('string-commands');

const client = new Client();
const handler = new DiscordCommandHandler({ client, prefix: '!' });

handler.addCommand({
    name: "ping",
    run: async (args, message, client) => {
        await message.channel.send('Pong');
    }
});

client.login('token');
```