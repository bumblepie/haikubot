const { formatHaiku } = require('../formatHaiku');

const REQUIRED_REACTIONS = 5;

const onReact = async (messageReaction, user, state) => {
  const { count, emoji, message } = messageReaction;
  const { haikuId, requiredReactions, deleteCallback } = state;
  switch (emoji.name) {
    // Note: check for 1 more than required reactions as bot will have reacted too
    case '❌': if (count > requiredReactions) {
      console.log('trigger');
      await deleteCallback();
      message.edit(`Deleted haiku ${haikuId}`, { embed: null });
    }
      break;
    default:
  }
  return state;
};

exports.deleteCommand = async (context, args) => {
  if (args.length !== 1) {
    throw Error('Invalid number of arguments for delete');
  }
  const serverId = context.server.id;
  const haikuId = args[0];
  try {
    // Show haiku
    const responseHaiku = await context.api.getHaikuById(serverId, haikuId);
    const content = await formatHaiku(responseHaiku, context.client, context.server);
    const message = await context.channel.send(content);
    message.react('❌');

    // Add message to message map so we can delete it when needed
    const deleteCallback = async () => context.api.deleteHaiku(context.server.id, haikuId);
    const initialState = {
      haikuId,
      requiredReactions: REQUIRED_REACTIONS,
      deleteCallback,
    };
    console.log(context.messagesMap);
    context.messagesMap.addMessage(message.id, initialState, onReact);
  } catch (error) {
    console.log(`Caught error ${JSON.stringify(error)}, sending simplified error message to discord`);
    await context.channel.send(`An error occurred while fetching haiku ${haikuId}`);
  }
};
