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

    it('should send a the correct message when called in a different server', async () => {
      const args = ['getHaikuById', testId];
      const context2 = context;
      context2.server = {
        id: testServer2Id,
      };
      console.log(context2);
      console.log(args);
      await commands.tryCommand(context2, args);
      const expectedOutput = formatHaiku(haiku2);
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
