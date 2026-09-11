(() => {
  const { useEffect, useRef, useState } = React;

  // Selection + caching come from the shared core (js/quote-core.js), loaded
  // before this file. This surface uses a tighter word cap than the homepage
  // so every lock-screen verse fits in full (owner: e-ink layout 3, ≤35 words).
  const {
    DEFAULT_AUTHOR,
    selectForDate,
    getLocalDateKey,
    formatDateLabel,
    fetchQuotes,
    createQuoteCache
  } = window.QuoteCore;

  const CACHE_PREFIX = 'dailyEink:';
  const LOCK_MAX_WORDS = 35;

  const SIZES = {
    'iphone-15-pro': { label: 'iPhone 15 Pro (1179 × 2556)', width: 1179, height: 2556 },
    'iphone-15-pro-max': { label: 'iPhone 15 Pro Max (1290 × 2796)', width: 1290, height: 2796 },
    'iphone-14-13-12': { label: 'iPhone 14/13/12 (1170 × 2532)', width: 1170, height: 2532 }
  };

  // E-ink paper. Not the homepage beige: this is the lock-screen surface.
  const PAPER = {
    bg: '#efe8d6',
    text: '#1f1c16',
    muted: '#6b6456',
    rule: 'rgba(31, 28, 22, 0.35)'
  };

  const VERSE_FACE = 'Cormorant Garamond';
  const verseFont = (size, italic) =>
    `${italic ? 'italic ' : ''}400 ${size}px "${VERSE_FACE}", Georgia, serif`;

  const countWords = (t) => (t || '').trim().split(/\s+/).filter(Boolean).length;
  const filterLock = (list) => list.filter((q) => countWords(q.text) <= LOCK_MAX_WORDS);

  const { read: readCachedQuote, save: saveCachedQuote } = createQuoteCache(CACHE_PREFIX);

  const wrapText = (ctx, text, maxWidth) => {
    const words = (t => (t || '').split(/\s+/).filter(Boolean))(text);
    const lines = [];
    let line = '';
    words.forEach((word) => {
      const testLine = line ? `${line} ${word}` : word;
      if (ctx.measureText(testLine).width <= maxWidth || !line) {
        line = testLine;
      } else {
        lines.push(line);
        line = word;
      }
    });
    if (line) lines.push(line);
    return lines;
  };

  const fitText = (ctx, text, maxWidth, maxHeight, startSize, minSize, lineHeight) => {
    for (let size = startSize; size >= minSize; size -= 2) {
      ctx.font = verseFont(size, false);
      const lines = wrapText(ctx, text, maxWidth);
      if (lines.length * size * lineHeight <= maxHeight) {
        return { size, lines };
      }
    }
    ctx.font = verseFont(minSize, false);
    return { size: minSize, lines: wrapText(ctx, text, maxWidth) };
  };

  // PNG only: paper + verse. No clock — iOS draws that. Top ~40% stays empty
  // so the system time sits on blank stock.
  const drawWallpaper = (ctx, config) => {
    const { width, height, quote, author } = config;

    ctx.fillStyle = PAPER.bg;
    ctx.fillRect(0, 0, width, height);

    const margin = Math.round(width * 0.092);
    const maxWidth = width - margin * 2;
    const top = Math.round(height * 0.40);
    const maxHeight = Math.round(height * 0.38);
    const startSize = Math.round(width * 0.048);
    const minSize = Math.round(width * 0.032);
    const lineHeight = 1.36;

    const fitted = fitText(ctx, quote, maxWidth, maxHeight, startSize, minSize, lineHeight);
    const quoteHeight = fitted.lines.length * fitted.size * lineHeight;
    const authorSize = Math.round(fitted.size * 0.62);
    const ruleW = Math.round(width * 0.072);
    const ruleY = top - Math.round(fitted.size * 0.85);

    ctx.fillStyle = PAPER.rule;
    ctx.fillRect(margin, ruleY, ruleW, 1);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = PAPER.text;
    ctx.font = verseFont(fitted.size, false);
    fitted.lines.forEach((line, index) => {
      ctx.fillText(line, margin, top + index * fitted.size * lineHeight);
    });

    ctx.fillStyle = PAPER.muted;
    ctx.font = verseFont(authorSize, true);
    ctx.textAlign = 'right';
    ctx.fillText(author, width - margin, top + quoteHeight + authorSize * 0.9);
  };

  const App = () => {
    const canvasRef = useRef(null);
    const quotesRef = useRef([]);
    const [quote, setQuote] = useState(null);
    const [status, setStatus] = useState('Loading today\'s verse…');
    const [sizeKey, setSizeKey] = useState('iphone-14-13-12');
    const [dateLabel, setDateLabel] = useState('');

    const size = SIZES[sizeKey];

    const applyQuoteForDate = (date, list) => {
      if (!list || !list.length) return false;
      const selected = selectForDate(list, date);
      saveCachedQuote(getLocalDateKey(date), selected);
      setQuote(selected);
      setStatus('');
      return true;
    };

    const refreshFromSource = (date) => {
      return fetchQuotes().then((list) => {
        const filtered = filterLock(list);
        if (!filtered.length) throw new Error('No verses remain after the lock-screen filter.');
        quotesRef.current = filtered;
        applyQuoteForDate(date, filtered);
      });
    };

    const updateForDate = (date, { allowCache = true, errorMessage = 'Could not load the daily verse.' } = {}) => {
      setDateLabel(formatDateLabel(date));
      const key = getLocalDateKey(date);
      if (allowCache) {
        const cached = readCachedQuote(key);
        if (cached && countWords(cached.text) <= LOCK_MAX_WORDS) {
          setQuote(cached);
          setStatus('');
          return Promise.resolve();
        }
      }
      if (applyQuoteForDate(date, quotesRef.current)) {
        return Promise.resolve();
      }
      return refreshFromSource(date).catch((error) => {
        console.error(error);
        setStatus(errorMessage);
      });
    };

    useEffect(() => {
      const today = new Date();
      updateForDate(today);
    }, []);

    useEffect(() => {
      if (!quote || !canvasRef.current) return;
      const canvas = canvasRef.current;
      canvas.width = size.width;
      canvas.height = size.height;
      canvas.dataset.words = String(countWords(quote.text));
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const render = () =>
        drawWallpaper(ctx, {
          width: size.width,
          height: size.height,
          quote: quote.text,
          author: quote.author || DEFAULT_AUTHOR
        });

      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(render);
      } else {
        render();
      }
    }, [quote, sizeKey]);

    const handleDownload = () => {
      if (!canvasRef.current || !quote) return;
      const canvas = canvasRef.current;
      const link = document.createElement('a');
      link.download = `lock-screen-verse-${getLocalDateKey(new Date())}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };

    const now = new Date();
    const overlayDate = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
    const overlayTime = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false });

    return React.createElement(
      'div',
      { className: 'wallpaper-shell' },
      React.createElement(
        'section',
        { className: 'wallpaper-panel' },
        React.createElement('h1', { className: 'wallpaper-title' }, 'Lock screen'),
        React.createElement(
          'p',
          { className: 'wallpaper-subtitle' },
          'Today’s Hidden Words, as e-ink paper. Only verses of 35 words or fewer, so the whole passage fits. iOS draws its own clock on top of the PNG.'
        ),
        React.createElement(
          'div',
          { className: 'control-group' },
          React.createElement('span', { className: 'control-label' }, 'Phone size'),
          React.createElement(
            'select',
            {
              className: 'control-select',
              value: sizeKey,
              onChange: (event) => setSizeKey(event.target.value)
            },
            Object.entries(SIZES).map(([key, value]) =>
              React.createElement('option', { key, value: key }, value.label)
            )
          )
        ),
        React.createElement(
          'div',
          { className: 'wallpaper-actions' },
          React.createElement(
            'button',
            { className: 'button-primary', type: 'button', onClick: handleDownload },
            'Download PNG'
          )
        ),
        React.createElement('p', { className: 'status-text' }, status || dateLabel)
      ),
      React.createElement(
        'section',
        { className: 'preview-panel' },
        React.createElement(
          'div',
          { className: 'preview-phone' },
          React.createElement('canvas', {
            ref: canvasRef,
            className: 'preview-canvas',
            role: 'img',
            'aria-label': 'Lock-screen verse preview'
          }),
          React.createElement(
            'div',
            { className: 'preview-lock-chrome', 'aria-hidden': 'true' },
            React.createElement('span', { className: 'preview-island' }),
            React.createElement(
              'div',
              { className: 'preview-meta-row' },
              React.createElement('span', null, overlayDate),
              React.createElement('span', { className: 'preview-time' }, overlayTime)
            )
          )
        ),
        React.createElement(
          'p',
          { className: 'preview-meta' },
          'Save to Photos, then set as Lock Screen wallpaper. The time in this preview is not in the file — the phone draws that.'
        )
      )
    );
  };

  ReactDOM.createRoot(document.getElementById('wallpaper-root')).render(React.createElement(App));
})();
