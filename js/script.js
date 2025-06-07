// js/script.js

// --- THEME TOGGLE ---
const themeToggleButton = document.getElementById('theme-toggle-button');
const currentTheme = localStorage.getItem('theme');
if (currentTheme) { document.body.classList.add(currentTheme); } 
else { document.body.classList.add('light-mode'); }

if (themeToggleButton) {
    themeToggleButton.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        document.body.classList.toggle('light-mode');
        localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark-mode' : 'light-mode');
    });
}

// --- QUOTE LOGIC ---
let ALL_QUOTES = [];
let SHORT_QUOTES = [];
const MAX_QUOTE_WORDS = 75; 
let currentQuoteObjectForToday = null;
let currentQuoteObjectForYesterday = null;
let isYesterdaySectionVisible = false;

async function fetchQuotes(fileName = 'data/quotes_hidden_words.json') { /* ... same ... */ }
function filterQuotesByLength(quotesArray, maxWords) { /* ... same ... */ }
function getQuoteByDay(quotesArray, dayOfYear) { /* ... same ... */ }

function displayQuote(quoteObject, type = "today") { // 'type' can be "today" or "yesterday"
    const textElId = type === "today" ? 'quote-text' : 'quote-text-yesterday';
    const authorElId = type === "today" ? 'quote-author' : 'quote-author-yesterday';
    const sourceElId = type === "today" ? 'quote-source-full' : 'quote-source-full-yesterday';

    const quoteTextElement = document.getElementById(textElId);
    const quoteAuthorElement = document.getElementById(authorElId);
    const quoteSourceFullElement = document.getElementById(sourceElId);

    if (type === 'today') currentQuoteObjectForToday = quoteObject;
    else currentQuoteObjectForYesterday = quoteObject;

    if (quoteTextElement && quoteAuthorElement && quoteSourceFullElement) {
        // No opacity animation for now for simplicity during debug
        if (quoteObject && quoteObject.text) {
            quoteTextElement.textContent = quoteObject.text; 
            let authorDisplay = quoteObject.author || 'Unknown';
            if (quoteObject.tradition === "Bahá’í") authorDisplay = "Bahá’u’lláh";
            quoteAuthorElement.textContent = authorDisplay; 
            
            let sourceText = quoteObject.source || 'Unknown Source';
            let translatorInfo = quoteObject.translator ? ` (trans. ${quoteObject.translator})` : '';
            quoteSourceFullElement.innerHTML = `<cite>${sourceText}</cite>${translatorInfo}`;
        } else {
            quoteTextElement.textContent = "No suitable sacred verse available.";
            quoteAuthorElement.textContent = "";
            quoteSourceFullElement.innerHTML = "";
        }
    } else {
        console.error(`Error displaying quote: One or more elements not found for type "${type}"`);
    }
}

function getDayOfYear(date = new Date()) { /* ... same ... */ }
function displayGregorianDate(date = new Date(), elementId) { /* ... same ... */ }

async function initializeAndShowPage() {
    ALL_QUOTES = await fetchQuotes('data/quotes_hidden_words.json'); 
    if (!Array.isArray(ALL_QUOTES) || ALL_QUOTES.length === 0) { 
        displayQuote(null, "today"); return false; 
    }
    SHORT_QUOTES = filterQuotesByLength(ALL_QUOTES, MAX_QUOTE_WORDS);
    if (!Array.isArray(SHORT_QUOTES) || SHORT_QUOTES.length === 0) { 
        console.warn(`No quotes met MAX_QUOTE_WORDS (${MAX_QUOTE_WORDS}). Using ALL_QUOTES as fallback for today.`);
        SHORT_QUOTES = ALL_QUOTES; // Fallback to all quotes if filter yields none
        if (SHORT_QUOTES.length === 0) { // Still nothing
             displayQuote(null, "today"); return false; 
        }
    }
    console.log(`Using ${SHORT_QUOTES.length} quotes for display (after filtering).`);

    const todayDateObj = new Date();
    const dayOfYearToday = getDayOfYear(todayDateObj);
    const todaysQuote = getQuoteByDay(SHORT_QUOTES, dayOfYearToday);
    displayQuote(todaysQuote, "today"); 
    
    displayGregorianDate(todayDateObj, "gregorianDatePanel");
    if (typeof initializeBadiCalendar === "function") {
        initializeBadiCalendar(todayDateObj, "badiDate"); 
    }
    return true; 
}

