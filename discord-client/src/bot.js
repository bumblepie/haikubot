const Discord = require('discord.js');
const request = require('request');
const { ChannelProcessor } = require('./channelProcessor');
const { discordApiToken, graphqlApiBaseUrl } = require('./secrets');
const queryFactory = require('./graphql/queryFactory');

const client = new Discord.Client();

const channelProcessorMap = {};

client.on('ready', () => {
  console.log('Bot is ready');
});

client.on('message', (message) => {
  const { channel } = message;
  const channelID = channel.id;

  if (channelProcessorMap[channelID] == null) {
    const newChannelProcessor = new ChannelProcessor(channelID);
    newChannelProcessor.setOnHaikuFunction((haiku) => {
      console.log(`Haiku triggered:
        author: ${haiku.author}
        lines: ${haiku.lines}`);

      const haikuInput = {
        haiku: {
          author: haiku.author.id,
          lines: haiku.lines,
        },
      };

      const requestOptions = {
        method: 'POST',
        url: graphqlApiBaseUrl,
        json: true,
        body: queryFactory.createHaikuMutation(haiku)
      };

      request(requestOptions, (err, res, body) => {
        console.log(err);
        console.log(body);
        const responseHaiku = body.data.createHaiku;
        console.log(responseHaiku);
        channel.send(`<@${responseHaiku.author}> has created a beautiful Haiku!
          "${responseHaiku.lines[0]}
          ${responseHaiku.lines[1]}
          ${responseHaiku.lines[2]}"
           - Haiku #${responseHaiku.id}`);
      });
    });
    channelProcessorMap[channelID] = newChannelProcessor;
  }

  channelProcessorMap[channelID].processMessage(message);
});

client.login(discordApiToken);
