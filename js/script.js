// js/script.js

// --- THEME TOGGLE ---
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

// --- QUOTE LOGIC ---
let ALL_QUOTES = [];
let SHORT_QUOTES = [];
let CURRENT_DISPLAY_DAY_OFFSET = 0; // 0 for today, -1 for yesterday
const MAX_QUOTE_WORDS = 75; 
let currentQuoteObjectForCopy = null;

async function fetchQuotes(fileName = 'data/quotes_hidden_words.json') {
    try {
        const response = await fetch(fileName); 
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status} for ${fileName}`);
        return await response.json();
    } catch (error) {
        console.error("Could not fetch quotes:", error);
        return [];
    }
}

function filterQuotesByLength(quotesArray, maxWords) {
    if (!Array.isArray(quotesArray)) return [];
    return quotesArray.filter(quote => {
        if (quote && typeof quote.text === 'string') {
            const wordCount = quote.text.split(/\s+/).filter(word => word.length > 0).length;
            return wordCount <= maxWords;
        }
        return false;
    });
}

function getQuoteByDay(quotesArray, dayOfYear) {
    if (!Array.isArray(quotesArray) || quotesArray.length === 0) return null;
    const adjustedDay = Math.max(1, Math.min(dayOfYear, 366));
    const quoteIndex = (adjustedDay - 1) % quotesArray.length;
    return quotesArray[quoteIndex];
}

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
                
                quoteAuthorElement.textContent = authorDisplay;
                
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
    displayQuoteInJumbotron(quote); 

    CURRENT_DISPLAY_DAY_OFFSET = offset; 
    updateButtonActiveStates();

    displayGregorianDate(targetDateObj, "gregorianDatePanel");
    if (typeof initializeBadiCalendar === "function") {
        initializeBadiCalendar(targetDateObj, "badiDate"); 
    }
}

function updateButtonActiveStates() { /* ... same ... */ }
function setupEventListeners() {
    const todayButton = document.getElementById('today-button');
    const yesterdayButton = document.getElementById('yesterday-button');
    const scrollArrow = document.getElementById('scroll-down-arrow');
    const quoteTextElement = document.getElementById('quote-text');
    const badiDateTitle = document.getElementById('badiDate');

    if (todayButton) {
        todayButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (CURRENT_DISPLAY_DAY_OFFSET !== 0) {
                showQuoteForDayOffset(0);
            }
            document.getElementById('main-jumbotron')?.scrollIntoView({ behavior: 'smooth' }); 
        });
    }
    if (yesterdayButton) {
        yesterdayButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (CURRENT_DISPLAY_DAY_OFFSET !== -1) {
                showQuoteForDayOffset(-1);
            }
            document.getElementById('main-jumbotron')?.scrollIntoView({ behavior: 'smooth' });
        });
    }
    if (scrollArrow) { /* ... */ }
    function copyQuoteToClipboard(quoteObj) { /* ... same ... */ }
    if (quoteTextElement) { quoteTextElement.addEventListener('click', () => copyQuoteToClipboard(currentQuoteObjectForCopy)); }
    if (badiDateTitle) { /* ... same Gregorian toggle logic ... */ }
}

document.addEventListener('DOMContentLoaded', async () => {
    await initializeAndShowPage(); 
    setupEventListeners();
});