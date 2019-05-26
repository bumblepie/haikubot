const { formatHaiku } = require('./formatHaiku');

class SearchResultsService {
  constructor() {
    this.searchMessages = new Map();
  }

  static messageFromResults(searchResults, index) {
    return `Found ${searchResults.length} haiku${searchResults.length !== 1 ? 's' : ''}:
            Showing result (${index + 1})`;
  }

  // Send search results message to channel, add it to map
  async addSearchResults(searchResults, context) {
    const content = SearchResultsService.messageFromResults(searchResults, 0);
    const embed = await formatHaiku(searchResults[0], context.client, context.server);
    const message = await context.channel.send(content, embed);
    await message.react('⬅');
    await message.react('➡');

    this.searchMessages.set(message.id, {
      searchResults,
      currentIndex: 0,
    });
  }

  // Cycle through search results
  // indexDelta should be -1 on left, +1 on right
  async switchResults(message, indexDelta, context) {
    if (!this.searchMessages.has(message.id)) {
      return;
    }

    const { searchResults, currentIndex } = this.searchMessages.get(message.id);
    const newIndex = currentIndex + indexDelta;
    if (newIndex >= 0 && newIndex < searchResults.length) {
      // Edit message
      const content = SearchResultsService.messageFromResults(searchResults, newIndex);
      const embed = await formatHaiku(searchResults[newIndex], context.client, context.server);
      await message.edit(content, embed);
      // Update map
      this.searchMessages.set(message.id, { searchResults, currentIndex: newIndex });
    }
  }
}

exports.SearchResultsService = SearchResultsService;
