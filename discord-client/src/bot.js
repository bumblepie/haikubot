const Discord = require('discord.js');
const { ChannelProcessor } = require('./channelProcessor');
const { discordApiToken, graphqlApiBaseUrl } = require('./config');
const { formatHaiku } = require('./formatHaiku');
const commands = require('./commands');
const apiFactory = require('./haiku-api-connection/apiFactory');

const api = apiFactory.createGraphqlApi(graphqlApiBaseUrl);
const client = new Discord.Client();

const channelProcessorMap = {};

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
  // Check for bot mention at start of message
  const commandregex = new RegExp(`^<@!?${client.user.id}> `);
  if (message.author.bot) {
    // Ignore bot messages
    return;
  }

  const { content } = message;
  if (commandregex.test(content)) {
    // split by whitespace
    const splitContent = content.split(/\s+/);
    // remove first arg to ignore the bot mention
    splitContent.shift();

    const context = {
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
