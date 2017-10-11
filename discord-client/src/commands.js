const { formatHaiku } = require('./formatHaiku');

const commandMap = {};

commandMap.getHaikuById = (context, args) => {
  if (args.length !== 1) {
    throw Error('Invalid number of arguments for getHaikuById');
  }
  const id = args[0];
  return context.api.getHaikuById(id)
    .then(responseHaiku => context.channel.send(formatHaiku(responseHaiku)))
    .catch((error) => {
      console.log(`Caught error ${error}, sending simplified error message to discord`);
      context.channel.send(`An error occurred while fetching haiku ${id}`);
    });
};

exports.tryCommand = (context, args) => {
  const commandName = args[0];
  const commandArgs = args.slice(1);
  if (!(commandName in commandMap)) {
    throw Error(`Could not find command ${commandName}`);
  } else {
    return commandMap[commandName](context, commandArgs);
  }
};
