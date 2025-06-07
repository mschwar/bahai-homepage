// js/script.js

// --- THEME TOGGLE ---
const themeToggleButton = document.getElementById('theme-toggle-button');
const currentTheme = localStorage.getItem('theme');

if (currentTheme) {
    document.body.classList.add(currentTheme);
} else {
    document.body.classList.add('light-mode'); // Default
}

if (themeToggleButton) {
    themeToggleButton.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        document.body.classList.toggle('light-mode');
        
        let theme = 'light-mode';
        if (document.body.classList.contains('dark-mode')) {
            theme = 'dark-mode';
        }
        localStorage.setItem('theme', theme);
    });
}
// --- END THEME TOGGLE ---


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
    if (!quotesArray) return [];
    return quotesArray.filter(quote => {
        if (quote && typeof quote.text === 'string') {
            const wordCount = quote.text.split(/\s+/).filter(word => word.length > 0).length;
            return wordCount <= maxWords;
        }
        return false;
    });
}

function getQuoteByDay(quotesArray, dayOfYear) {
    if (!quotesArray || quotesArray.length === 0) return null;
    const adjustedDay = Math.max(1, Math.min(dayOfYear, 366)); // Ensure day is 1-366
    const quoteIndex = (adjustedDay - 1) % quotesArray.length;
    return quotesArray[quoteIndex];
}

let currentQuoteObjectForCopy = null; // Store current quote for copy function

function displayQuote(quoteObject) {
    const quoteTextElement = document.getElementById('quote-text');
    const quoteAuthorElement = document.getElementById('quote-author');
    const quoteSourceFullElement = document.getElementById('quote-source-full');

    currentQuoteObjectForCopy = quoteObject; // Update for copy button

    if (quoteTextElement && quoteAuthorElement && quoteSourceFullElement) {
        if (quoteObject && quoteObject.text) {
            quoteTextElement.style.opacity = 0;
            quoteAuthorElement.style.opacity = 0;
            quoteSourceFullElement.style.opacity = 0;

            setTimeout(() => {
                quoteTextElement.textContent = quoteObject.text; 
                
                let authorDisplay = quoteObject.author || 'Unknown';
                // (Keep your specific author display logic here if needed for Gita etc.)
                // For Hidden Words, quoteObject.author is "Bahá’u’lláh"
                if (quoteObject.tradition === "Bahá’í") {
                    authorDisplay = "Bahá’u’lláh";
                } // Add other conditions as you add more texts

                quoteAuthorElement.textContent = `— ${authorDisplay}`;
                
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

function getDayOfYear(date = new Date()) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
}

function displayGregorianDateForPanel(date = new Date()) {
    const gregorianDatePanelElement = document.getElementById('gregorianDatePanel');
    if (gregorianDatePanelElement) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        gregorianDatePanelElement.textContent = `${year}-${month}-${day}`;
    }
}

let ALL_QUOTES = [];
let SHORT_QUOTES = [];
let CURRENT_DISPLAY_DAY_OFFSET = 0; 
const MAX_QUOTE_WORDS = 75;

async function initializeQuotes() {
    ALL_QUOTES = await fetchQuotes('data/quotes_hidden_words.json'); 
    if (ALL_QUOTES.length === 0) { displayQuote(null); return false; }
    SHORT_QUOTES = filterQuotesByLength(ALL_QUOTES, MAX_QUOTE_WORDS);
    console.log(`Fetched ${ALL_QUOTES.length} quotes, filtered to ${SHORT_QUOTES.length} quotes with <= ${MAX_QUOTE_WORDS} words.`);
    if (SHORT_QUOTES.length === 0) { displayQuote(null); return false; }
    return true;
}

function showQuoteForOffset(offset) {
    if (SHORT_QUOTES.length === 0) { displayQuote(null); return; }

    const todayDateObj = new Date(); // Base "today" for offset calculation
    const targetDateObj = new Date(todayDateObj);
    targetDateObj.setDate(todayDateObj.getDate() + offset); 

    const dayOfYearToDisplay = getDayOfYear(targetDateObj);
    const quote = getQuoteByDay(SHORT_QUOTES, dayOfYearToDisplay);
    displayQuote(quote);

    CURRENT_DISPLAY_DAY_OFFSET = offset;
    updateButtonStates();

    displayGregorianDateForPanel(targetDateObj); // Update Gregorian date in panel

    if (typeof initializeBadiCalendar === "function") {
        initializeBadiCalendar(targetDateObj); // Update Badi date for the target day
    }
}

function updateButtonStates() {
    const todayButton = document.getElementById('today-button');
    const yesterdayButton = document.getElementById('yesterday-button');
    if(todayButton && yesterdayButton){
        todayButton.classList.toggle('button-active', CURRENT_DISPLAY_DAY_OFFSET === 0);
        yesterdayButton.classList.toggle('button-active', CURRENT_DISPLAY_DAY_OFFSET === -1);
    }
}

function setupEventListeners() {
    const todayButton = document.getElementById('today-button');
    const yesterdayButton = document.getElementById('yesterday-button');
    const scrollArrow = document.querySelector('.scroll-down-arrow');
    const copyButton = document.getElementById('copy-quote-button');

    if (todayButton) {
        todayButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (CURRENT_DISPLAY_DAY_OFFSET !== 0) showQuoteForOffset(0);
        });
    }
    if (yesterdayButton) {
        yesterdayButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (CURRENT_DISPLAY_DAY_OFFSET !== -1) showQuoteForOffset(-1);
        });
    }
    if (scrollArrow) {
        scrollArrow.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('scroll-content-start')?.scrollIntoView({ behavior: 'smooth' });
        });
    }
    if (copyButton) {
        copyButton.addEventListener('click', () => {
            if (currentQuoteObjectForCopy && currentQuoteObjectForCopy.text) {
                const textToCopy = `${currentQuoteObjectForCopy.text}\n— ${currentQuoteObjectForCopy.author || ''}, ${currentQuoteObjectForCopy.source || ''}`;
                navigator.clipboard.writeText(textToCopy).then(() => {
                    // Optional: Show a "Copied!" message
                    copyButton.textContent = '✅';
                    setTimeout(() => { copyButton.textContent = '📋'; }, 1500);
                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                    alert('Failed to copy quote.');
                });
            }
        });
    }
}

// Main execution
document.addEventListener('DOMContentLoaded', async () => {
    const quotesReady = await initializeQuotes();
    if (quotesReady) {
        showQuoteForOffset(0); 
    }
    setupEventListeners();
});