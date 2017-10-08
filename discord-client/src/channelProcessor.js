const { isHaiku } = require('./validateHaiku');

class ChannelProcessor {
  constructor(channelID) {
    this.channelID = channelID;
    this.messages = [];
    this.onHaiku = () => {};
  }

  processMessage(newMessage) {
    this.messages.push(newMessage);
    while (this.messages.length > 3) {
      // remove old messages
      this.messages.shift();
    }

    if (this.messages.length === 3) {
      const lines = this.messages.map(message => message.content);
      if (isHaiku(lines)) {
        this.onHaiku(this.messages);
      }
    }
  }
}

exports.ChannelProcessor = ChannelProcessor;
