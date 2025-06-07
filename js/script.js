// js/script.js

// --- THEME TOGGLE --- (Keep as is)
// ...

// --- QUOTE LOGIC ---
let ALL_QUOTES = [];
let SHORT_QUOTES = [];
// CURRENT_DISPLAY_DAY_OFFSET is no longer needed as main jumbotron is always today
const MAX_QUOTE_WORDS = 75; 
let currentQuoteObjectForToday = null;
let currentQuoteObjectForYesterday = null; // To store yesterday's quote object

async function fetchQuotes(fileName = 'data/quotes_hidden_words.json') { /* ... same ... */ }
function filterQuotesByLength(quotesArray, maxWords) { /* ... same ... */ }
function getQuoteByDay(quotesArray, dayOfYear) { /* ... same ... */ }

function displaySingleQuote(quoteObject, textElId, authorElId, sourceElId) {
    const quoteTextElement = document.getElementById(textElId);
    const quoteAuthorElement = document.getElementById(authorElId);
    const quoteSourceFullElement = document.getElementById(sourceElId);

    // Store the quote object for click-to-copy
    if (textElId === 'quote-text-today') currentQuoteObjectForToday = quoteObject;
    if (textElId === 'quote-text-yesterday') currentQuoteObjectForYesterday = quoteObject;

    if (quoteTextElement && quoteAuthorElement && quoteSourceFullElement) {
        // No opacity animation for now, to simplify and ensure content is set
        if (quoteObject && quoteObject.text) {
            quoteTextElement.textContent = quoteObject.text; 
            let authorDisplay = quoteObject.author || 'Unknown';
            if (quoteObject.tradition === "Bahá’í") authorDisplay = "Bahá’u’lláh";
            // ... other author logic
            quoteAuthorElement.textContent = authorDisplay; 
            
            let sourceText = quoteObject.source || 'Unknown Source';
            let translatorInfo = quoteObject.translator ? ` (trans. ${quoteObject.translator})` : '';
            quoteSourceFullElement.innerHTML = `<cite>${sourceText}</cite>${translatorInfo}`;
            
            // Make sure elements are visible if they were faded out previously
            quoteTextElement.style.opacity = 1;
            quoteAuthorElement.style.opacity = 1;
            quoteSourceFullElement.style.opacity = 1;

        } else {
            quoteTextElement.textContent = "No suitable sacred verse available.";
            quoteAuthorElement.textContent = "";
            quoteSourceFullElement.innerHTML = "";
        }
    }
}

function getDayOfYear(date = new Date()) { /* ... same ... */ }

function displayGregorianDate(date = new Date(), elementId = "gregorianDatePanel") { /* ... same ... */ }

async function initializeAndShowToday() {
    ALL_QUOTES = await fetchQuotes('data/quotes_hidden_words.json'); 
    if (!Array.isArray(ALL_QUOTES)) ALL_QUOTES = []; 
    if (ALL_QUOTES.length === 0) { 
        displaySingleQuote(null, 'quote-text-today', 'quote-author-today', 'quote-source-full-today'); 
        return false; 
    }
    SHORT_QUOTES = filterQuotesByLength(ALL_QUOTES, MAX_QUOTE_WORDS);
    if (!Array.isArray(SHORT_QUOTES)) SHORT_QUOTES = []; 
    console.log(`Fetched ${ALL_QUOTES.length} total quotes, filtered to ${SHORT_QUOTES.length} quotes with <= ${MAX_QUOTE_WORDS} words.`);
    if (SHORT_QUOTES.length === 0) { 
        displaySingleQuote(null, 'quote-text-today', 'quote-author-today', 'quote-source-full-today'); 
        return false; 
    }

    const todayDateObj = new Date();
    const dayOfYearToday = getDayOfYear(todayDateObj);
    const todaysQuote = getQuoteByDay(SHORT_QUOTES, dayOfYearToday);
    displaySingleQuote(todaysQuote, 'quote-text-today', 'quote-author-today', 'quote-source-full-today');
    
    // Dates for the main info panel (always today's initially)
    displayGregorianDate(todayDateObj, "gregorianDatePanel");
    if (typeof initializeBadiCalendar === "function") {
        initializeBadiCalendar(todayDateObj, "badiDate"); 
    }
    return true; 
}

let isYesterdaySectionVisible = false; // Track visibility

function showYesterdaySection() {
    if (SHORT_QUOTES.length === 0) { // Ensure quotes are loaded
        console.warn("Quotes not loaded, cannot show yesterday's quote.");
        displaySingleQuote(null, 'quote-text-yesterday', 'quote-author-yesterday', 'quote-source-full-yesterday');
        return;
    }

    const today = new Date();
    const yesterdayDateObj = new Date(today);
    yesterdayDateObj.setDate(today.getDate() - 1); 

    const dayOfYearYesterday = getDayOfYear(yesterdayDateObj);
    const yesterdaysQuote = getQuoteByDay(SHORT_QUOTES, dayOfYearYesterday);
    
    displaySingleQuote(yesterdaysQuote, 'quote-text-yesterday', 'quote-author-yesterday', 'quote-source-full-yesterday');
    displayGregorianDate(yesterdayDateObj, "gregorianDateYesterday");
    if (typeof initializeBadiCalendar === "function") {
        initializeBadiCalendar(yesterdayDateObj, "badiDateYesterday");
    }

    const yesterdaySection = document.getElementById('yesterday-jumbotron');
    if (yesterdaySection) {
        yesterdaySection.style.display = 'flex'; // Make it visible
        // Scroll only if it was just made visible or specifically requested
        if (!isYesterdaySectionVisible) {
            setTimeout(() => { // Timeout to allow display update before scroll
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
    const scrollArrowToday = document.getElementById('scroll-down-arrow-today'); // ID from HTML
    const quoteTextToday = document.getElementById('quote-text-today');
    const quoteTextYesterday = document.getElementById('quote-text-yesterday');
    const badiDateTitle = document.getElementById('badiDate');

    if (todayButton) {
        todayButton.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('main-jumbotron').scrollIntoView({ behavior: 'smooth' });
            // Update main info panel dates to today's
            const todayDateObj = new Date();
            displayGregorianDate(todayDateObj, "gregorianDatePanel");
            if (typeof initializeBadiCalendar === "function") {
                initializeBadiCalendar(todayDateObj, "badiDate"); 
            }
            todayButton.classList.add('button-active');
            yesterdayButton?.classList.remove('button-active');
            // Optionally hide yesterday's section if you want "Today" to reset the view
            // const yesterdaySection = document.getElementById('yesterday-jumbotron');
            // if (yesterdaySection) yesterdaySection.style.display = 'none';
            // isYesterdaySectionVisible = false;
        });
    }
    if (yesterdayButton) {
        yesterdayButton.addEventListener('click', (e) => {
            e.preventDefault();
            showYesterdaySection(); 
        });
    }
    if (scrollArrowToday) {
        scrollArrowToday.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('scroll-content-start')?.scrollIntoView({ behavior: 'smooth' });
        });
    }

    function copyQuoteToClipboard(quoteObj) { /* ... same copy logic ... */ }
    if (quoteTextToday) { /* ... same ... */ }
    if (quoteTextYesterday) { /* ... same ... */ }
    if (badiDateTitle) { /* ... same Gregorian toggle logic ... */ }
}

document.addEventListener('DOMContentLoaded', async () => {
    await initializeAndShowPage(); 
    setupEventListeners();
});