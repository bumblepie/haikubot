const { formatHaiku } = require('./formatHaiku');

const commandMap = {};

commandMap.getHaikuById = (context, id) => {
  context.api.getHaikuById(id)
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
    throw new Error(`Could not find command ${commandName}`);
  } else {
    commandMap[commandName](context, commandArgs);
  }
};
