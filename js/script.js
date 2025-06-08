/* ---------- CONSTANTS ---------- */
const MAX_QUOTE_WORDS = 75;

/* ---------- THEME ---------- */
const themeToggleBtn = document.getElementById('theme-toggle-button');
const savedTheme = localStorage.getItem('theme');
document.body.classList.add(savedTheme || 'light-mode');
themeToggleBtn?.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  document.body.classList.toggle('light-mode');
  localStorage.setItem(
    'theme',
    document.body.classList.contains('dark-mode') ? 'dark-mode' : 'light-mode'
  );
});

/* ---------- QUOTE FETCH / PREP ---------- */
async function fetchQuotes(path = 'data/quotes_hidden_words.json') {
  try {
    const r = await fetch(path);
    return r.ok ? await r.json() : [];
  } catch {
    return [];
  }
}
const countWords = t => (t || '').trim().split(/\s+/).length;
function filterShort(qs) {
  return qs.filter(q => countWords(q.text) <= MAX_QUOTE_WORDS);
}
function dayOfYear(d = new Date()) {
  return Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 8.64e7);
}

/* ---------- RENDER HELPERS ---------- */
function renderQuote(obj, prefix = '') {
  const txt  = document.getElementById(`quote-text${prefix}`);
  const auth = document.getElementById(`quote-author${prefix}`);
  const src  = prefix === '' ? document.getElementById('quote-source-full') : null;

  if (!txt || !auth || !obj) {
    if (txt)  txt.textContent = 'No verse available.';
    if (src)  src.textContent = '';
    return;
  }

  txt.textContent  = obj.text;
  auth.textContent = 'Bahá’u’lláh';
  if (src) src.textContent = obj.source || 'The Hidden Words';
}
function renderGregorian(date, elId) {
  const el = document.getElementById(elId);
  if (el)
    el.textContent = date.toLocaleDateString(
      'en-US',
      { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    );
}

/* ---------- STATE ---------- */
let quotesShort = [];
let quoteTodayObj = null;
let quoteYestObj = null;

/* ---------- INITIALISE ---------- */
async function initPage() {
  const all = await fetchQuotes();
  if (!all.length) return;

  quotesShort = filterShort(all);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  quoteTodayObj = quotesShort[dayOfYear(today) % quotesShort.length];
  quoteYestObj  = quotesShort[dayOfYear(yesterday) % quotesShort.length];

  renderQuote(quoteTodayObj);
  renderGregorian(today, 'gregorianDatePanel');
  initializeBadiCalendar(today, 'badiDate');
}
document.addEventListener('DOMContentLoaded', () => {
  initPage();
  setEvents();
});

/* ---------- YESTERDAY SHOW/HIDE ---------- */
function showYesterday() {
  renderQuote(quoteYestObj, '-yesterday');
  const div = document.getElementById('yesterday-jumbotron-display');
  div.style.display = 'flex';
  setTimeout(() => div.scrollIntoView({ behavior: 'smooth' }), 30);
}
function hideYesterday() {
  document.getElementById('yesterday-jumbotron-display').style.display = 'none';
}

/* ---------- EVENTS ---------- */
function copyQuote(obj) {
  if (!obj) return;
  navigator.clipboard
    .writeText(`${obj.text}\n— Bahá’u’lláh`)
    .then(() => alert('Quote copied!'));
}
function setEvents() {
  const btnToday = document.getElementById('today-button');
  const btnYesterday = document.getElementById('yesterday-button');

  btnYesterday?.addEventListener('click', e => {
    e.preventDefault();
    showYesterday();
    btnYesterday.classList.add('button-active');
    btnToday.classList.remove('button-active');
  });
  btnToday?.addEventListener('click', e => {
    e.preventDefault();
    hideYesterday();
    document.getElementById('main-jumbotron').scrollIntoView({ behavior: 'smooth' });
    btnToday.classList.add('button-active');
    btnYesterday.classList.remove('button-active');
  });

  document
    .getElementById('scroll-down-arrow')
    ?.addEventListener('click', e => {
      e.preventDefault();
      document.getElementById('scroll-content-start').scrollIntoView({ behavior: 'smooth' });
    });

  document.getElementById('quote-text').addEventListener('click', () => copyQuote(quoteTodayObj));
  document
    .getElementById('quote-text-yesterday')
    .addEventListener('click', () => copyQuote(quoteYestObj));

  /* Badíʿ date drop-down */
  document.getElementById('badiDate').addEventListener('click', () => {
    document.getElementById('gregorianDatePanel').classList.toggle('visible');
  });
}
