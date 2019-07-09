const Discord = require('discord.js');
const { MessagesMap } = require('./messagesMap');
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
    newChannelProcessor.setOnHaikuFunction(async (haiku) => {
      console.log(`Haiku triggered:
        authors: ${haiku.authors}
        lines: ${haiku.lines},
        serverId: ${haiku.serverId},
        channelId: ${haiku.channelId}`);
      try {
        const responseHaiku = await api.saveHaiku(haiku);
        const msg = await formatHaiku(responseHaiku, client, channel.guild);
        channel.send(msg);
      } catch (error) {
        console.log(`Caught error ${JSON.stringify(error)} while saving haiku, ignoring...`);
        console.log('Failed to save haiku.');
      }
    });
    channelProcessorMap[channelID] = newChannelProcessor;
  }

  channelProcessorMap[channelID].processMessage(message);
};

const messagesMap = new MessagesMap();

client.on('ready', () => {
  console.log('Bot is ready');
});

client.on('message', async (message) => {
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
      client,
      messagesMap,
    };

    try {
      await commands.tryCommand(context, splitContent);
    } catch (err) {
      console.log(`Error while processing command: ${err}`);
      message.channel.send(err.message);
    }
  } else {
    processMessage(message);
  }
});

client.on('messageReactionAdd', async (messageReaction, user) => {
  const { message } = messageReaction;

  // Ignore bot reactions (including our own)
  if (user.bot) {
    return;
  }

  if (message.author.id === client.user.id) {
    messagesMap.onReact(messageReaction, user);
  }
});

client.login(discordApiToken);
