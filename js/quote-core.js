// js/quote-core.js
// Shared quote selection / collection core (queue units H2A refactor + H2B-B).
//
// This is the SINGLE JavaScript source of truth for the constants, the selection +
// caching logic, and (since H2B-B) the collection registry and loader that
// js/script.js and js/wallpaper.js used to reimplement independently
// (TECH_DEBT_AND_RISKS.md #1 / #4).
//
// It is a plain classic script — no module system, no bundler, no build step
// (AGENTS.md: "No framework, build system, bundler, package manifest"). It
// attaches one global, `QuoteCore`, and is loaded before its consumers:
//   index.html     → quote-core.js, then badi-init.js, then script.js (all defer)
//   wallpaper.html → quote-core.js, then wallpaper.js
//
// The iOS widget (ios/widget/QuoteStore.swift) reimplements the same logic in
// Swift and is deliberately NOT unified here — a JS module cannot be shared with it.
// Its bundled corpus is generated from the same canonical source by
// scripts/build_collections.py. See docs/RUNBOOK.md §8.
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
  // Legacy single-corpus fetch. Retained because the e-ink wallpaper surface
  // (js/wallpaper.js) still reads the raw corpus at QUOTES_PATH; the homepage reads
  // collections through loadCollection() below. See docs/RUNBOOK.md §8.
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

  /* ---------------------  COLLECTIONS (H2B-B)  -------------------- */
  // The runtime's allow-list of selectable collections (docs/architecture/
  // COLLECTION_CONTRACT.md, accepted as D27). `selectedCollection` can only name an id
  // from this list, so a corrupted or stale localStorage value can never make the page
  // fetch an arbitrary path — an unknown id is a structural failure, not a fetch.
  var COLLECTIONS = [
    { id: 'hidden-words', label: 'The Hidden Words', path: 'data/collections/hidden-words.json' },
    {
      id: 'garden-homepage-preview',
      label: 'Garden of Wisdom (preview)',
      path: 'data/collections/garden-homepage-preview.json'
    }
  ];
  var DEFAULT_COLLECTION_ID = 'hidden-words';
  var SELECTED_COLLECTION_KEY = 'selectedCollection';
  var SUPPORTED_SCHEMA_VERSIONS = [1];

  function collectionById(id) {
    for (var i = 0; i < COLLECTIONS.length; i++) {
      if (COLLECTIONS[i].id === id) return COLLECTIONS[i];
    }
    return null;
  }

  // A failure the caller must classify before deciding what to do with the visitor's
  // stored choice (queue D27 follow-up):
  //   'invalid'   — structurally unusable (unknown id, bad schema, no eligible items):
  //                 clear the stored choice, it will never work.
  //   'transient' — transport/server hiccup (fetch rejected): KEEP the stored choice,
  //                 a network blip must not silently discard a deliberate selection.
  function collectionError(kind, message) {
    var err = new Error(message);
    err.kind = kind;
    return err;
  }

  // Eligibility is a declarative data shape, not a code hook: schema_version 1 defines
  // exactly { "max_words": N }. Anything else is an unrecognized rule and is refused
  // rather than guessed at (a new rule shape needs a schema_version bump).
  function applyEligibility(items, rule) {
    if (!rule || typeof rule !== 'object') {
      throw collectionError('invalid', 'Collection has no default_eligibility rule.');
    }
    var keys = Object.keys(rule);
    if (keys.length !== 1 || keys[0] !== 'max_words' || typeof rule.max_words !== 'number') {
      throw collectionError('invalid', 'Unrecognized eligibility rule: ' + JSON.stringify(rule));
    }
    return items.filter(function (item) {
      return countWords(item.text) <= rule.max_words;
    });
  }

  function collectionProblem(data, meta) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) return 'payload is not a collection object';
    if (data.collection_id !== meta.id) return 'collection_id does not match ' + meta.id;
    if (SUPPORTED_SCHEMA_VERSIONS.indexOf(data.schema_version) === -1) {
      return 'unrecognized schema_version ' + data.schema_version;
    }
    if (!Array.isArray(data.items)) return 'items is not an array';
    return null;
  }

  async function loadCollection(id) {
    var meta = collectionById(id);
    if (!meta) throw collectionError('invalid', 'Unknown collection: ' + id);

    var res;
    try {
      res = await fetch(meta.path, { cache: 'no-store' });
    } catch (e) {
      throw collectionError('transient', 'Collection fetch failed: ' + (e && e.message ? e.message : e));
    }
    if (!res.ok) throw collectionError('invalid', 'Collection ' + id + ' returned HTTP ' + res.status);

    var data;
    try {
      data = await res.json();
    } catch (e) {
      throw collectionError('invalid', 'Collection ' + id + ' is not valid JSON.');
    }

    var problem = collectionProblem(data, meta);
    if (problem) throw collectionError('invalid', 'Collection ' + id + ': ' + problem);

    var eligible = applyEligibility(data.items, data.default_eligibility);
    if (!eligible.length) throw collectionError('invalid', 'Collection ' + id + ' has no eligible items.');

    return { id: id, label: meta.label, descriptor: data, items: eligible };
  }

  /* ---------------  SELECTED-COLLECTION PERSISTENCE  -------------- */
  // Mirrors how `theme` already persists — same mechanism, new key. Absent → default.
  function getSelectedCollectionId() {
    try {
      return global.localStorage.getItem(SELECTED_COLLECTION_KEY) || null;
    } catch (e) {
      return null;
    }
  }

  function setSelectedCollectionId(id) {
    try {
      global.localStorage.setItem(SELECTED_COLLECTION_KEY, id);
    } catch (e) {
      /* storage unavailable — selection is per-page only */
    }
  }

  function clearSelectedCollection() {
    try {
      global.localStorage.removeItem(SELECTED_COLLECTION_KEY);
    } catch (e) {
      /* storage unavailable */
    }
  }

  /* ---------------  COLLECTION-SCOPED CACHE KEYS  ----------------- */
  // dailyVerse:<collection_id>:<date>, plus dailyVerse:lastKey:<collection_id>.
  // The collection id is part of the key by construction, so two collections can never
  // collide on a shared prefix. Old unscoped keys are never migrated; they simply stop
  // being read (contract: "Migration of existing cached keys").
  function collectionCachePrefix(id) {
    return 'dailyVerse:' + id + ':';
  }

  function collectionLastKeyKey(id) {
    return 'dailyVerse:lastKey:' + id;
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
    createQuoteCache: createQuoteCache,
    /* collections (H2B-B) */
    COLLECTIONS: COLLECTIONS,
    DEFAULT_COLLECTION_ID: DEFAULT_COLLECTION_ID,
    SELECTED_COLLECTION_KEY: SELECTED_COLLECTION_KEY,
    collectionById: collectionById,
    loadCollection: loadCollection,
    applyEligibility: applyEligibility,
    getSelectedCollectionId: getSelectedCollectionId,
    setSelectedCollectionId: setSelectedCollectionId,
    clearSelectedCollection: clearSelectedCollection,
    collectionCachePrefix: collectionCachePrefix,
    collectionLastKeyKey: collectionLastKeyKey
  };

  global.QuoteCore = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
