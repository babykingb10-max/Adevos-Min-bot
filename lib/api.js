const axios = require('axios');

const BASE = 'https://apis.xwolf.space';
const TIMEOUT = 20000;
const API_KEY = 'wxa_f_231e817e19';

const http = axios.create({
  baseURL: BASE,
  timeout: TIMEOUT,
  headers: { 'x-api-key': API_KEY }
});

async function search(query) {
  try {
    const res = await http.get('/api/search', { params: { q: query } });
    return res.data;
  } catch (err) {
    throw new Error(`Search failed: ${err.response?.data?.message || err.message}`);
  }
}

async function trending() {
  try {
    const res = await http.get('/api/trending');
    return res.data;
  } catch (err) {
    throw new Error(`Trending failed: ${err.response?.data?.message || err.message}`);
  }
}

async function lyrics(query) {
  try {
    const res = await http.get('/download/lyrics', { params: { q: query } });
    return res.data;
  } catch (err) {
    throw new Error(`Lyrics failed: ${err.response?.data?.message || err.message}`);
  }
}

async function downloadMp3(query) {
  try {
    const res = await http.get('/download/mp3', { params: { q: query } });
    return res.data;
  } catch (err) {
    throw new Error(`MP3 download failed: ${err.response?.data?.message || err.message}`);
  }
}

async function downloadMp4(query) {
  try {
    const res = await http.get('/download/ytmp4', { params: { q: query } });
    return res.data;
  } catch (err) {
    throw new Error(`MP4 download failed: ${err.response?.data?.message || err.message}`);
  }
}

async function downloadBoth(query) {
  try {
    const res = await http.get('/download/ytmp5', { params: { q: query } });
    return res.data;
  } catch (err) {
    throw new Error(`Download failed: ${err.response?.data?.message || err.message}`);
  }
}

module.exports = { search, trending, lyrics, downloadMp3, downloadMp4, downloadBoth };
