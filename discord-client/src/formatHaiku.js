const defaultAvatar = 'https://cdn.discordapp.com/embed/avatars/0.png';

const getnameFromUserId = async (userId, client, guild) => {
  // First try fetching their nickname on this server
  try {
    const member = await guild.fetchMember(userId);
    return member.displayName;
  } catch (userNotInGuild) {
    // Next try fetching their username
    try {
      const user = await client.fetchUser(userId);
      return user.username;
    } catch (userDoesNotExist) {
      // The account couldn't be found, default to 'Anon'
      return 'Anon';
    }
  }
};

exports.formatHaiku = async (haiku, client, guild) => {
  const { authors } = haiku;
  // eslint-disable-next-line max-len
  const authorNames = await Promise.all(authors.map(author => getnameFromUserId(author, client, guild)));
  const numAuthors = authorNames.length;
  let authorsString = '';
  if (numAuthors === 1) {
    authorsString += authorNames[0];
  } else {
    for (let i = 0; i < numAuthors - 2; i += 1) {
      authorsString += `${authorNames[i]}, `;
    }
    authorsString += `${authorNames[numAuthors - 2]} and ${authorNames[numAuthors - 1]}`;
  }

  let primaryAuthorColor = null;
  try {
    const member = await guild.fetchMember(authors[0]);
    primaryAuthorColor = member.displayColor;
  } catch (err) {
    // Let color be null if the member doesn't have a color on this server
    primaryAuthorColor = null;
  }
  let primaryAuthorAvatarURL = null;
  try {
    const user = await client.fetchUser(authors[0]);
    primaryAuthorAvatarURL = user.avatarURL;
  } catch (err) {
    // Let avatar url be null and provide a default later if needed
    primaryAuthorAvatarURL = null;
  }

  return {
    embed: {
      title: 'A beautiful haiku has been created!',
      description: `*${haiku.lines[0]}\n${haiku.lines[1]}\n${haiku.lines[2]}*`,
      url: 'https://github.com/bumblepie/haikubot',
      color: primaryAuthorColor,
      timestamp: new Date(haiku.timestamp),
      footer: {
        icon_url: client.user.avatarURL || defaultAvatar,
        text: `Haiku #${haiku.id}`,
      },
      author: {
        name: authorsString,
        icon_url: primaryAuthorAvatarURL || defaultAvatar,
      },
    },
  };
};
