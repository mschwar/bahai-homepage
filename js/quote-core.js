// js/quote-core.js
// Shared quote selection / collection core (queue unit H2A, refactor half).
//
// This is the SINGLE JavaScript source of truth for the constants and the
// selection + caching logic that js/script.js and js/wallpaper.js used to
// reimplement independently (TECH_DEBT_AND_RISKS.md #1 / #4).
//
// It is a plain classic script — no module system, no bundler, no build step
// (AGENTS.md: "No framework, build system, bundler, package manifest"). It
// attaches one global, `QuoteCore`, and is loaded before its consumers:
//   index.html     → quote-core.js, then badi-init.js, then script.js (all defer)
//   wallpaper.html → quote-core.js, then wallpaper.js
//
// The iOS widget (ios/widget/QuoteStore.swift) reimplements the same logic in
// Swift and is deliberately NOT unified here — the packet for H2A defers that to
// the H2B collection contract. See docs/queue.md H2A/H2B.
(function (global) {
  'use strict';

  /* -------------------------  CONSTANTS  -------------------------- */
  var MAX_QUOTE_WORDS = 75;
  var QUOTES_PATH = 'data/quotes_hidden_words.json';
  var DEFAULT_AUTHOR = 'Bahá’u’lláh';

  /* ---------------------  SELECTION HELPERS  ---------------------- */
  var countWords = function (t) {
    return (t || '').trim().split(/\s+/).filter(Boolean).length;
  };

  var filterShort = function (list) {
    return list.filter(function (q) { return countWords(q.text) <= MAX_QUOTE_WORDS; });
  };

  var dayOfYear = function (d) {
    return Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 8.64e7);
  };

  // Deterministic selection: the passage for a date is list[dayOfYear % len].
  // No randomness, no per-visitor state (product doctrine: one passage, not a feed).
  var selectForDate = function (list, date) {
    if (!list || !list.length) return undefined;
    return list[dayOfYear(date) % list.length];
  };

  /* -----------------------  DATE HELPERS  ------------------------- */
  function getLocalDateKey(date) {
    var y = date.getFullYear();
    var m = String(date.getMonth() + 1).padStart(2, '0');
    var d = String(date.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }

  function formatDateLabel(date) {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /* ----------------------  CORPUS FETCH  -------------------------- */
  async function fetchQuotes(path) {
    var res = await fetch(path || QUOTES_PATH, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error('Quote fetch failed: ' + res.status + ' ' + res.statusText);
    }
    var data = await res.json();
    if (!Array.isArray(data)) {
      throw new Error('Quote payload is not an array.');
    }
    return data;
  }

  /* ----------------------  CACHE HELPERS  ------------------------- */
  // Each surface keeps its own cache namespace (script.js: 'dailyVerse:',
  // wallpaper.js: 'dailyWallpaper:') so the two never collide. Pass lastKeyKey
  // to also record the most recently written key under that storage key.
  function createQuoteCache(prefix, lastKeyKey) {
    function read(key) {
      var raw = global.localStorage.getItem(prefix + key);
      if (!raw) return null;
      try {
        return JSON.parse(raw);
      } catch (e) {
        return null;
      }
    }

    function save(key, quote) {
      if (!key || !quote) return;
      global.localStorage.setItem(prefix + key, JSON.stringify(quote));
      if (lastKeyKey) global.localStorage.setItem(lastKeyKey, key);
    }

    return { read: read, save: save };
  }

  var api = {
    MAX_QUOTE_WORDS: MAX_QUOTE_WORDS,
    QUOTES_PATH: QUOTES_PATH,
    DEFAULT_AUTHOR: DEFAULT_AUTHOR,
    countWords: countWords,
    filterShort: filterShort,
    dayOfYear: dayOfYear,
    selectForDate: selectForDate,
    getLocalDateKey: getLocalDateKey,
    formatDateLabel: formatDateLabel,
    fetchQuotes: fetchQuotes,
    createQuoteCache: createQuoteCache
  };

  global.QuoteCore = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
