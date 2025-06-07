// js/script.js

// --- THEME TOGGLE --- (Keep from previous - it works)
// ...

// --- QUOTE LOGIC ---
let ALL_QUOTES = [];
let SHORT_QUOTES = [];
let CURRENT_DISPLAY_DAY_OFFSET = 0; // 0 for today, -1 for yesterday
const MAX_QUOTE_WORDS = 75;
let currentQuoteObjectForCopy = null;

async function fetchQuotes(fileName = 'data/quotes_hidden_words.json') { /* ... same ... */ }
function filterQuotesByLength(quotesArray, maxWords) { /* ... same ... */ }
function getQuoteByDay(quotesArray, dayOfYear) { /* ... same ... */ }

function displayQuoteInJumbotron(quoteObject) {
    const quoteTextElement = document.getElementById('quote-text');
    const quoteAuthorElement = document.getElementById('quote-author');
    const quoteSourceFullElement = document.getElementById('quote-source-full');

    currentQuoteObjectForCopy = quoteObject; 

    if (quoteTextElement && quoteAuthorElement && quoteSourceFullElement) {
        quoteTextElement.style.opacity = 0;
        quoteAuthorElement.style.opacity = 0;
        quoteSourceFullElement.style.opacity = 0;

        setTimeout(() => {
            if (quoteObject && quoteObject.text) {
                quoteTextElement.textContent = quoteObject.text; 
                let authorDisplay = quoteObject.author || 'Unknown';
                if (quoteObject.tradition === "Bahá’í") authorDisplay = "Bahá’u’lláh";
                
                quoteAuthorElement.textContent = authorDisplay; // No hyphen
                
                let sourceText = quoteObject.source || 'Unknown Source';
                let translatorInfo = quoteObject.translator ? ` (trans. ${quoteObject.translator})` : '';
                quoteSourceFullElement.innerHTML = `<cite>${sourceText}</cite>${translatorInfo}`;
            } else {
                quoteTextElement.textContent = "No suitable sacred verse available.";
                quoteAuthorElement.textContent = "";
                quoteSourceFullElement.innerHTML = "";
            }
            quoteTextElement.style.opacity = 1;
            quoteAuthorElement.style.opacity = 1;
            quoteSourceFullElement.style.opacity = 1;
        }, 200);
    }
}

function getDayOfYear(date = new Date()) { /* ... same ... */ }
function displayGregorianDate(date = new Date(), elementId = "gregorianDatePanel") { /* ... same ... */ }

async function initializeAndShowPage() {
    ALL_QUOTES = await fetchQuotes('data/quotes_hidden_words.json'); 
    if (!Array.isArray(ALL_QUOTES)) ALL_QUOTES = []; 
    if (ALL_QUOTES.length === 0) { displayQuoteInJumbotron(null); return false; }
    
    SHORT_QUOTES = filterQuotesByLength(ALL_QUOTES, MAX_QUOTE_WORDS);
    if (!Array.isArray(SHORT_QUOTES)) SHORT_QUOTES = []; 
    console.log(`Fetched ${ALL_QUOTES.length} total quotes, filtered to ${SHORT_QUOTES.length} quotes with <= ${MAX_QUOTE_WORDS} words.`);
    if (SHORT_QUOTES.length === 0) { displayQuoteInJumbotron(null); return false; }

    showQuoteForDayOffset(0); 
    return true; 
}

function showQuoteForDayOffset(offset) {
    if (SHORT_QUOTES.length === 0) { displayQuoteInJumbotron(null); return; }

    const todayDateObj = new Date(); 
    const targetDateObj = new Date(todayDateObj);
    targetDateObj.setDate(todayDateObj.getDate() + offset); 

    const dayOfYearToDisplay = getDayOfYear(targetDateObj);
    const quote = getQuoteByDay(SHORT_QUOTES, dayOfYearToDisplay);
    displayQuoteInJumbotron(quote); // This updates the single main jumbotron

    CURRENT_DISPLAY_DAY_OFFSET = offset; 
    updateButtonActiveStates();

    displayGregorianDate(targetDateObj, "gregorianDatePanel");
    if (typeof initializeBadiCalendar === "function") {
        initializeBadiCalendar(targetDateObj, "badiDate"); 
    }
}

function updateButtonActiveStates() { /* ... same ... */ }
function setupEventListeners() { /* ... (Ensure button IDs match: today-button, yesterday-button) ... */
    const todayButton = document.getElementById('today-button');
    const yesterdayButton = document.getElementById('yesterday-button');
    const scrollArrow = document.getElementById('scroll-down-arrow'); // Was scroll-down-arrow-today
    const quoteTextElement = document.getElementById('quote-text'); // Was quote-text-today
    const badiDateTitle = document.getElementById('badiDate');

    if (todayButton) {
        todayButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (CURRENT_DISPLAY_DAY_OFFSET !== 0) {
                showQuoteForDayOffset(0);
            }
            // Scroll to top (main jumbotron)
            document.getElementById('main-jumbotron')?.scrollIntoView({ behavior: 'smooth' }); 
        });
    }
    if (yesterdayButton) {
        yesterdayButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (CURRENT_DISPLAY_DAY_OFFSET !== -1) {
                showQuoteForDayOffset(-1);
            }
            // Scroll to top (main jumbotron) to see the changed quote
            document.getElementById('main-jumbotron')?.scrollIntoView({ behavior: 'smooth' });
        });
    }
    // ... (rest of event listeners: scrollArrow, copyQuote, badiDateTitle click for Gregorian) ...
    // Ensure copyQuoteToClipboard uses currentQuoteObjectForCopy which is set by displayQuoteInJumbotron
    if (scrollArrow) { /* ... */ }
    function copyQuoteToClipboard(quoteObj) { /* ... same, uses currentQuoteObjectForCopy ... */ }
    if (quoteTextElement) { quoteTextElement.addEventListener('click', () => copyQuoteToClipboard(currentQuoteObjectForCopy)); }
    if (badiDateTitle) { /* ... same Gregorian toggle logic ... */ }
}

// --- (Theme toggle JS at the top is fine) ---
// --- MAIN DOMCONTENTLOADED LISTENER ---
document.addEventListener('DOMContentLoaded', async () => {
    await initializeAndShowPage(); 
    setupEventListeners();
});