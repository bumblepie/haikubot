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

    it('should pass the the messages given to the processor to onHaikuCalled', () => {
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

    it('should not call onHaiku when a haiku is not found', () => {
      assert.ok(!onHaikuCalled);

      defaultProcessor.processMessage(fiveSyllableMessage);
      defaultProcessor.processMessage(fiveSyllableMessage);
      defaultProcessor.processMessage(fiveSyllableMessage);

      assert.ok(!onHaikuCalled);
    });

    it('should find haikus when many messages are passed through', () => {
      defaultProcessor.processMessage(fiveSyllableMessage);
      defaultProcessor.processMessage(sevenSyllableMessage);
      defaultProcessor.processMessage(sevenSyllableMessage);
      defaultProcessor.processMessage(fiveSyllableMessage);
      defaultProcessor.processMessage(fiveSyllableMessage);

      assert.ok(!onHaikuCalled);
      defaultProcessor.processMessage(fiveSyllableMessage);
      defaultProcessor.processMessage(sevenSyllableMessage);
      defaultProcessor.processMessage(fiveSyllableMessage);
      assert.ok(onHaikuCalled);

      onHaikuCalled = false;
      defaultProcessor.processMessage(fiveSyllableMessage);
      defaultProcessor.processMessage(fiveSyllableMessage);
      assert.ok(!onHaikuCalled);
    });

    it('should keep finding haikus after previously finding them', () => {
      assert.ok(!onHaikuCalled);
      defaultProcessor.processMessage(fiveSyllableMessage);
      defaultProcessor.processMessage(sevenSyllableMessage);
      defaultProcessor.processMessage(fiveSyllableMessage);
      assert.ok(onHaikuCalled);
      onHaikuCalled = false;
      defaultProcessor.processMessage(fiveSyllableMessage);
      defaultProcessor.processMessage(sevenSyllableMessage);
      defaultProcessor.processMessage(fiveSyllableMessage);
      assert.ok(onHaikuCalled);
      onHaikuCalled = false;
      defaultProcessor.processMessage(fiveSyllableMessage);
      defaultProcessor.processMessage(sevenSyllableMessage);
      defaultProcessor.processMessage(fiveSyllableMessage);
      assert.ok(onHaikuCalled);
    });

    it('should even find a haiku that shares lines with a previous haiku', () => {
      assert.ok(!onHaikuCalled);
      defaultProcessor.processMessage(fiveSyllableMessage);
      defaultProcessor.processMessage(sevenSyllableMessage);
      defaultProcessor.processMessage(fiveSyllableMessage);
      assert.ok(onHaikuCalled);
      onHaikuCalled = false;
      defaultProcessor.processMessage(sevenSyllableMessage);
      defaultProcessor.processMessage(fiveSyllableMessage);
      assert.ok(onHaikuCalled);
    });

    it('should not be interfered with if another processor is also receiving messages', () => {
      const secondProcessor = new ChannelProcessor('channelID2');
      secondProcessor.setOnHaikuFunction((messages) => {
        onHaikuCalled = true;
        haikuMessages = messages;
      });

      assert.ok(!onHaikuCalled);
      defaultProcessor.processMessage(fiveSyllableMessage);

      secondProcessor.processMessage(sevenSyllableMessage);
      secondProcessor.processMessage(fiveSyllableMessage);
      assert.ok(!onHaikuCalled);
      defaultProcessor.processMessage(sevenSyllableMessage);

      secondProcessor.processMessage(sevenSyllableMessage);
      secondProcessor.processMessage(sevenSyllableMessage);
      secondProcessor.processMessage(fiveSyllableMessage);
      assert.ok(!onHaikuCalled);

      defaultProcessor.processMessage(fiveSyllableMessage);
      assert.ok(onHaikuCalled);
      onHaikuCalled = false;
      secondProcessor.processMessage(sevenSyllableMessage);
      secondProcessor.processMessage(fiveSyllableMessage);
      assert.ok(onHaikuCalled);
    });
  });
});
