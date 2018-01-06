const assert = require('assert');
const { describe, it, beforeEach } = require('mocha');
const { Haiku } = require('../src/types/Haiku');
const { formatHaiku } = require('../src/formatHaiku');
const commands = require('../src/commands');

describe('commands', () => {
  describe('#invalidCommand', () => {
    const context = {};

    it('should throw an error if an invalid command is given', () => {
      const args = ['invalidCommand'];
      assert.throws(() => commands.tryCommand(context, args), /Could not find command invalidCommand/);
    });
  });

  describe('#getHaikuById', () => {
    let channelOutput = '';
    const testId = '0';
    const testServerId = 'testServer';
    const haiku = new Haiku(testId, {
      authors: ['author'],
      lines: ['line1', 'line2', 'line3'],
    });

    const context = {
      api: {
        getHaikuById: (serverId, id) => new Promise((resolve, reject) => {
          if (serverId === testServerId && id === testId) {
            resolve(haiku);
          } else {
            reject(new Error(`Test error - serverId: ${serverId}, id: ${id}`));
          }
        }),
      },
      channel: {
        send: (output) => {
          channelOutput += output;
        },
      },
      server: {
        id: testServerId,
      },
    };

    beforeEach(() => {
      channelOutput = '';
    });

    it('should send a correctly formatted haiku message', async () => {
      const args = ['getHaikuById', testId];
      await commands.tryCommand(context, args);
      const expectedOutput = formatHaiku(haiku);
      assert.equal(channelOutput, expectedOutput);
    });

    it('should send an error when fetching fails', async () => {
      const wrongId = 4;
      const args = ['getHaikuById', wrongId];
      await commands.tryCommand(context, args);
      const expectedOutput = `An error occurred while fetching haiku ${wrongId}`;
      assert.equal(channelOutput, expectedOutput);
    });

    it('should throw an error when wrong number of args', () => {
      const expectedError = 'Invalid number of arguments for getHaikuById';

      let args = ['getHaikuById'];
      assert.throws(() => commands.tryCommand(context, args), expectedError);
      args = ['getHaikuById', '9', '0'];
      assert.throws(() => commands.tryCommand(context, args), expectedError);
    });
  });
});
