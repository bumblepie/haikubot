const Discord = require('discord.js');
const { ChannelProcessor } = require('./channelProcessor');
const { discordApiToken } = require('./secrets');
const { formatHaiku } = require('./formatHaiku');
const commands = require('./commands');
const api = require('./haiku-api-connection/apiFactory').graphqlApi;

const client = new Discord.Client();

const channelProcessorMap = {};
const commandPrefix = '!';

const processMessage = (message) => {
  const { channel } = message;
  const channelID = channel.id;

  if (channelProcessorMap[channelID] == null) {
    const newChannelProcessor = new ChannelProcessor(channelID);
    newChannelProcessor.setOnHaikuFunction((haiku) => {
      console.log(`Haiku triggered:
        author: ${haiku.author}
        lines: ${haiku.lines}`);
        api.saveHaiku(haiku).then(responseHaiku => {
          channel.send(formatHaiku(responseHaiku));
        });
    });
    channelProcessorMap[channelID] = newChannelProcessor;
  }

  channelProcessorMap[channelID].processMessage(message);
};

client.on('ready', () => {
  console.log('Bot is ready');
});

client.on('message', (message) => {
  const { content } = message;
  if (content.startsWith(commandPrefix)) {
    const trimmedContent = content.substring(commandPrefix.length);
    //split by whitespace
    const splitContent = trimmedContent.split(/\s+/);
    commands.tryCommand(message.channel, splitContent);
  } else {
    processMessage(message);
  }
});

client.login(discordApiToken);
