const assert = require('assert');
const { ChannelProcessor } = require('../src/channelProcessor');
const { describe, it, beforeEach } = require('mocha');

describe('ChannelProcessor', () => {
  const fiveSyllableMessage = {
    content: 'The first line has five.',
    author: 'authorFive',
  };

  const sevenSyllableMessage = {
    content: 'The second line has seven.',
    author: 'authorSeven',
  };

  let onHaikuCalled = false;
  let haikuMessages = [];
  let defaultProcessor;

  beforeEach(() => {
    onHaikuCalled = false;
    haikuMessages = [];
    defaultProcessor = new ChannelProcessor('channelID');
    defaultProcessor.setOnHaikuFunction((messages) => {
      onHaikuCalled = true;
      haikuMessages = messages;
    });
  });

  describe('#processMessage', () => {
    it('should call onHaiku when a haiku is sent through', () => {
      assert.ok(!onHaikuCalled);

      defaultProcessor.processMessage(fiveSyllableMessage);
      defaultProcessor.processMessage(sevenSyllableMessage);
      defaultProcessor.processMessage(fiveSyllableMessage);

      assert.ok(onHaikuCalled);
    });

    it('the arguments passed to onHaikuCalled should be the messages given to the processor', () => {
      assert.equal(haikuMessages.length, 0);

      const messages = [];
      messages.push(fiveSyllableMessage);
      messages.push(sevenSyllableMessage);
      messages.push(fiveSyllableMessage);

      messages.forEach((msg) => {
        defaultProcessor.processMessage(msg);
      });

      assert.deepEqual(haikuMessages, messages);
    });
  });
});
