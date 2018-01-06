const assert = require('assert');
const { Haiku } = require('../src/types/Haiku');
const { ChannelProcessor } = require('../src/channelProcessor');
const { describe, it, beforeEach } = require('mocha');

describe('ChannelProcessor', () => {
  const fiveSyllableMessage = {
    content: 'The first line has five.',
    author: { id: 'authorFive' },
  };

  const sevenSyllableMessage = {
    content: 'The second line has seven.',
    author: { id: 'authorSeven' },
  };

  const fullHaikuMessage = {
    content: 'The first line has five.\n The second line has seven.\n The third line has five.',
    author: { id: 'authorFull' },
  };

  const fiveSplitSyllableMessage = {
    content: 'The first line \nhas five.',
    author: { id: 'authorFive' },
  };

  let onHaikuCalled = false;
  let outputHaiku = null;
  let defaultProcessor;

  const haikuFunction = (haiku) => {
    onHaikuCalled = true;
    outputHaiku = haiku;
  };

  const serverId = 'server1';
  const channelId = 'channel1'

  beforeEach(() => {
    onHaikuCalled = false;
    outputHaiku = null;
    defaultProcessor = new ChannelProcessor(serverId, channelId);
    defaultProcessor.setOnHaikuFunction(haikuFunction);
  });

  describe('#processMessage', () => {
    it('should call onHaiku when a haiku is sent through', () => {
      assert.ok(!onHaikuCalled);

      defaultProcessor.processMessage(fiveSyllableMessage);
      defaultProcessor.processMessage(sevenSyllableMessage);
      defaultProcessor.processMessage(fiveSyllableMessage);

      assert.ok(onHaikuCalled);
    });

    it('should correctly split and recognise a full haiku message', () => {
      assert.ok(!onHaikuCalled);
      defaultProcessor.processMessage(fullHaikuMessage);
      assert.ok(onHaikuCalled);
    });

    it('should correctly split and NOT recognise a haiku where a message is separated by newline', () => {
      assert.ok(!onHaikuCalled);

      defaultProcessor.processMessage(fiveSyllableMessage);
      defaultProcessor.processMessage(sevenSyllableMessage);
      defaultProcessor.processMessage(fiveSplitSyllableMessage);

      assert.ok(!onHaikuCalled);
    });

    it('should create a Haiku instance and pass it as the argument to onHaikuCalled', () => {
      assert.equal(outputHaiku, null);

      const messages = [];
      const lines = [];
      messages.push(fiveSyllableMessage);
      messages.push(sevenSyllableMessage);
      messages.push(fiveSyllableMessage);

      messages.forEach((msg) => {
        defaultProcessor.processMessage(msg);
        lines.push(msg.content);
      });

      const fiveAuthor = fiveSyllableMessage.author;
      const sevenAuthor = sevenSyllableMessage.author;

      // filters out second occurence of fiveauthor, but keeps both authors as they are unique
      const expectedHaiku = new Haiku(null, { lines, authors: [fiveAuthor.id, sevenAuthor.id], serverId, channelId });
      assert.deepEqual(outputHaiku, expectedHaiku);
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
      secondProcessor.setOnHaikuFunction(haikuFunction);

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
