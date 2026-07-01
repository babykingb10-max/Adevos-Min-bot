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

// ── Kwa console log tu ──
function logBox(title, rows, color) {
  const chalk = require('chalk');
  const colorFn = color ? (chalk[color] || chalk.white) : chalk.white;
  const lines = [box.top(title)];
  for (const r of rows) lines.push(r === null ? box.sep() : box.row(r));
  lines.push(box.bottom());
  console.log(colorFn(lines.join('\n')));
}

module.exports = { buildBox, logBox };
