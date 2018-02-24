const Discord = require('discord.js');
const fs = require('fs');
const { ChannelProcessor } = require('./channelProcessor');
const { discordApiToken, graphqlApiBaseUrl } = require('./config');
const { formatHaiku } = require('./formatHaiku');
const commands = require('./commands');
const apiFactory = require('./haiku-api-connection/apiFactory');

const api = apiFactory.createGraphqlApi(graphqlApiBaseUrl);
const client = new Discord.Client();

const channelProcessorMap = {};

const loadConfig = () => {
  const configContents = fs.readFileSync('./config.json');
  const config = JSON.parse(configContents);
  if (config.default.commandPrefix == null) {
    throw Error('default commandPrefix must be set in config.json');
  }
  return config;
};

const processMessage = (message) => {
  const { channel } = message;
  const serverID = channel.guild.id;
  const channelID = channel.id;

  if (channelProcessorMap[channelID] == null) {
    const newChannelProcessor = new ChannelProcessor(serverID, channelID);
    newChannelProcessor.setOnHaikuFunction((haiku) => {
      console.log(`Haiku triggered:
        authors: ${haiku.authors}
        lines: ${haiku.lines},
        serverId: ${haiku.serverId},
        channelId: ${haiku.channelId}`);
      api.saveHaiku(haiku)
        .then(responseHaiku => channel.send(formatHaiku(responseHaiku)))
        .catch((error) => {
          console.log(`Caught error ${JSON.stringify(error)} while saving haiku, ignoring...`);
          console.log('Failed to save haiku.');
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
  const config = loadConfig();
  let commandPrefix;
  if (config[message.guild]) {
    commandPrefix = config[message.guild].commandPrefix || config.default.commandPrefix;
  } else {
    ({ commandPrefix } = config.default);
  }
  if (message.author.id === client.user.id) {
    // Ignore own messages
    return;
  }

  const { content } = message;
  if (content.startsWith(commandPrefix)) {
    const trimmedContent = content.substring(commandPrefix.length).trim();
    // split by whitespace
    const splitContent = trimmedContent.split(/\s+/);
    const context = {
      config,
      api,
      channel: message.channel,
      server: message.guild,
    };

    try {
      commands.tryCommand(context, splitContent);
    } catch (err) {
      console.log(`Error while processing command: ${err}`);
      message.channel.send(err.message);
    }
  } else {
    processMessage(message);
  }
});

client.login(discordApiToken);
