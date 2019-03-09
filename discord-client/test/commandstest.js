const assert = require('assert');
const { describe, it, beforeEach } = require('mocha');
const { Haiku } = require('../src/types/Haiku');
const commands = require('../src/commands');

describe('commands', () => {
  describe('#invalidCommand', () => {
    const context = {};

    it('should throw an error if an invalid command is given', async () => {
      const args = ['invalidCommand'];
      await assert.rejects(() => commands.tryCommand(context, args), Error('Could not find command invalidCommand'));
    });
  });

  describe('#getHaikuById', () => {
    let channelOutput = [];
    const testId = '0';
    const testServerId = 'testServer';
    const testServer2Id = 'testServer2';
    const haiku = new Haiku(testId, {
      authors: ['author'],
      lines: ['line1', 'line2', 'line3'],
      channelId: 'channel1',
      serverId: testServerId,
    });
    const haiku2 = new Haiku(testId, {
      authors: ['author'],
      lines: ['line4', 'line5', 'line6'],
      channelId: 'channel2',
      serverId: testServer2Id,
    });

    const client = {
      fetchUser: userId => ({ username: userId }),
      user: {
        avatarURL: 'bot avatar',
      },
    };

    const context = {
      api: {
        getHaikuById: (serverId, id) => new Promise((resolve, reject) => {
          if (id !== testId) {
            reject(new Error(`Test error - serverId: ${serverId}, id: ${id}`));
          }
          if (serverId === testServerId) {
            resolve(haiku);
          } else if (serverId === testServer2Id) {
            resolve(haiku2);
          } else {
            reject(new Error(`Test error - serverId: ${serverId}, id: ${id}`));
          }
        }),
      },
      channel: {
        send: (output) => {
          channelOutput.push(output);
        },
      },
      server: {
        id: testServerId,
      },
      client,
    };

    beforeEach(() => {
      channelOutput = [];
    });

    it('should send an embed with the correct haiku message', async () => {
      const args = ['getHaikuById', testId];
      await commands.tryCommand(context, args);
      assert.equal(channelOutput.length, 1);
      assert.equal(channelOutput[0].embed.description, '*line1\nline2\nline3*');
    });

    it('should send the correct message when called in a different server', async () => {
      const args = ['getHaikuById', testId];
      const context2 = context;
      context2.server = {
        id: testServer2Id,
      };
      await commands.tryCommand(context2, args);
      assert.equal(channelOutput.length, 1);
      assert.equal(channelOutput[0].embed.description, '*line4\nline5\nline6*');
    });

    it('should send an error when fetching fails', async () => {
      const wrongId = 4;
      const args = ['getHaikuById', wrongId];
      await commands.tryCommand(context, args);
      const expectedOutput = `An error occurred while fetching haiku ${wrongId}`;
      assert.equal(channelOutput, expectedOutput);
    });

    it('should throw an error when wrong number of args', async () => {
      const expectedError = /Invalid number of arguments for getHaikuById/;
      let args = ['getHaikuById'];
      await assert.rejects(() => commands.tryCommand(context, args), expectedError);
      args = ['getHaikuById', '9', '0'];
      await assert.rejects(() => commands.tryCommand(context, args), expectedError);
    });
  });

  describe('#count', () => {
    let channelOutput = '';
    const context = {
      channel: {
        send: (output) => {
          channelOutput += output;
        },
      },
    };

    beforeEach(() => {
      channelOutput = '';
    });

    it('should count the number of syllables of the rest of the arguments', async () => {
      const args = ['count', 'syllables'];
      await commands.tryCommand(context, args);
      assert.equal(channelOutput, '"syllables" is 3 syllables');
    });

    it('should not use the plural "syllables" if it is one syllable', async () => {
      const args = ['count', 'one'];
      await commands.tryCommand(context, args);
      assert.equal(channelOutput, '"one" is 1 syllable');
    });

    it('should not use count the syllables of multiple arguments', async () => {
      const args = ['count', 'one', 'two', 'three'];
      await commands.tryCommand(context, args);
      assert.equal(channelOutput, '"one two three" is 3 syllables');
    });

    it('should still send a message even if no other args are given', async () => {
      const args = ['count'];
      await commands.tryCommand(context, args);
      assert.equal(channelOutput, '"" is 0 syllables');
    });
  });
});
