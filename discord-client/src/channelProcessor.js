const { Haiku } = require('./types/Haiku');
const { isHaiku, getSingleLinehaiku } = require('./validateHaiku');

class ChannelProcessor {
  constructor(serverID, channelID) {
    this.serverID = serverID;
    this.channelID = channelID;
    this.messages = [];
    this.onHaiku = () => {};
  }

  processMessage(fullMessage) {
    const splitMessages = fullMessage.content.split('\n')
      .map(content => ({
        content,
        author: fullMessage.author,
      }));
    splitMessages.forEach(message => this.processSplitMessage(message));
  }

  processSplitMessage(newMessage) {
    const singleLinehaiku = getSingleLinehaiku(newMessage.content);
    if (singleLinehaiku != null) {
      const haiku = new Haiku(null, {
        authors: [newMessage.author.id],
        lines: singleLinehaiku,
        serverId: this.serverID,
        channelId: this.channelID,
      });
      this.onHaiku(haiku);
    }

    this.messages.push(newMessage);
    while (this.messages.length > 3) {
      // remove old messages
      this.messages.shift();
    }

    if (this.messages.length === 3) {
      const lines = this.messages.map(message => message.content);
      if (isHaiku(lines)) {
        const authors = this.messages.map(message => message.author.id);
        const uniqueAuthors = Array.from(new Set(authors));
        const haiku = new Haiku(null, {
          authors: uniqueAuthors,
          lines,
          serverId: this.serverID,
          channelId: this.channelID,
        });
        this.onHaiku(haiku);
      }
    }
  }

  setOnHaikuFunction(func) {
    this.onHaiku = func;
  }
}

exports.ChannelProcessor = ChannelProcessor;
