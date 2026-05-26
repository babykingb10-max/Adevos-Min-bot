const axios = require('axios');

const BASE = 'https://apis.xwolf.space';
const TIMEOUT = 20000;

const http = axios.create({ baseURL: BASE, timeout: TIMEOUT });

async function search(query) {
  const res = await http.get('/api/search', { params: { q: query } });
  return res.data;
}

async function trending() {
  const res = await http.get('/api/trending');
  return res.data;
}

async function lyrics(query) {
  const res = await http.get('/download/lyrics', { params: { q: query } });
  return res.data;
}

async function downloadMp3(query) {
  const res = await http.get('/download/mp3', { params: { q: query } });
  return res.data;
}

async function downloadMp4(query) {
  const res = await http.get('/download/ytmp4', { params: { q: query } });
  return res.data;
}

async function downloadBoth(query) {
  const res = await http.get('/download/ytmp5', { params: { q: query } });
  return res.data;
}

module.exports = { search, trending, lyrics, downloadMp3, downloadMp4, downloadBoth };

