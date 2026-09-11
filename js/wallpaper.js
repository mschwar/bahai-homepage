(() => {
  const { useEffect, useRef, useState } = React;

  // Selection + caching come from the shared core (js/quote-core.js), loaded
  // before this file. Only wallpaper-specific values are declared here.
  const {
    DEFAULT_AUTHOR,
    filterShort,
    selectForDate,
    getLocalDateKey,
    formatDateLabel,
    fetchQuotes,
    createQuoteCache
  } = window.QuoteCore;

  const CACHE_PREFIX = 'dailyWallpaper:';

  const SIZES = {
    'iphone-15-pro': { label: 'iPhone 15 Pro (1179 × 2556)', width: 1179, height: 2556 },
    'iphone-15-pro-max': { label: 'iPhone 15 Pro Max (1290 × 2796)', width: 1290, height: 2796 },
    'iphone-14-13-12': { label: 'iPhone 14/13/12 (1170 × 2532)', width: 1170, height: 2532 }
  };

  // Canvas tokens match the homepage after D22/D23 (C12 option b).
  // Generator chrome around the controls is a separate surface and is not restyled here.
  const THEMES = {
    dawn: {
      label: 'Light',
      bg: '#f7f4f0',
      text: '#1A2639',
      textMuted: 'rgba(26, 38, 57, 0.8)'
    },
    night: {
      label: 'Dark',
      bg: '#1A2639',
      text: '#EFEBE9',
      textMuted: 'rgba(239, 235, 233, 0.8)'
    }
  };

  const FONT_SIZES = {
    small: { label: 'Small', scale: 0.92 },
    medium: { label: 'Medium', scale: 1 },
    large: { label: 'Large', scale: 1.08 }
  };

  const VERSE_FACE = 'Cormorant Garamond';
  const AUTHOR_FACE = 'Source Sans Pro';
  const QUOTE_WEIGHT = 400;
  const AUTHOR_WEIGHT = 400;

  const verseFont = (size) => `${QUOTE_WEIGHT} ${size}px "${VERSE_FACE}", Georgia, serif`;
  const authorFont = (size) => `${AUTHOR_WEIGHT} ${size}px "${AUTHOR_FACE}", sans-serif`;

  const { read: readCachedQuote, save: saveCachedQuote } = createQuoteCache(CACHE_PREFIX);

  const wrapText = (ctx, text, maxWidth) => {
    const words = (text || '').split(/\s+/).filter(Boolean);
    const lines = [];
    let line = '';

    words.forEach((word) => {
      const testLine = line ? `${line} ${word}` : word;
      const width = ctx.measureText(testLine).width;
      if (width <= maxWidth || !line) {
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
      ctx.font = verseFont(size);
      const lines = wrapText(ctx, text, maxWidth);
      if (lines.length * size * lineHeight <= maxHeight) {
        return { size, lines };
      }
    }

    ctx.font = verseFont(minSize);
    return { size: minSize, lines: wrapText(ctx, text, maxWidth) };
  };

  const drawWallpaper = (ctx, config) => {
    const { width, height, theme, quote, author, showAuthor, fontScale } = config;
    const palette = THEMES[theme];

    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, width, height);

    const margin = Math.round(width * 0.1);
    const maxWidth = width - margin * 2;
    const maxHeight = height * 0.62;
    const scale = fontScale || 1;
    const startSize = Math.round(width * 0.062 * scale);
    const minSize = Math.round(width * 0.038 * scale);
    const lineHeight = 1.2;

    const fitted = fitText(ctx, quote, maxWidth, maxHeight, startSize, minSize, lineHeight);
    const quoteHeight = fitted.lines.length * fitted.size * lineHeight;
    const authorSize = Math.round(fitted.size * 0.6);
    const blockHeight = showAuthor ? quoteHeight + authorSize * 1.6 : quoteHeight;
    const top = (height - blockHeight) / 2;

    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = palette.text;
    ctx.font = verseFont(fitted.size);

    fitted.lines.forEach((line, index) => {
      ctx.fillText(line, margin, top + index * fitted.size * lineHeight);
    });

    if (showAuthor) {
      ctx.fillStyle = palette.textMuted;
      ctx.font = authorFont(authorSize);
      ctx.textAlign = 'right';
      ctx.fillText(author, width - margin, top + quoteHeight + authorSize * 0.6);
    }
  };

  const App = () => {
    const canvasRef = useRef(null);
    const quotesRef = useRef([]);
    const timerRef = useRef(null);
    const [quote, setQuote] = useState(null);
    const [status, setStatus] = useState('Loading today\'s verse…');
    const [sizeKey, setSizeKey] = useState('iphone-14-13-12');
    const [themeKey, setThemeKey] = useState('dawn');
    const [showAuthor, setShowAuthor] = useState(true);
    const [fontSizeKey, setFontSizeKey] = useState('medium');
    const [dateLabel, setDateLabel] = useState('');

    const size = SIZES[sizeKey];
    const fontScale = FONT_SIZES[fontSizeKey]?.scale || 1;

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
        const filtered = filterShort(list);
        if (!filtered.length) throw new Error('No quotes remain after filtering.');
        quotesRef.current = filtered;
        applyQuoteForDate(date, filtered);
      });
    };

    const updateForDate = (date, { allowCache = true, errorMessage = 'Could not load the daily verse.' } = {}) => {
      setDateLabel(formatDateLabel(date));
      const key = getLocalDateKey(date);
      if (allowCache) {
        const cached = readCachedQuote(key);
        if (cached) {
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
      const todayKey = getLocalDateKey(today);
      const cached = readCachedQuote(todayKey);
      setDateLabel(formatDateLabel(today));
      if (cached) {
        setQuote(cached);
        setStatus('');
      }

      refreshFromSource(today).catch((error) => {
        console.error(error);
        if (!cached) {
          setStatus('Could not load the daily verse.');
        }
      });

      const scheduleNext = () => {
        const now = new Date();
        const next = new Date(now);
        next.setHours(24, 0, 5, 0);
        const delay = Math.max(1000, next.getTime() - now.getTime());
        timerRef.current = window.setTimeout(() => {
          updateForDate(new Date(), { allowCache: false }).then(scheduleNext);
        }, delay);
      };

      scheduleNext();
      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }, []);

    useEffect(() => {
      if (!quote || !canvasRef.current) return;
      const canvas = canvasRef.current;
      canvas.width = size.width;
      canvas.height = size.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const render = () =>
        drawWallpaper(ctx, {
          width: size.width,
          height: size.height,
          theme: themeKey,
          quote: quote.text,
          author: quote.author || DEFAULT_AUTHOR,
          showAuthor,
          fontScale
        });

      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(render);
      } else {
        render();
      }
    }, [quote, sizeKey, themeKey, showAuthor, fontScale]);

    const handleDownload = () => {
      if (!canvasRef.current || !quote) return;
      const canvas = canvasRef.current;
      const link = document.createElement('a');
      link.download = `daily-verse-wallpaper-${getLocalDateKey(new Date())}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };

    const handleRefresh = () => {
      setStatus('Refreshing verse…');
      updateForDate(new Date(), { allowCache: false, errorMessage: 'Could not refresh the verse.' });
    };

    return React.createElement(
      'div',
      { className: 'wallpaper-shell' },
      React.createElement(
        'section',
        { className: 'wallpaper-panel' },
        React.createElement('h1', { className: 'wallpaper-title' }, 'Daily Wallpaper'),
        React.createElement(
          'p',
          { className: 'wallpaper-subtitle' },
          'A daily quote from The Hidden Words, rendered as a ready-to-save iPhone wallpaper.'
        ),
        React.createElement(
          'div',
          { className: 'control-group' },
          React.createElement('span', { className: 'control-label' }, 'Wallpaper size'),
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
          { className: 'control-group' },
          React.createElement('span', { className: 'control-label' }, 'Font size'),
          React.createElement(
            'select',
            {
              className: 'control-select',
              value: fontSizeKey,
              onChange: (event) => setFontSizeKey(event.target.value)
            },
            Object.entries(FONT_SIZES).map(([key, value]) =>
              React.createElement('option', { key, value: key }, value.label)
            )
          )
        ),
        React.createElement(
          'div',
          { className: 'control-group' },
          React.createElement('span', { className: 'control-label' }, 'Appearance'),
          React.createElement(
            'select',
            {
              className: 'control-select',
              value: themeKey,
              onChange: (event) => setThemeKey(event.target.value)
            },
            Object.entries(THEMES).map(([key, value]) =>
              React.createElement('option', { key, value: key }, value.label)
            )
          )
        ),
        React.createElement(
          'div',
          { className: 'control-group' },
          React.createElement('span', { className: 'control-label' }, 'Details'),
          React.createElement(
            'label',
            { className: 'control-toggle' },
            React.createElement('span', null, 'Show author'),
            React.createElement('input', {
              type: 'checkbox',
              checked: showAuthor,
              onChange: (event) => setShowAuthor(event.target.checked)
            })
          )
        ),
        React.createElement(
          'div',
          { className: 'wallpaper-actions' },
          React.createElement(
            'button',
            { className: 'button-primary', type: 'button', onClick: handleDownload },
            'Download PNG'
          ),
          React.createElement(
            'button',
            { className: 'button-secondary', type: 'button', onClick: handleRefresh },
            'Refresh quote'
          )
        ),
        React.createElement('p', { className: 'status-text' }, status)
      ),
      React.createElement(
        'section',
        { className: 'preview-panel' },
        React.createElement(
          'div',
          { className: 'preview-header' },
          React.createElement('span', null, size.label),
          React.createElement('span', null, dateLabel)
        ),
        React.createElement('canvas', {
          ref: canvasRef,
          className: 'preview-canvas',
          role: 'img',
          'aria-label': 'Daily verse wallpaper preview'
        }),
        React.createElement(
          'p',
          { className: 'preview-meta' },
          'Save the PNG to Photos, then set it as your Lock Screen or Home Screen wallpaper on iOS.'
        )
      )
    );
  };

  ReactDOM.createRoot(document.getElementById('wallpaper-root')).render(React.createElement(App));
})();
