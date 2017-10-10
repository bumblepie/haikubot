exports.formatHaiku = haiku => `<@${haiku.author}> has created a beautiful Haiku!
"${haiku.lines[0]}
 ${haiku.lines[1]}
 ${haiku.lines[2]}"
 - Haiku #${haiku.id}`;
