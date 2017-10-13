exports.formatHaiku = (haiku) => {
  const { authors } = haiku;
  const numAuthors = authors.length;
  let authorsString = '';
  if (numAuthors === 1) {
    authorsString = `<@${authors[0]}> has`;
  } else {
    for (let i = 0; i < numAuthors - 2; i += 1) {
      authorsString += `<@${authors[i]}>, `;
    }
    authorsString += `<@${authors[numAuthors - 2]}> and <@${authors[numAuthors - 1]}> have`;
  }

  return `${authorsString} created a beautiful Haiku!
"${haiku.lines[0]}
 ${haiku.lines[1]}
 ${haiku.lines[2]}"
 - Haiku #${haiku.id}`;
};
