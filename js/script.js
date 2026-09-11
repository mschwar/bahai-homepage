// js/script.js – integrated

/* -------------------------  CONSTANTS  -------------------------- */
// Selection + caching come from the shared core (js/quote-core.js), loaded
// before this file. Only page-specific values are declared here.
const {
  DEFAULT_AUTHOR,
  filterShort,
  selectForDate,
  getLocalDateKey,
  fetchQuotes,
  createQuoteCache
} = window.QuoteCore;

const CACHE_PREFIX = 'dailyVerse:';
const CACHE_LAST_KEY = 'dailyVerse:lastKey';
const COPY_STATUS_TIMEOUT_MS = 1600;

/* -------------------------  DOM HOOKS  -------------------------- */
const dom = {
  themeToggleBtn: document.getElementById('theme-toggle-button'),
  sourceToggleBtn: document.getElementById('source-toggle-button'),
  sourceToggle: document.querySelector('.source-toggle'),
  sourceMenu: document.getElementById('source-menu'),
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
let autoScrollTriggered = false;

/* -------------------------  THEME TOGGLE  ----------------------- */
const savedTheme = localStorage.getItem('theme');
// Replace rather than append so the body carries exactly ONE of
// light-mode / dark-mode even after a reload to a saved theme (queue C7).
document.body.classList.remove('light-mode', 'dark-mode');
document.body.classList.add(savedTheme || 'light-mode');

dom.themeToggleBtn?.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  document.body.classList.toggle('light-mode');
  localStorage.setItem(
    'theme',
    document.body.classList.contains('dark-mode') ? 'dark-mode' : 'light-mode'
  );
});

/* ----------------------  SOURCE TOGGLE (placeholder)  ----------- */
/* Chrome only: the menu does not change the corpus. Wiring is H2B. */
function setSourceMenu(open) {
  if (!dom.sourceMenu || !dom.sourceToggleBtn) return;
  dom.sourceMenu.hidden = !open;
  dom.sourceToggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  if (open) {
    const selected =
      dom.sourceMenu.querySelector('[aria-selected="true"]') ||
      dom.sourceMenu.querySelector('[data-source]');
    selected?.focus();
  }
}

dom.sourceToggleBtn?.addEventListener('click', (event) => {
  event.stopPropagation();
  setSourceMenu(Boolean(dom.sourceMenu?.hidden));
});

dom.sourceToggle?.addEventListener('click', (event) => event.stopPropagation());

dom.sourceMenu?.addEventListener('click', (event) => {
  const option = event.target.closest('[data-source]');
  if (!option) return;
  setSourceMenu(false);
  dom.sourceToggleBtn?.focus();
});

document.addEventListener('click', () => setSourceMenu(false));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setSourceMenu(false);
});

/* ----------------------  CACHE (shared core)  ------------------- */
// Namespace-narrowed view of the shared cache: reads/writes `dailyVerse:<key>`
// and records `dailyVerse:lastKey`, exactly as the inline implementation did.
const { read: readCachedQuote, save: saveCachedQuote } =
  createQuoteCache(CACHE_PREFIX, CACHE_LAST_KEY);

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
  auth.textContent = obj.author || DEFAULT_AUTHOR;
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

    todayObj = selectForDate(quotes, today);
    yestObj = selectForDate(quotes, yest);

    renderQuote(todayObj, '');
    renderQuote(yestObj, '-yesterday');
    saveCachedQuote(todayKey, todayObj);

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
      // Tech-debt #7: the Badíʿ-day key is never read, so we do NOT persist
      // today's verse under it — that write could render a mismatched verse on a
      // later Badíʿ cache hit if the date boundary shifted. The Gregorian key is
      // the only authoritative cache for reads. `badiKey` is still supplied by
      // js/badi-init.js for callers that want it; this one no longer needs it.
      setLocationMessage('');
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
  const author = quote.author || DEFAULT_AUTHOR;
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

  document.addEventListener('mousemove', (event) => {
    if (autoScrollTriggered) return;
    if (window.scrollY > 10) return;
    const threshold = window.innerHeight - 60;
    if (event.clientY >= threshold) {
      autoScrollTriggered = true;
      document.querySelector('.panel-date')?.scrollIntoView({ behavior: scrollBehavior });
    }
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
  dom.quoteText?.addEventListener('click', () => copyQuote(todayObj, dom.copyStatus));
  dom.quoteTextYesterday?.addEventListener('click', () => copyQuote(yestObj, dom.copyStatusYesterday));

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
