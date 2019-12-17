const { formatHaiku } = require('../formatHaiku');
const { isHaiku } = require('../validateHaiku');
const sqlite = require('sqlite3');

const sqliteDBFile = process.env.CULLING_DB_FILE || './deploy/db/culling.db';
let db;
const REQUIRED_REACTIONS = 1;

const initDB = async () => new Promise((resolve, reject) => {
  if (db != null) {
    resolve();
  }
  db = new sqlite.Database(sqliteDBFile, async (err) => {
    if (err) {
      reject(err);
    }
    db.run('CREATE TABLE IF NOT EXISTS savedHaikus (ID STRING NOT NULL, PRIMARY KEY (ID))', (err2) => {
      if (err2) {
        reject(err2);
      }
      resolve();
    });
  });
});

const queryDB = async (sql, args) => {
  await initDB();
  return new Promise((resolve, reject) => {
    db.all(sql, args, (err, rows) => {
      if (err) {
        reject(err);
      }
      resolve(rows);
    });
  });
};

const runDBCmd = async (sql, args) => {
  await initDB();
  return new Promise((resolve, reject) => {
    db.run(sql, args, (err) => {
      if (err) {
        reject(err);
      }
      resolve(this);
    });
  });
};

const saveHaiku = async (haikuId) => {
  await runDBCmd('INSERT INTO savedHaikus (ID) values (?)', [haikuId]);
};

const getSavedHaikus = async () => queryDB('SELECT * FROM savedHaikus', []);

// Map of (server id -> serverCullingMap) for each server
// serverCullingMap is an object with the form {
//   candidates: set of haikus that haven't had a message open yet
//   messages: map of (haiku id -> {channel id, message id}) of existing cull message for haiku
// }
const cullingMap = new Map();

const updateCullingMap = async (context, serverId) => {
  let serverCullingMap = cullingMap.get(serverId);

  if (serverCullingMap == null) {
    serverCullingMap = {
      candidates: [],
      messages: new Map(),
    };
  }

  // Refetch when run out of candidates
  if (serverCullingMap.candidates.length === 0) {
    const haikus = await context.api.getHaikusInServer(serverId);
    const savedHaikus = (await getSavedHaikus())
      .map(row => row.ID.toString());
    const cullingCandidates = haikus.filter(haiku => !isHaiku(haiku.lines))
      .filter(haiku => !savedHaikus.includes(haiku.id));
    serverCullingMap.candidates = cullingCandidates;
  }
  cullingMap.set(serverId, serverCullingMap);
};


const fetchHaikuToCull = async (context, serverId) => {
  await updateCullingMap(context, serverId);
  const cullingCandidates = cullingMap.get(serverId).candidates;
  if (cullingCandidates.length > 0) {
    return cullingCandidates.pop();
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
      try {
        await saveCallback();
        message.edit(`Saved haiku ${haikuId}`, { embed: null });
      } catch (err) {
        console.error(err);
        message.edit(`Error saving haiku ${haikuId}`, { embed: null });
      }
      return { remove: true, newState: null };
    }
      break;
    case '👎': if (count > requiredReactions) {
      try {
        await deleteCallback();
        message.edit(`Deleted haiku ${haikuId}`, { embed: null });
      } catch (err) {
        console.error(err);
        message.edit(`Error deleting haiku ${haikuId}`, { embed: null });
      }
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
  let haikuId;
  let haiku;
  try {
    haiku = await fetchHaikuToCull(context, serverId);
    if (haiku == null) {
      await context.channel.send('No haikus left to cull!');
      return;
    }
    haikuId = haiku.id;
  } catch (err) {
    console.error(err);
    console.error(`Caught error ${JSON.stringify(err)}, sending simplified error message to discord`);
    await context.channel.send('An error occurred while fetching haiku to cull');
    return;
  }

  try {
    // Delete old culling message from map if it exists
    const serverCullingMap = cullingMap.get(serverId);
    if (serverCullingMap.messages.has(haikuId)) {
      const { channelId, messageId } = serverCullingMap.messages.get(haikuId);
      const oldMsg = await context.server.channels.get(channelId).fetchMessage(messageId);
      // Ensure old message is deleted before new one is posted to prevent race conditions
      await oldMsg.delete();
    }

    // Show haiku
    const content = await formatHaiku(haiku, context.client, context.server);
    const message = await context.channel.send(content);

    // Await to ensure consistent order of emojis
    await message.react('👍');
    message.react('👎');

    // Add message to culling map so we can delete the message if it becomes stale
    serverCullingMap.messages.set(haikuId, {
      channelId: message.channel.id,
      messageId: message.id,
    });

    // Add message to message map so we can cull/save the haiku based on reactions
    const deleteCallback = async () => context.api.deleteHaiku(context.server.id, haikuId);
    const saveCallback = async () => saveHaiku(haikuId);
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
