// js/script.js  –  fully self-contained

/* ----------  CONSTANTS  ---------- */
const MAX_QUOTE_WORDS = 75;

/* ----------  THEME SET-UP ---------- */
const themeToggleBtn = document.getElementById('theme-toggle-button');
const savedTheme = localStorage.getItem('theme');
document.body.classList.add(savedTheme || 'light-mode');
if (themeToggleBtn){
    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        document.body.classList.toggle('light-mode');
        localStorage.setItem(
            'theme',
            document.body.classList.contains('dark-mode') ? 'dark-mode' : 'light-mode'
        );
    });
}

/* ----------  QUOTE HELPERS ---------- */
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

const countWords = t => (t || '').trim().split(/\s+/).length;

function filterQuotesByLength(quotes, maxWords) {
    return quotes.filter(q => q.text && countWords(q.text) <= maxWords);
}

function dayOfYear(d = new Date()) {
    const start = new Date(d.getFullYear(), 0, 0);
    const diff = d - start + (start.getTimezoneOffset() - d.getTimezoneOffset()) * 6e4;
    return Math.floor(diff / 8.64e7); // ms per day
}

function pickQuote(quotes, index) {
    if (!quotes.length) return null;
    return quotes[index % quotes.length];
}

/* ----------  RENDER HELPERS ---------- */
function renderQuote(obj, type = 'today') {
    const prefix = type === 'today' ? '' : '-yesterday';
    const txt  = document.getElementById(`quote-text${prefix}`);
    const auth = document.getElementById(`quote-author${prefix}`);
    const src  = document.getElementById(`quote-source-full${prefix}`);

    if (!txt || !auth || !src) return;

    if (!obj) {
        txt.textContent = 'No suitable sacred verse available.';
        auth.textContent = '';
        src.innerHTML = '';
        return;
    }

    txt.textContent  = obj.text;
    auth.textContent = obj.tradition === 'Bahá’í' ? 'Bahá’u’lláh' : (obj.author || '');
    src.innerHTML    = `<cite>${obj.source || 'Source unknown'}</cite>${obj.translator ? ` (trans. ${obj.translator})` : ''}`;
}

function renderGregorian(date, elId) {
    const el = document.getElementById(elId);
    if (!el) return;
    el.textContent = date.toLocaleDateString(
        'en-US',
        { weekday:'long', year:'numeric', month:'long', day:'numeric' }
    );
}

/* ----------  STATE ---------- */
let quotesAll = [];
let quotesShort = [];
let quoteTodayObj = null;
let quoteYestObj = null;

/* ----------  INITIALISE PAGE ---------- */
async function initPage() {
    quotesAll = await fetchQuotes();
    if (!quotesAll.length) { renderQuote(null); return; }

    quotesShort = filterQuotesByLength(quotesAll, MAX_QUOTE_WORDS);
    if (!quotesShort.length) quotesShort = quotesAll;        // fall-back

    /* today */
    const now = new Date();
    quoteTodayObj = pickQuote(quotesShort, dayOfYear(now));
    renderQuote(quoteTodayObj, 'today');
    renderGregorian(now, 'gregorianDatePanel');
    initializeBadiCalendar(now, 'badiDate');
}

function showYesterday() {
    const yesterdayDiv = document.getElementById('yesterday-jumbotron-display');
    if (!yesterdayDiv) return;

    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    quoteYestObj = pickQuote(quotesShort, dayOfYear(yesterday));
    renderQuote(quoteYestObj, 'yesterday');
    renderGregorian(yesterday, 'gregorianDateYesterday');
    initializeBadiCalendar(yesterday, 'badiDateYesterday');

    yesterdayDiv.style.display = 'flex';
    setTimeout(() => yesterdayDiv.scrollIntoView({behavior:'smooth'}), 30);
}

function hideYesterday() {
    const div = document.getElementById('yesterday-jumbotron-display');
    if (div) div.style.display = 'none';
}

/* ----------  EVENTS ---------- */
function copyToClipboard(obj){
    if(!obj || !obj.text) return;
    let txt = obj.text;
    if (obj.author)      txt += `\n— ${obj.author}`;
    if (obj.source)      txt += `, ${obj.source}`;
    if (obj.translator)  txt += ` (trans. ${obj.translator})`;
    navigator.clipboard.writeText(txt.trim()).then(()=>alert('Quote copied!'));
}

function setEvents() {
    /* buttons */
    const btnToday     = document.getElementById('today-button');
    const btnYesterday = document.getElementById('yesterday-button');

    btnYesterday?.addEventListener('click', e => {
        e.preventDefault();
        btnYesterday.classList.add('button-active');
        btnToday?.classList.remove('button-active');
        showYesterday();
    });

    btnToday?.addEventListener('click', e => {
        e.preventDefault();
        hideYesterday();
        document.getElementById('main-jumbotron')
                .scrollIntoView({behavior:'smooth'});
        /* refresh top dates */
        const now = new Date();
        renderGregorian(now,'gregorianDatePanel');
        initializeBadiCalendar(now,'badiDate');
        btnToday.classList.add('button-active');
        btnYesterday?.classList.remove('button-active');
    });

    /* down arrow */
    document.getElementById('scroll-down-arrow')
            ?.addEventListener('click',e=>{
                e.preventDefault();
                document.getElementById('scroll-content-start')
                        .scrollIntoView({behavior:'smooth'});
            });

    /* quote copy */
    document.getElementById('quote-text')
            .addEventListener('click',()=>copyToClipboard(quoteTodayObj));
    document.getElementById('quote-text-yesterday')
            .addEventListener('click',()=>copyToClipboard(quoteYestObj));

    /* Badíʿ date → show / hide Gregorian */
    document.getElementById('badiDate')
        .addEventListener('click', () => {
            const el = document.getElementById('gregorianDatePanel');
            const vis = el.classList.toggle('visible');
            if (!vis) el.style.opacity = 0;
        });
}

document.addEventListener('DOMContentLoaded', async ()=>{
    await initPage();
    setEvents();
});
