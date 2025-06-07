// js/script.js

// --- THEME TOGGLE --- (Keep as is from previous)
const themeToggleButton = document.getElementById('theme-toggle-button');
const currentTheme = localStorage.getItem('theme');
if (currentTheme) {
    document.body.classList.add(currentTheme);
} else {
    document.body.classList.add('light-mode');
}
if (themeToggleButton) {
    themeToggleButton.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        document.body.classList.toggle('light-mode');
        let theme = document.body.classList.contains('dark-mode') ? 'dark-mode' : 'light-mode';
        localStorage.setItem('theme', theme);
    });
}

async function fetchQuotes(fileName = 'data/quotes_hidden_words.json') { /* ... same ... */ }
function filterQuotesByLength(quotesArray, maxWords) { /* ... same ... */ }
function getQuoteByDay(quotesArray, dayOfYear) { /* ... same ... */ }

let currentQuoteObjectForToday = null;
let currentQuoteObjectForYesterday = null;

function displaySingleQuote(quoteObject, textElId, authorElId, sourceElId) {
    const quoteTextElement = document.getElementById(textElId);
    const quoteAuthorElement = document.getElementById(authorElId);
    const quoteSourceFullElement = document.getElementById(sourceElId);

    if (textElId === 'quote-text-today') currentQuoteObjectForToday = quoteObject;
    if (textElId === 'quote-text-yesterday') currentQuoteObjectForYesterday = quoteObject;

    if (quoteTextElement && quoteAuthorElement && quoteSourceFullElement) {
        if (quoteObject && quoteObject.text) {
            quoteTextElement.style.opacity = 0;
            quoteAuthorElement.style.opacity = 0;
            quoteSourceFullElement.style.opacity = 0;

            setTimeout(() => {
                quoteTextElement.textContent = quoteObject.text; 
                let authorDisplay = quoteObject.author || 'Unknown';
                if (quoteObject.tradition === "Bahá’í") {
                    authorDisplay = "Bahá’u’lláh";
                } // ... more author logic ...
                
                quoteAuthorElement.textContent = authorDisplay; // REMOVED HYPHEN
                
                let sourceText = quoteObject.source || 'Unknown Source';
                let translatorInfo = quoteObject.translator ? ` (trans. ${quoteObject.translator})` : '';
                quoteSourceFullElement.innerHTML = `<cite>${sourceText}</cite>${translatorInfo}`;
                
                quoteTextElement.style.opacity = 1;
                quoteAuthorElement.style.opacity = 1;
                quoteSourceFullElement.style.opacity = 1;
            }, 150);
        } else {
            quoteTextElement.textContent = "No suitable sacred verse available.";
            quoteAuthorElement.textContent = "";
            quoteSourceFullElement.innerHTML = "";
        }
    }
}

function getDayOfYear(date = new Date()) { /* ... same ... */ }

function displayGregorianDate(date = new Date(), elementId = "gregorianDatePanel") {
    const gregorianDateElement = document.getElementById(elementId);
    if (gregorianDateElement) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        gregorianDateElement.textContent = `${year}-${month}-${day}`;
    }
}

let ALL_QUOTES = [];
let SHORT_QUOTES = [];
const MAX_QUOTE_WORDS = 75;

async function initializeAndShowToday() {
    ALL_QUOTES = await fetchQuotes('data/quotes_hidden_words.json'); 
    if (ALL_QUOTES.length === 0) { 
        displaySingleQuote(null, 'quote-text-today', 'quote-author-today', 'quote-source-full-today'); 
        return; 
    }
    SHORT_QUOTES = filterQuotesByLength(ALL_QUOTES, MAX_QUOTE_WORDS);
    console.log(`Fetched ${ALL_QUOTES.length} quotes, filtered to ${SHORT_QUOTES.length} quotes with <= ${MAX_QUOTE_WORDS} words.`);
    if (SHORT_QUOTES.length === 0) { 
        displaySingleQuote(null, 'quote-text-today', 'quote-author-today', 'quote-source-full-today'); 
        return; 
    }

    const todayDateObj = new Date();
    const dayOfYearToday = getDayOfYear(todayDateObj);
    const todaysQuote = getQuoteByDay(SHORT_QUOTES, dayOfYearToday);
    displaySingleQuote(todaysQuote, 'quote-text-today', 'quote-author-today', 'quote-source-full-today');
    
    displayGregorianDate(todayDateObj, "gregorianDatePanel"); // For today's date panel
    if (typeof initializeBadiCalendar === "function") {
        initializeBadiCalendar(todayDateObj, "badiDate"); // For today's date panel
    }
}

