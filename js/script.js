// js/script.js  –  fully integrated

/* ------------------------------------------------------------------ */
/*  CONSTANTS                                                         */
/* ------------------------------------------------------------------ */
const MAX_QUOTE_WORDS = 75; // filter threshold for quote length


/* ------------------------------------------------------------------ */
/*  THEME TOGGLE                                                      */
/* ------------------------------------------------------------------ */
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


/* ------------------------------------------------------------------ */
/*  QUOTE FETCH / PREP                                                */
/* ------------------------------------------------------------------ */
async function fetchQuotes(path = 'data/quotes_hidden_words.json') {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(res.statusText);
    return await res.json();
  } catch (e) {
    console.error('Failed to fetch quotes:', e);
    return [];
  }
}

const countWords = (t) => (t || '').trim().split(/\s+/).length;
function filterShort(quotes) {
  return quotes.filter((q) => countWords(q.text) <= MAX_QUOTE_WORDS);
}
function dayOfYear(d = new Date()) {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d - start) / 8.64e7);
}


/* ------------------------------------------------------------------ */
/*  RENDER HELPERS                                                    */
/* ------------------------------------------------------------------ */
function renderQuote(obj, prefix = '') {
  // prefix '' for today, '-yesterday' for yesterday panel
  const txt  = document.getElementById(`quote-text${prefix}`);
  const auth = document.getElementById(`quote-author${prefix}`);
  const src  =
    prefix === ''
      ? document.getElementById('quote-source-full')
      : document.getElementById('quote-source-full-yesterday');

  if (!txt || !auth || !obj) {
    txt.textContent = 'No verse available.';
    if (src) src.textContent = '';
    return;
  }

  txt.textContent  = obj.text;
  auth.textContent = 'Bahá’u’lláh';

  if (src) {
    // keep it simple – hidden Words reference, or provided
    src.textContent = obj.source || 'The Hidden Words';
  }
}

function renderGregorian(date, elId) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.textContent = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}


/* ------------------------------------------------------------------ */
/*  STATE                                                             */
/* ------------------------------------------------------------------ */
let quotesShort = [];
let quoteTodayObj = null;
let quoteYestObj  = null;


/* ------------------------------------------------------------------ */
/*  INITIALISATION                                                    */
/* ------------------------------------------------------------------ */
async function initPage() {
  const allQuotes = await fetchQuotes();
  if (!allQuotes.length) return;

  quotesShort = filterShort(allQuotes);

  const today     = new Date();
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);

  quoteTodayObj = quotesShort[dayOfYear(today) % quotesShort.length];
  quoteYestObj  = quotesShort[dayOfYear(yesterday) % quotesShort.length];

  renderQuote(quoteTodayObj);                  // today
  renderGregorian(today, 'gregorianDatePanel');
  initializeBadiCalendar(today, 'badiDate');

  // yesterday quote text is rendered only when panel is shown,
  // but we can pre-set the citation so it's ready.
  renderQuote(quoteYestObj, '-yesterday');
}


/* ------------------------------------------------------------------ */
/*  YESTERDAY SHOW / HIDE                                             */
/* ------------------------------------------------------------------ */
function showYesterday() {
  const div = document.getElementById('yesterday-jumbotron-display');
  if (!div) return;

  // quote & author already set by renderQuote(..., '-yesterday')
  div.style.display = 'flex';
  setTimeout(() => div.scrollIntoView({ behavior: 'smooth' }), 30);
}

function hideYesterday() {
  const div = document.getElementById('yesterday-jumbotron-display');
  if (div) div.style.display = 'none';
}


/* ------------------------------------------------------------------ */
/*  COPY-TO-CLIPBOARD                                                 */
/* ------------------------------------------------------------------ */
function copyQuote(obj) {
  if (!obj) return;
  const textToCopy = `${obj.text}\n— Bahá’u’lláh`;
  navigator.clipboard.writeText(textToCopy).then(() => alert('Quote copied!'));
}


/* ------------------------------------------------------------------ */
/*  EVENT WIRING                                                      */
/* ------------------------------------------------------------------ */
function setEvents() {
  const btnToday     = document.getElementById('today-button');      // removed visually but keep guard
  const btnYesterday = document.getElementById('yesterday-button');

  // yesterday button
  btnYesterday?.addEventListener('click', (e) => {
    e.preventDefault();
    showYesterday();
    btnYesterday.classList.add('button-active');
    btnToday?.classList.remove('button-active');
  });

  // today button (if ever re-enabled)
  btnToday?.addEventListener('click', (e) => {
    e.preventDefault();
    hideYesterday();
    document.getElementById('main-jumbotron')
            .scrollIntoView({ behavior: 'smooth' });
    btnToday.classList.add('button-active');
    btnYesterday?.classList.remove('button-active');
  });

  // down-arrow from today panel
  document.getElementById('scroll-down-arrow')
          ?.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('scroll-content-start')
                    .scrollIntoView({ behavior: 'smooth' });
          });

  // click-to-copy
  document.getElementById('quote-text')
          .addEventListener('click', () => copyQuote(quoteTodayObj));
  document.getElementById('quote-text-yesterday')
          .addEventListener('click', () => copyQuote(quoteYestObj));

  // Badíʿ date → toggle Gregorian
  document.getElementById('badiDate')
          .addEventListener('click', () => {
            document.getElementById('gregorianDatePanel')
                    .classList.toggle('visible');
          });

  // yesterday arrow → toggle citation visibility
  document.getElementById('yesterday-arrow')
          ?.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('quote-source-full-yesterday')
                    .classList.toggle('visible');
          });
}

/* ------------------------------------------------------------------ */
/*  DOM READY                                                         */
/* ------------------------------------------------------------------ */
document.addEventListener('DOMContentLoaded', async () => {
  await initPage();
  setEvents();
});