function showYesterdaySection() {
    if (SHORT_QUOTES.length === 0) {
        // Try to initialize if it hasn't happened
        if (ALL_QUOTES.length > 0) SHORT_QUOTES = filterQuotesByLength(ALL_QUOTES, MAX_QUOTE_WORDS);
        if (SHORT_QUOTES.length === 0) {
             displayQuote(null, "yesterday"); return;
        }
    }

    const today = new Date();
    const yesterdayDateObj = new Date(today);
    yesterdayDateObj.setDate(today.getDate() - 1); 

    const dayOfYearYesterday = getDayOfYear(yesterdayDateObj);
    const yesterdaysQuote = getQuoteByDay(SHORT_QUOTES, dayOfYearYesterday);
    
    displayQuote(yesterdaysQuote, "yesterday");
    displayGregorianDate(yesterdayDateObj, "gregorianDateYesterday");
    if (typeof initializeBadiCalendar === "function") {
        initializeBadiCalendar(yesterdayDateObj, "badiDateYesterday");
    }

    const yesterdaySection = document.getElementById('yesterday-jumbotron-display');
    if (yesterdaySection) {
        const wasHidden = yesterdaySection.style.display === 'none';
        yesterdaySection.style.display = 'flex'; 
        if (wasHidden) { // Only scroll if it was just made visible
            setTimeout(() => { 
                 yesterdaySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 50); 
        }
        isYesterdaySectionVisible = true;
    }
    
    document.getElementById('yesterday-button')?.classList.add('button-active');
    document.getElementById('today-button')?.classList.remove('button-active');
}

function setupEventListeners() {
    const todayButton = document.getElementById('today-button');
    const yesterdayButton = document.getElementById('yesterday-button');
    const scrollArrow = document.getElementById('scroll-down-arrow');
    const quoteTextToday = document.getElementById('quote-text'); // Main quote text
    const quoteTextYesterday = document.getElementById('quote-text-yesterday');
    const badiDateTitle = document.getElementById('badiDate');

    if (todayButton) {
        todayButton.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('main-jumbotron').scrollIntoView({ behavior: 'smooth' });
            // Ensure main panel dates reflect today
            const todayDateObj = new Date();
            displayGregorianDate(todayDateObj, "gregorianDatePanel");
            if (typeof initializeBadiCalendar === "function") {
                initializeBadiCalendar(todayDateObj, "badiDate"); 
            }
            todayButton.classList.add('button-active');
            yesterdayButton?.classList.remove('button-active');
            
            const yesterdaySection = document.getElementById('yesterday-jumbotron-display');
            if (yesterdaySection) yesterdaySection.style.display = 'none'; // Hide yesterday section
            isYesterdaySectionVisible = false;
        });
    }
    if (yesterdayButton) {
        yesterdayButton.addEventListener('click', (e) => {
            e.preventDefault();
            showYesterdaySection(); 
        });
    }
    if (scrollArrow) { /* ... same ... */ }

    function copyQuoteToClipboard(quoteObj) { 
        if (quoteObj && quoteObj.text) {
            let textToCopy = quoteObj.text;
            if (quoteObj.author) textToCopy += `\n— ${quoteObj.author}`;
            if (quoteObj.source) textToCopy += `, ${quoteObj.source}`; // Add full source to copy
            if (quoteObj.translator) textToCopy += ` (trans. ${quoteObj.translator})`;
            
            navigator.clipboard.writeText(textToCopy.trim()).then(() => {
                alert("Quote copied to clipboard!"); 
            }).catch(err => console.error('Failed to copy text: ', err));
        }
    }

    if (quoteTextToday) { quoteTextToday.addEventListener('click', () => copyQuoteToClipboard(currentQuoteObjectForToday)); }
    if (quoteTextYesterday) { quoteTextYesterday.addEventListener('click', () => copyQuoteToClipboard(currentQuoteObjectForYesterday));}

    if (badiDateTitle) {
        badiDateTitle.addEventListener('click', () => {
            const gregorianEl = document.getElementById('gregorianDatePanel');
            if (gregorianEl) {
                const isCurrentlyHidden = gregorianEl.style.display === 'none' || gregorianEl.style.display === '';
                if (isCurrentlyHidden) {
                    gregorianEl.style.display = 'block';
                    requestAnimationFrame(() => { 
                        requestAnimationFrame(() => {
                             gregorianEl.style.opacity = '0.85'; 
                             gregorianEl.classList.add('visible');
                        });
                    });
                } else {
                    gregorianEl.style.opacity = '0';
                    gregorianEl.classList.remove('visible');
                    gregorianEl.addEventListener('transitionend', function handler() {
                        if (gregorianEl.style.opacity === '0') { 
                             gregorianEl.style.display = 'none';
                        }
                        gregorianEl.removeEventListener('transitionend', handler);
                    }, { once: true });
                }
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await initializeAndShowPage(); 
    setupEventListeners();
});