function showYesterdayQuote() {
    if (SHORT_QUOTES.length === 0) {
        displaySingleQuote(null, 'quote-text-yesterday', 'quote-author-yesterday', 'quote-source-full-yesterday');
        return;
    }
    const today = new Date();
    const yesterdayDateObj = new Date(today);
    yesterdayDateObj.setDate(today.getDate() - 1); 

    const dayOfYearYesterday = getDayOfYear(yesterdayDateObj);
    const yesterdaysQuote = getQuoteByDay(SHORT_QUOTES, dayOfYearYesterday);
    displaySingleQuote(yesterdaysQuote, 'quote-text-yesterday', 'quote-author-yesterday', 'quote-source-full-yesterday');

    // Update dates for yesterday's section
    displayGregorianDate(yesterdayDateObj, "gregorianDateYesterday");
    if (typeof initializeBadiCalendar === "function") {
        initializeBadiCalendar(yesterdayDateObj, "badiDateYesterday");
    }

    document.getElementById('yesterday-jumbotron').style.display = 'flex'; // Show the section
    document.getElementById('yesterday-jumbotron').scrollIntoView({ behavior: 'smooth' });

    // Update button states if you have them
    document.getElementById('show-yesterday-button')?.classList.add('button-disabled'); // Example
    document.getElementById('view-today-button')?.classList.remove('button-active');
}


function setupEventListeners() {
    const viewTodayButton = document.getElementById('view-today-button');
    const showYesterdayButton = document.getElementById('show-yesterday-button');
    const scrollArrowToday = document.getElementById('scroll-down-arrow-today');
    const quoteTextToday = document.getElementById('quote-text-today');
    const quoteTextYesterday = document.getElementById('quote-text-yesterday');
    const badiDateTitle = document.getElementById('badiDate');

    if (viewTodayButton) {
        viewTodayButton.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('today-jumbotron').scrollIntoView({ behavior: 'smooth' });
        });
    }
    if (showYesterdayButton) {
        showYesterdayButton.addEventListener('click', (e) => {
            e.preventDefault();
            showYesterdayQuote();
        });
    }
    if (scrollArrowToday) {
        scrollArrowToday.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('scroll-content-start')?.scrollIntoView({ behavior: 'smooth' });
        });
    }

    function copyQuoteToClipboard(quoteObj) {
        if (quoteObj && quoteObj.text) {
            const textToCopy = `${quoteObj.text}\n— ${quoteObj.author || ''}${quoteObj.source ? ', ' + quoteObj.source : ''}`;
            navigator.clipboard.writeText(textToCopy).then(() => {
                console.log('Quote copied!');
                // Add subtle visual feedback if desired, e.g., on the clicked element
                // For example, if you clicked quoteTextToday:
                // quoteTextToday.style.transition = 'color 0.1s ease-out';
                // quoteTextToday.style.color = 'var(--text-color-info)';
                // setTimeout(() => { quoteTextToday.style.color = ''; }, 700);
            }).catch(err => console.error('Failed to copy text: ', err));
        }
    }

    if (quoteTextToday) {
        quoteTextToday.addEventListener('click', () => copyQuoteToClipboard(currentQuoteObjectForToday));
    }
    if (quoteTextYesterday) {
        quoteTextYesterday.addEventListener('click', () => copyQuoteToClipboard(currentQuoteObjectForYesterday));
    }

    if (badiDateTitle) {
        badiDateTitle.addEventListener('click', () => {
            const gregorianEl = document.getElementById('gregorianDatePanel');
            if (gregorianEl) {
                gregorianEl.style.display = (gregorianEl.style.display === 'none' || gregorianEl.style.display === '') ? 'block' : 'none';
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await initializeAndShowToday(); 
    setupEventListeners();
});