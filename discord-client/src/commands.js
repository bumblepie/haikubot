const api = require('./haiku-api-connection/apiFactory').graphqlApi;
const { formatHaiku } = require('./formatHaiku');

const commandMap = {};

commandMap['getHaikuById'] = (channel, id) => {
  api.getHaikuById(id)
    .then((responseHaiku) => {
      channel.send(formatHaiku(responseHaiku));
    });
};

exports.tryCommand = (channel, args) => {
  const commandName = args[0];
  const commandArgs = args.slice(1);

  if (commandMap[commandName] === null) {
    throw `Could not find command ${commandName}`;
  } else {
    commandMap[commandName](channel, commandArgs);
  }
}
