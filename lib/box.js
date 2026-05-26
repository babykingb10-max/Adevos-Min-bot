const LINE = '─'.repeat(15);

const box = {
  top: (title) => `╭━──━⪨ ${title} ⪩━──━`,
  row: (text) => `┃ ${text}`,
  sep: () => `┃`,
  bottom: () => `╰━${LINE}━`,
};

function buildBox(title, rows) {
  const lines = [box.top(title)];
  for (const r of rows) lines.push(r === null ? box.sep() : box.row(r));
  lines.push(box.bottom());
  return `\`\`\`\n${lines.join('\n')}\n\`\`\``;
}

module.exports = { buildBox };

