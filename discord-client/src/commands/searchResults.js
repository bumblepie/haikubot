const { formatHaiku } = require('../formatHaiku');

const messageFromResults = (searchResults, index) => `Found ${searchResults.length} haiku${searchResults.length !== 1 ? 's' : ''}:
Showing result (${index + 1})`;

// Cycle through search results
// indexDelta should be -1 on left, +1 on right
const switchResults = async (state, indexDelta, message) => {
  const { searchResults, currentIndex, context } = state;
  const newIndex = currentIndex + indexDelta;
  if (newIndex >= 0 && newIndex < searchResults.length) {
    // Edit message
    const content = messageFromResults(searchResults, newIndex);
    const embed = await formatHaiku(searchResults[newIndex], context.client, context.server);
    await message.edit(content, embed);

    return { searchResults, currentIndex: newIndex, context };
  }
  return { searchResults, currentIndex, context };
};

const onReact = async (messageReaction, user, state) => {
  const { message, emoji } = messageReaction;
  let newState = { ...state };
  switch (emoji.name) {
    case '⬅': newState = await switchResults(state, -1, message);
      messageReaction.remove(user);
      break;
    case '➡': newState = await switchResults(state, 1, message);
      messageReaction.remove(user);
      break;
    default:
  }
  return { remove: false, newState };
};

// Send search results message to channel, add it to map
const addSearchResults = async (searchResults, context) => {
  const content = messageFromResults(searchResults, 0);
  const embed = await formatHaiku(searchResults[0], context.client, context.server);
  const message = await context.channel.send(content, embed);
  await message.react('⬅');
  await message.react('➡');

  const initialState = {
    searchResults,
    currentIndex: 0,
    context,
  };

  context.messagesMap.addMessage(message.id, initialState, onReact);
};

exports.searchResultsCommand = async (context, args) => {
  if (args.length === 0) {
    throw Error('No search keywords provided');
  }
  try {
    const searchResults = await context.api.searchHaikus(context.server.id, args);
    if (searchResults.length === 0) {
      await context.channel.send(`No results found for '${args.join(' ')}'`);
    } else {
      await addSearchResults(searchResults, context);
    }
  } catch (error) {
    console.log(`Caught error ${JSON.stringify(error)}, sending simplified error message to discord`);
    await context.channel.send('An error occurred while searching for haikus');
  }
};
