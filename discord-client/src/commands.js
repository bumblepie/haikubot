const { formatHaiku } = require('./formatHaiku');

const commandMap = {};

commandMap['getHaikuById'] = (context, id) => {
  context.api.getHaikuById(id)
    .then((responseHaiku) => {
      context.channel.send(formatHaiku(responseHaiku));
    });
};

exports.tryCommand = (context, args) => {
  const commandName = args[0];
  const commandArgs = args.slice(1);
  if (!(commandName in commandMap)) {
    throw `Could not find command ${commandName}`;
  } else {
    commandMap[commandName](context, commandArgs);
  }
}
