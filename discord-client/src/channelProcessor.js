const { Haiku } = require('./types/Haiku');
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
        const { author } = this.messages[2];
        const haiku = new Haiku(null, { author, lines });
        this.onHaiku(haiku);
      }
    }
  }

  setOnHaikuFunction(func) {
    this.onHaiku = func;
  }
}

exports.ChannelProcessor = ChannelProcessor;
