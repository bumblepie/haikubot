const { formatHaiku } = require('./formatHaiku');
const syllables = require('syllable');

const commandMap = {};

commandMap.gethaikubyid = (context, args) => {
  if (args.length !== 1) {
    throw Error('Invalid number of arguments for getHaikuById');
  }
  const id = args[0];
  const serverId = context.server.id;
  return context.api.getHaikuById(serverId, id)
    .then(responseHaiku => context.channel.send(formatHaiku(responseHaiku)))
    .catch((error) => {
      console.log(`Caught error ${JSON.stringify(error)}, sending simplified error message to discord`);
      context.channel.send(`An error occurred while fetching haiku ${id}`);
    });
};

commandMap.count = (context, args) => {
  const value = args.join(' ');
  const syllableCount = syllables(value);
  context.channel.send(`"${value}" is ${syllableCount} syllable${syllableCount === 1 ? '' : 's'}`);
};

exports.tryCommand = (context, args) => {
  const commandName = args[0];
  const commandArgs = args.slice(1);
  const lowercaseCommandName = commandName.toLowerCase();
  if (!(lowercaseCommandName in commandMap)) {
    throw Error(`Could not find command ${commandName}`);
  } else {
    return commandMap[lowercaseCommandName](context, commandArgs);
  }
};
