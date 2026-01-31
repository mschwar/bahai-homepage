// js/script.js – integrated

/* -------------------------  CONSTANTS  -------------------------- */
const MAX_QUOTE_WORDS = 75;
const QUOTES_PATH = 'data/quotes_hidden_words.json';
const CACHE_PREFIX = 'dailyVerse:';
const CACHE_LAST_KEY = 'dailyVerse:lastKey';
const COPY_STATUS_TIMEOUT_MS = 1600;

/* -------------------------  DOM HOOKS  -------------------------- */
const dom = {
  themeToggleBtn: document.getElementById('theme-toggle-button'),
  quoteText: document.getElementById('quote-text'),
  quoteAuthor: document.getElementById('quote-author'),
  quoteSource: document.getElementById('quote-source-full'),
  quoteTextYesterday: document.getElementById('quote-text-yesterday'),
  quoteAuthorYesterday: document.getElementById('quote-author-yesterday'),
  quoteSourceYesterday: document.getElementById('quote-source-full-yesterday'),
  badiDate: document.getElementById('badiDate'),
  gregorianDatePanel: document.getElementById('gregorianDatePanel'),
  locationMessage: document.getElementById('location-message'),
  scrollDownArrow: document.getElementById('scroll-down-arrow'),
  yesterdayButton: document.getElementById('yesterday-button'),
  yesterdaySection: document.getElementById('yesterday-jumbotron-display'),
  yesterdayArrow: document.getElementById('yesterday-arrow'),
  copyButton: document.getElementById('copy-button'),
  copyStatus: document.getElementById('copy-status'),
  copyButtonYesterday: document.getElementById('copy-button-yesterday'),
  copyStatusYesterday: document.getElementById('copy-status-yesterday'),
  statusMessage: document.getElementById('status-message'),
  retryButton: document.getElementById('retry-button')
};

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const scrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';

/* -------------------------  THEME TOGGLE  ----------------------- */
const savedTheme = localStorage.getItem('theme');
document.body.classList.add(savedTheme || 'light-mode');

dom.themeToggleBtn?.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  document.body.classList.toggle('light-mode');
  localStorage.setItem(
    'theme',
    document.body.classList.contains('dark-mode') ? 'dark-mode' : 'light-mode'
  );
});

/* --------------------  QUOTE FETCH / PREP  ---------------------- */
async function fetchQuotes(path = QUOTES_PATH) {
  const res = await fetch(path, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Quote fetch failed: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  if (!Array.isArray(data)) {
    throw new Error('Quote payload is not an array.');
  }
  return data;
}

const countWords = (t) => (t || '').trim().split(/\s+/).filter(Boolean).length;
const filterShort = (list) => list.filter(q => countWords(q.text) <= MAX_QUOTE_WORDS);
const dayOfYear = d => Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 8.64e7);

