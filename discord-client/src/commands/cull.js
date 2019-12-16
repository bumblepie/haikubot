const { formatHaiku } = require('../formatHaiku');
const { isHaiku } = require('../validateHaiku');

const REQUIRED_REACTIONS = 1;

const fetchHaikuToCull = async (context, serverId) => {
  const haikus = await context.api.getHaikusInServer(serverId);
  const cullingCandidates = haikus.filter(haiku => !isHaiku(haiku.lines));
  if (cullingCandidates.length > 0) {
    return cullingCandidates[0];
  }
  return null;
};

const onReact = async (messageReaction, user, state) => {
  const { count, emoji, message } = messageReaction;
  const {
    haikuId,
    requiredReactions,
    deleteCallback,
    saveCallback,
  } = state;

  switch (emoji.name) {
    // Note: check for 1 more than required reactions as bot will have reacted too
    case '👍': if (count > requiredReactions) {
      await saveCallback();
      message.edit(`Saved haiku ${haikuId}`, { embed: null });
      return { remove: true, newState: null };
    }
      break;
    case '👎': if (count > requiredReactions) {
      await deleteCallback();
      message.edit(`Deleted haiku ${haikuId}`, { embed: null });
      return { remove: true, newState: null };
    }
      break;
    default:
  }
  return { remove: false, newState: state };
};

exports.cullCommand = async (context, args) => {
  if (args.length !== 0) {
    throw Error('Invalid number of arguments for cull');
  }
  const serverId = context.server.id;
  const haiku = await fetchHaikuToCull(context, serverId);
  if (haiku == null) {
    await context.channel.send('No haikus left to cull!');
    return;
  }
  const haikuId = haiku.id;
  try {
    // Show haiku
    const content = await formatHaiku(haiku, context.client, context.server);
    const message = await context.channel.send(content);

    // await to ensure consistent order of emojis
    await message.react('👍');
    message.react('👎');

    // Add message to message map so we can delete it when needed
    const deleteCallback = async () => context.api.deleteHaiku(context.server.id, haikuId);
    const saveCallback = async () => console.log('save haiku');
    const initialState = {
      haikuId,
      requiredReactions: REQUIRED_REACTIONS,
      deleteCallback,
      saveCallback,
    };
    context.messagesMap.addMessage(message.id, initialState, onReact);
  } catch (error) {
    console.error(`Caught error ${JSON.stringify(error)}, sending simplified error message to discord`);
    await context.channel.send(`An error occurred while fetching haiku ${haikuId}`);
  }
};
