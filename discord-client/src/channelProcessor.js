const { Haiku } = require('./types/Haiku');
const { isHaiku } = require('./validateHaiku');

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
    this.messages.push(newMessage);
    while (this.messages.length > 3) {
      // remove old messages
      this.messages.shift();
    }

    if (this.messages.length === 3) {
      const lines = this.messages.map(message => message.content);
      const authors = this.messages.map(message => message.author.id);
      const uniqueAuthors = Array.from(new Set(authors));
      if (isHaiku(lines)) {
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
