(() => {
  const { useEffect, useRef, useState } = React;

  const MAX_QUOTE_WORDS = 75;
  const QUOTES_PATH = 'data/quotes_hidden_words.json';
  const CACHE_PREFIX = 'dailyWallpaper:';

  const SIZES = {
    'iphone-15-pro': { label: 'iPhone 15 Pro (1179 × 2556)', width: 1179, height: 2556 },
    'iphone-15-pro-max': { label: 'iPhone 15 Pro Max (1290 × 2796)', width: 1290, height: 2796 },
    'iphone-14-13-12': { label: 'iPhone 14/13/12 (1170 × 2532)', width: 1170, height: 2532 }
  };

  const THEMES = {
    dawn: {
      label: 'Light',
      bgTop: '#f3eee7',
      bgBottom: '#d5c8ba',
      text: '#1a2639',
      textMuted: 'rgba(26, 38, 57, 0.7)'
    },
    night: {
      label: 'Dark',
      bgTop: '#0e1422',
      bgBottom: '#1c2434',
      text: '#f3f0ea',
      textMuted: 'rgba(243, 240, 234, 0.75)'
    }
  };

  const FONT_SIZES = {
    small: { label: 'Small', scale: 0.92 },
    medium: { label: 'Medium', scale: 1 },
    large: { label: 'Large', scale: 1.08 }
  };

  const QUOTE_WEIGHT = 300;
  const AUTHOR_WEIGHT = 300;

  const countWords = (t) => (t || '').trim().split(/\s+/).filter(Boolean).length;
  const filterShort = (list) => list.filter((q) => countWords(q.text) <= MAX_QUOTE_WORDS);
  const dayOfYear = (d) => Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);

  const formatDateLabel = (date) =>
    date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

  const getLocalDateKey = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const readCachedQuote = (key) => {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const saveCachedQuote = (key, quote) => {
    if (!key || !quote) return;
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(quote));
  };

  const fetchQuotes = async () => {
    const res = await fetch(QUOTES_PATH, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Quote fetch failed: ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('Quote payload is not an array.');
    return data;
  };

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
      ctx.font = `${QUOTE_WEIGHT} ${size}px "Source Serif Pro", serif`;
      const lines = wrapText(ctx, text, maxWidth);
      if (lines.length * size * lineHeight <= maxHeight) {
        return { size, lines };
      }
    }

    ctx.font = `${QUOTE_WEIGHT} ${minSize}px "Source Serif Pro", serif`;
    return { size: minSize, lines: wrapText(ctx, text, maxWidth) };
  };

  const drawWallpaper = (ctx, config) => {
    const { width, height, theme, quote, author, showAuthor, fontScale } = config;
    const palette = THEMES[theme];

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, palette.bgTop);
    gradient.addColorStop(1, palette.bgBottom);
    ctx.fillStyle = gradient;
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
    ctx.font = `${QUOTE_WEIGHT} ${fitted.size}px "Source Serif Pro", serif`;

    fitted.lines.forEach((line, index) => {
      ctx.fillText(line, margin, top + index * fitted.size * lineHeight);
    });

    if (showAuthor) {
      ctx.fillStyle = palette.textMuted;
      ctx.font = `${AUTHOR_WEIGHT} ${authorSize}px "Source Sans Pro", sans-serif`;
      ctx.fillText(author, margin, top + quoteHeight + authorSize * 0.6);
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
      const selected = list[dayOfYear(date) % list.length];
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
          author: quote.author || 'Bahá’u’lláh',
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
