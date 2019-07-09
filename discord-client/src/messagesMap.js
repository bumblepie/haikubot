class MessagesMap {
  constructor() {
    this.messages = new Map();
  }

  /**
   * Adds a message to the map via its id. When this message is reacted to, it
   * will call the callback provided, which may update some internal state such
   * as a list of search results.
   * @messageId the id of the message
   * @initialState any initial state necessary for the onReact callback
   * @onReact a callback which will be executed when the message is reacted to.
   *   It should have the signature (messageReaction, user, state) => newState
   */
  addMessage(messageId, initialState, onReact) {
    console.log({ messageId, initialState, onReact });
    this.messages.set(messageId, {
      state: initialState,
      onReact,
    });
  }

  /**
   * Calls the provided callback on the message if it exists in the map
   */
  onReact(messageReaction, user) {
    const { message: { id } } = messageReaction;
    if (this.messages.has(id)) {
      const { state, onReact } = this.messages.get(id);
      const newState = onReact(messageReaction, user, state);
      this.messages.set(id, {
        state: newState,
        onReact,
      });
    }
  }
}

exports.MessagesMap = MessagesMap;
