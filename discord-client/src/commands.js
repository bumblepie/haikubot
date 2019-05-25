const { formatHaiku } = require('./formatHaiku');
const syllables = require('syllable');

const commandMap = {};

commandMap.gethaikubyid = async (context, args) => {
  if (args.length !== 1) {
    throw Error('Invalid number of arguments for getHaikuById');
  }
  const id = args[0];
  const serverId = context.server.id;
  try {
    const responseHaiku = await context.api.getHaikuById(serverId, id);
    const message = await formatHaiku(responseHaiku, context.client, context.server);
    await context.channel.send(message);
  } catch (error) {
    console.log(`Caught error ${JSON.stringify(error)}, sending simplified error message to discord`);
    await context.channel.send(`An error occurred while fetching haiku ${id}`);
  }
};

commandMap.search = async (context, args) => {
  if (args.length === 0) {
    throw Error('No search keywords provided');
  }
  try {
    const searchResults = await context.api.searchHaikus(args);
    if (searchResults.length === 0) {
      await context.channel.send(`No results found for '${args.join(' ')}'`);
    } else {
      await context.searchResultsService.addSearchResults(searchResults, context);
    }
  } catch (error) {
    console.log(`Caught error ${JSON.stringify(error)}, sending simplified error message to discord`);
    await context.channel.send('An error occurred while searching for haikus');
  }
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
    return new Promise(() => {
      throw Error(`Could not find command ${commandName}`);
    });
  }
  return commandMap[lowercaseCommandName](context, commandArgs);
};
