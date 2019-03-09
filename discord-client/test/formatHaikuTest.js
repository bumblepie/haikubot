const assert = require('assert');
const { Haiku } = require('../src/types/Haiku');
const { formatHaiku } = require('../src/formatHaiku');
const { describe, it } = require('mocha');

describe('formatHaiku', () => {
  // Set up dummy data
  const guildMembers = {
    author: {
      displayName: 'nickname',
      displayColor: 123,
    },
  };
  const users = {
    bot: {
      avatarURL: 'bot avatar',
    },
    author: {
      username: 'username',
      avatarURL: 'author avatar',
    },
    authorNotInServer: {
      username: 'non server member',
      avatarURL: 'non server member avatar',
    },
  };

  // Mock client and guild per discord JS api
  const client = {
    fetchUser: (userId) => {
      if (userId in users) {
        return users[userId];
      }
      throw Error('User not found');
    },
    user: users.bot,
  };
  const guild = {
    fetchMember: (userId) => {
      if (userId in guildMembers) {
        return guildMembers[userId];
      }
      throw Error('Member not found');
    },
  };

  describe('#formatHaiku', () => {
    describe('#authors', () => {
      it('should correctly set fetch a guild member\'s nickname and avatar url', async () => {
        const haiku = new Haiku('id', { authors: ['author'], lines: ['line 1', 'line 2', 'line 3'] });
        const haikuMsg = await formatHaiku(haiku, client, guild);
        assert.equal(haikuMsg.embed.author.name, 'nickname');
        assert.equal(haikuMsg.embed.author.icon_url, 'author avatar');
      });

      it('should correctly set fetch a non guild member\'s username and avatar url', async () => {
        const haiku = new Haiku('id', { authors: ['authorNotInServer'], lines: ['line 1', 'line 2', 'line 3'] });
        const expectedEmbedDescription = 'non server member';
        const haikuMsg = await formatHaiku(haiku, client, guild);
        assert.equal(haikuMsg.embed.author.name, expectedEmbedDescription);
        assert.equal(haikuMsg.embed.author.icon_url, 'non server member avatar');
      });

      it('should correctly give a default name and avatar for an author if they don\'t exist', async () => {
        const haiku = new Haiku('id', { authors: ['non existing author'], lines: ['line 1', 'line 2', 'line 3'] });
        const expectedEmbedDescription = 'Anon';
        const haikuMsg = await formatHaiku(haiku, client, guild);
        assert.equal(haikuMsg.embed.author.name, expectedEmbedDescription);
        assert.equal(haikuMsg.embed.author.icon_url, 'https://cdn.discordapp.com/embed/avatars/0.png');
      });

      it('should correctly set format haiku\'s author for a single author', async () => {
        const haiku = new Haiku('id', { authors: ['author'], lines: ['line 1', 'line 2', 'line 3'] });
        const haikuMsg = await formatHaiku(haiku, client, guild);
        assert.equal(haikuMsg.embed.author.name, 'nickname');
      });

      it('should correctly set format haiku\'s author for a haiku with two authors', async () => {
        const haiku = new Haiku('id', { authors: ['author', 'author'], lines: ['line 1', 'line 2', 'line 3'] });
        const haikuMsg = await formatHaiku(haiku, client, guild);
        assert.equal(haikuMsg.embed.author.name, 'nickname and nickname');
      });

      it('should correctly set format haiku\'s author for a haiku with three authors', async () => {
        const haiku = new Haiku('id', { authors: ['author', 'author', 'author'], lines: ['line 1', 'line 2', 'line 3'] });
        const haikuMsg = await formatHaiku(haiku, client, guild);
        assert.equal(haikuMsg.embed.author.name, 'nickname, nickname and nickname');
      });
    });

    describe('#footer', () => {
      it('should correctly set the footer of the embed', async () => {
        const haiku = new Haiku('id', { authors: ['author'], lines: ['line 1', 'line 2', 'line 3'] });
        const expectedFooter = {
          icon_url: 'bot avatar',
          text: 'Haiku #id',
        };
        const haikuMsg = await formatHaiku(haiku, client, guild);
        assert.deepEqual(haikuMsg.embed.footer, expectedFooter);
      });
    });

    describe('#lines', () => {
      it('should display the haiku in italics in the embed description', async () => {
        const haiku = new Haiku('id', { authors: ['author'], lines: ['line 1', 'line 2', 'line 3'] });
        const haikuMsg = await formatHaiku(haiku, client, guild);
        assert.equal(haikuMsg.embed.description, '*line 1\nline 2\nline 3*');
      });
    });

    describe('#display color', () => {
      it('should display the embed with the color of the first author if available', async () => {
        const haiku = new Haiku('id', { authors: ['author'], lines: ['line 1', 'line 2', 'line 3'] });
        const haikuMsg = await formatHaiku(haiku, client, guild);
        assert.equal(haikuMsg.embed.color, 123);
      });

      it('should display the embed without any color if the first author has available display color', async () => {
        const haiku = new Haiku('id', { authors: ['authorNotInServer'], lines: ['line 1', 'line 2', 'line 3'] });
        const haikuMsg = await formatHaiku(haiku, client, guild);
        assert('color' in haikuMsg.embed);
      });
    });
  });
});
