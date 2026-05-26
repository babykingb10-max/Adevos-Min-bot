const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'data', 'store.json');

function load() {
  try {
    if (fs.existsSync(FILE)) {
      return JSON.parse(fs.readFileSync(FILE, 'utf8'));
    }
  } catch {}
  return {};
}

function save(data) {
  try {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('[store] Save failed:', err.message);
  }
}

let db = load();

function get(key, fallback = null) {
  return db[key] !== undefined ? db[key] : fallback;
}

function set(key, value) {
  db[key] = value;
  save(db);
}

function del(key) {
  delete db[key];
  save(db);
}

function getChat(chatId, ns, fallback = {}) {
  const key = `${ns}:${chatId}`;
  return get(key, fallback);
}

function setChat(chatId, ns, value) {
  set(`${ns}:${chatId}`, value);
}

function getUser(chatId, userId, ns, fallback = {}) {
  const data = getChat(chatId, ns, {});
  return data[userId] !== undefined ? data[userId] : fallback;
}

function setUser(chatId, userId, ns, value) {
  const data = getChat(chatId, ns, {});
  data[userId] = value;
  setChat(chatId, ns, data);
}

module.exports = { get, set, del, getChat, setChat, getUser, setUser };
