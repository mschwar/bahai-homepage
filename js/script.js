// js/script.js – integrated

/* -------------------------  CONSTANTS  -------------------------- */
// Selection + caching + the collection registry come from the shared core
// (js/quote-core.js), loaded before this file. Only page-specific values live here.
const {
  DEFAULT_AUTHOR,
  DEFAULT_COLLECTION_ID,
  selectForDate,
  getLocalDateKey,
  loadCollection,
  getSelectedCollectionId,
  setSelectedCollectionId,
  clearSelectedCollection,
  collectionById,
  collectionCachePrefix,
  collectionLastKeyKey,
  createQuoteCache
} = window.QuoteCore;

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

/* ---------------------  SOURCE MENU (H2B-B)  -------------------- */
/* The menu lists QuoteCore.COLLECTIONS (hidden-words is the default); picking one
   switches the corpus in place. No page reload, no settings surface: the same
   two-button disclosure chrome shipped by D22/D23, now wired. */
function setSourceMenu(open) {
  if (!dom.sourceMenu || !dom.sourceToggleBtn) return;
  const wasOpen = !dom.sourceMenu.hidden;
  if (!open && !wasOpen) return;
  const focusWasInMenu = Boolean(dom.sourceMenu.contains(document.activeElement));
  dom.sourceMenu.hidden = !open;
  dom.sourceToggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  if (!open && wasOpen && focusWasInMenu) dom.sourceToggleBtn.focus();
}

function setCurrentSource(collectionId) {
  if (!dom.sourceMenu) return;
  dom.sourceMenu.querySelectorAll('[data-source]').forEach((button) => {
    if (button.getAttribute('data-source') === collectionId) button.setAttribute('aria-current', 'true');
    else button.removeAttribute('aria-current');
  });
}

function collectionLabel(collectionId) {
  const meta = collectionById(collectionId);
  return meta ? meta.label : collectionId;
}

dom.sourceToggleBtn?.addEventListener('click', (event) => {
  event.stopPropagation();
  setSourceMenu(Boolean(dom.sourceMenu?.hidden));
});

dom.sourceToggle?.addEventListener('click', (event) => event.stopPropagation());

dom.sourceToggle?.addEventListener('focusout', (event) => {
  const next = event.relatedTarget;
  if (next && dom.sourceToggle.contains(next)) return;
  setSourceMenu(false);
});

dom.sourceMenu?.addEventListener('click', (event) => {
  const option = event.target.closest('[data-source]');
  if (!option) return;
  const picked = option.getAttribute('data-source');
  setSourceMenu(false);
  if (picked === currentCollectionId) return;
  // Persist before loading: a collection that turns out to be only *transiently*
  // unavailable must keep the visitor's choice (D27).
  setSelectedCollectionId(picked);
  initPage(picked);
});

document.addEventListener('click', () => setSourceMenu(false));
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (dom.sourceMenu?.hidden) return;
  setSourceMenu(false);
});

/* ----------------------  CACHE (shared core)  ------------------- */
// Collection-scoped view of the shared cache: reads/writes
// `dailyVerse:<collection_id>:<date>` and records `dailyVerse:lastKey:<collection_id>`.
function cacheFor(collectionId) {
  return createQuoteCache(
    collectionCachePrefix(collectionId),
    collectionLastKeyKey(collectionId)
  );
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
  auth.textContent = obj.author || DEFAULT_AUTHOR;
  if (src) src.textContent = obj.source_ref || obj.source || '';
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
let currentCollectionId = null;
let todayObj = null;
let yestObj = null;
let badiInitialized = false;

/* ----------------------  INITIALISE PAGE  ----------------------- */
// Load one collection and render its today/yesterday within it (never mixed: both
// always come from the same currently-selected collection). Rethrows the classified
// error from QuoteCore.loadCollection so the caller can decide about the stored choice.
async function showCollection(collectionId, today, yest, todayKey) {
  const loaded = await loadCollection(collectionId);
  currentCollectionId = loaded.id;
  todayObj = selectForDate(loaded.items, today);
  yestObj = selectForDate(loaded.items, yest);

  renderQuote(todayObj, '');
  renderQuote(yestObj, '-yesterday');
  cacheFor(loaded.id).save(todayKey, todayObj);

  setButtonEnabled(dom.copyButton, true);
  setButtonEnabled(dom.copyButtonYesterday, true);
  setButtonEnabled(dom.yesterdayButton, true);
  setCurrentSource(loaded.id);
}

async function initPage(collectionId) {
  setStatus('');
  setButtonEnabled(dom.copyButton, false);
  setButtonEnabled(dom.copyButtonYesterday, false);
  setButtonEnabled(dom.yesterdayButton, false);

  const today = new Date();
  const yest = new Date();
  yest.setDate(yest.getDate() - 1);
  const todayKey = getLocalDateKey(today);
  renderGregorian(today, 'gregorianDatePanel');

  const targetId = collectionId || getSelectedCollectionId() || DEFAULT_COLLECTION_ID;

  // Boot from the selected collection's own cache first — the Gregorian key is the only
  // authoritative read, and this is what keeps an offline visitor's verse on screen.
  const cached = cacheFor(targetId).read(todayKey);
  if (cached) {
    todayObj = cached;
    renderQuote(cached, '');
    setButtonEnabled(dom.copyButton, true);
  }

  try {
    await showCollection(targetId, today, yest, todayKey);
  } catch (error) {
    console.error(`Collection load failed (${targetId}):`, error);
    const structural = error && error.kind === 'invalid';
    // D27 follow-up: a structurally broken collection is cleared so the failure does not
    // repeat on every load; a transient fetch failure KEEPS the visitor's choice.
    if (structural) clearSelectedCollection();

    if (targetId === DEFAULT_COLLECTION_ID) {
      if (!todayObj) renderQuote(null, '');
      setStatus('Unable to load verses. Check your connection and try again.', { showRetry: true });
      return;
    }

    // A second collection failed but Hidden Words is still healthy: the page must never be
    // left on "No verse available" (contract). Reuse the existing inline status pattern.
    setStatus(
      structural
        ? `“${collectionLabel(targetId)}” is unavailable. Showing The Hidden Words.`
        : `“${collectionLabel(targetId)}” could not be loaded. Showing The Hidden Words.`,
      { showRetry: !structural }
    );
    try {
      await showCollection(DEFAULT_COLLECTION_ID, today, yest, todayKey);
    } catch (fallbackError) {
      console.error('Hidden Words fallback failed:', fallbackError);
      if (!todayObj) renderQuote(null, '');
      setStatus('Unable to load verses. Check your connection and try again.', { showRetry: true });
    }
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