/* ----------------------  CACHE HELPERS  ------------------------- */
function getLocalDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function readCachedQuote(key) {
  const raw = localStorage.getItem(`${CACHE_PREFIX}${key}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveCachedQuote(key, quote) {
  if (!key || !quote) return;
  localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(quote));
  localStorage.setItem(CACHE_LAST_KEY, key);
}

/* ----------------------  RENDER HELPERS  ------------------------ */
function renderQuote(obj, suffix = '') {
  const txt = document.getElementById(`quote-text${suffix}`);
  const auth = document.getElementById(`quote-author${suffix}`);
  const src = document.getElementById(
    suffix ? 'quote-source-full-yesterday' : 'quote-source-full'
  );

  if (!txt || !auth) return;

  if (!obj) {
    txt.textContent = 'No verse available.';
    auth.textContent = '';
    if (src) src.textContent = '';
    return;
  }

  txt.textContent = obj.text;
  auth.textContent = obj.author || 'Bahá’u’lláh';
  if (src) src.textContent = obj.source || 'The Hidden Words';
}

function renderGregorian(d, elId) {
  const el = document.getElementById(elId);
  if (el) {
    el.textContent = d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}

function setStatus(message, { showRetry = false } = {}) {
  if (dom.statusMessage) dom.statusMessage.textContent = message || '';
  if (dom.retryButton) dom.retryButton.hidden = !showRetry;
}

function setCopyStatus(el, message) {
  if (!el) return;
  el.textContent = message;
  window.setTimeout(() => {
    if (el.textContent === message) el.textContent = '';
  }, COPY_STATUS_TIMEOUT_MS);
}

function setLocationMessage(message) {
  if (!dom.locationMessage) return;
  dom.locationMessage.textContent = message || '';
}

function setButtonEnabled(button, enabled) {
  if (!button) return;
  button.disabled = !enabled;
}

/* --------------------------  STATE  ----------------------------- */
let quotes = [];
let todayObj = null;
let yestObj = null;
let pendingBadiKey = null;
let badiInitialized = false;

/* ----------------------  INITIALISE PAGE  ----------------------- */
function bootFromCache() {
  const todayKey = getLocalDateKey(new Date());
  const cached = readCachedQuote(todayKey);
  if (cached) {
    todayObj = cached;
    renderQuote(cached, '');
    setButtonEnabled(dom.copyButton, true);
  }
  return todayKey;
}

async function initPage() {
  setStatus('');
  setButtonEnabled(dom.copyButton, false);
  setButtonEnabled(dom.copyButtonYesterday, false);
  setButtonEnabled(dom.yesterdayButton, false);

  const today = new Date();
  const yest = new Date();
  yest.setDate(yest.getDate() - 1);

  const todayKey = bootFromCache();
  renderGregorian(today, 'gregorianDatePanel');

  try {
    const all = await fetchQuotes();
    quotes = filterShort(all);
    if (!quotes.length) throw new Error('No quotes remain after filtering.');

    todayObj = quotes[dayOfYear(today) % quotes.length];
    yestObj = quotes[dayOfYear(yest) % quotes.length];

    renderQuote(todayObj, '');
    renderQuote(yestObj, '-yesterday');
    saveCachedQuote(todayKey, todayObj);

    if (pendingBadiKey) saveCachedQuote(pendingBadiKey, todayObj);

    setButtonEnabled(dom.copyButton, true);
    setButtonEnabled(dom.copyButtonYesterday, true);
    setButtonEnabled(dom.yesterdayButton, true);
  } catch (error) {
    console.error('Quote load failed:', error);
    if (!todayObj) renderQuote(null, '');
    setStatus('Unable to load verses. Check your connection and try again.', { showRetry: true });
  }
}

function startBadiCalendar() {
  if (badiInitialized) return;
  if (typeof initializeBadiCalendar !== 'function') {
    console.error('Badíʿ date initializer missing.');
    if (dom.badiDate) dom.badiDate.textContent = 'Badíʿ date unavailable.';
    setLocationMessage('Enable location for sunset-accurate Badíʿ date. Showing Gregorian date only.');
    return;
  }
  badiInitialized = true;

  initializeBadiCalendar(new Date(), 'badiDate', {
    onReady: (info, badiKey) => {
      pendingBadiKey = badiKey;
      setLocationMessage('');
      if (todayObj && pendingBadiKey) saveCachedQuote(pendingBadiKey, todayObj);
    },
    onFailure: (reason) => {
      console.warn('Badíʿ date unavailable:', reason);
      setLocationMessage('Enable location for sunset-accurate Badíʿ date. Showing Gregorian date only.');
    }
  });
}

/* --------------------  COPY TO CLIPBOARD  ----------------------- */
async function copyQuote(quote, statusEl) {
  if (!quote) return;
  const author = quote.author || 'Bahá’u’lláh';
  const text = `${quote.text}\n— ${author}`;

  try {
    await navigator.clipboard.writeText(text);
    setCopyStatus(statusEl, 'Copied.');
    return;
  } catch (err) {
    try {
      const temp = document.createElement('textarea');
      temp.value = text;
      temp.setAttribute('readonly', '');
      temp.style.position = 'absolute';
      temp.style.left = '-9999px';
      document.body.appendChild(temp);
      temp.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(temp);
      setCopyStatus(statusEl, ok ? 'Copied.' : 'Copy failed.');
    } catch (fallbackErr) {
      console.warn('Copy failed:', fallbackErr);
      setCopyStatus(statusEl, 'Copy failed.');
    }
  }
}

/* -----------------------------  UI  ----------------------------- */
function setEvents() {
  dom.scrollDownArrow?.addEventListener('click', () => {
    document.querySelector('.panel-date')?.scrollIntoView({ behavior: scrollBehavior });
  });

  dom.yesterdayButton?.addEventListener('click', () => {
    if (!dom.yesterdaySection) return;
    dom.yesterdaySection.hidden = false;
    dom.yesterdayButton.setAttribute('aria-expanded', 'true');
    dom.yesterdaySection.scrollIntoView({ behavior: scrollBehavior });
  });

  dom.yesterdayArrow?.addEventListener('click', () => {
    dom.quoteSourceYesterday?.classList.toggle('visible');
    const expanded = dom.quoteSourceYesterday?.classList.contains('visible');
    dom.yesterdayArrow.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  });

  dom.copyButton?.addEventListener('click', () => copyQuote(todayObj, dom.copyStatus));
  dom.copyButtonYesterday?.addEventListener('click', () => copyQuote(yestObj, dom.copyStatusYesterday));

  dom.badiDate?.addEventListener('click', () => {
    dom.gregorianDatePanel?.classList.toggle('visible');
  });

  dom.badiDate?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      dom.gregorianDatePanel?.classList.toggle('visible');
    }
  });

  dom.retryButton?.addEventListener('click', () => initPage());
}

document.addEventListener('DOMContentLoaded', async () => {
  startBadiCalendar();
  await initPage();
  setEvents();
});
