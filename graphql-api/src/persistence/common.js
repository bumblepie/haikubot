exports.validateKeywords = (keywords) => {
  if (keywords.length == 0) {
    throw new Error('no keywords given');
  }

  const validKeywordsRegex = /^\w+\*?$/;
  const invalidKeywords = keywords.filter(keyword => !validKeywordsRegex.test(keyword));

  if (invalidKeywords.length > 0) {
    const formattedInvalidKeywords = invalidKeywords
      .map(keyword => `'${keyword}'`)
      .join(', ');
    throw new Error(`Invalid keywords: [${formattedInvalidKeywords}]`);
  }
}
