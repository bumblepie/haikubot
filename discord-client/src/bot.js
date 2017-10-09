const Discord = require('discord.js');
const { ChannelProcessor } = require('./channelProcessor');
const { discordApiToken } = require('./secrets.js');

const client = new Discord.Client();

const channelProcessorMap = {};

client.on('ready', () => {
  console.log('Bot is ready');
});

client.on('message', (message) => {
  const channel = { message };
  const channelID = channel.id;

  if (channelProcessorMap[channelID] == null) {
    const newChannelProcessor = new ChannelProcessor(channelID);
    newChannelProcessor.setOnHaikuFunction((haiku) => {
      console.log(`Haiku triggered:
        author: ${haiku.author}
        lines: ${haiku.lines}`);

      channel.send(`${haiku.author} has created a beautiful Haiku!
        ${haiku.lines[0]}
        ${haiku.lines[1]}
        ${haiku.lines[2]}`);
    });
    channelProcessorMap[channelID] = newChannelProcessor;
  }

  channelProcessorMap[channelID].processMessage(message);
});

client.login(discordApiToken);
