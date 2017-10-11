const Discord = require('discord.js');
const { ChannelProcessor } = require('./channelProcessor');
const { discordApiToken, graphqlApiBaseUrl } = require('./secrets');
const { formatHaiku } = require('./formatHaiku');
const commands = require('./commands');
const apiFactory = require('./haiku-api-connection/apiFactory');

const api = apiFactory.createGraphqlApi(graphqlApiBaseUrl);
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
    const context = {
      api,
      channel: message.channel,
    }
    try {
      commands.tryCommand(context, splitContent);
    } catch(err) {
      console.log(`Error while processing command: ${err}`);
      message.channel.send(err);
    }
  } else {
    processMessage(message);
  }
});

client.login(discordApiToken);
