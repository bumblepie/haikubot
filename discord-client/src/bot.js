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

      const requestBody = queryFactory.createHaikuMutation(haiku);
      const requestOptions = {
        method: 'POST',
        url: graphqlApiBaseUrl,
        json: true,
        body: requestBody,
      };

      request(requestOptions, (err, res, body) => {
        if (err != null) {
          console.log('Error saving haiku.');
          console.log(` request body: ${JSON.stringify(requestBody)}`);
          console.log(` err: ${err}`);
          console.log(` response body: ${body}`);
        } else {
          const responseHaiku = body.data.createHaiku;
          channel.send(`<@${responseHaiku.author}> has created a beautiful Haiku!
            "${responseHaiku.lines[0]}
            ${responseHaiku.lines[1]}
            ${responseHaiku.lines[2]}"
             - Haiku #${responseHaiku.id}`);
        }
      });
    });
    channelProcessorMap[channelID] = newChannelProcessor;
  }

  channelProcessorMap[channelID].processMessage(message);
});

client.login(discordApiToken);
