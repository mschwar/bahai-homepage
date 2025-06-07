// js/script.js

// --- THEME TOGGLE --- (Keep as is)
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
// --- END THEME TOGGLE ---


async function fetchQuotes(fileName = 'data/quotes_hidden_words.json') { /* ... same ... */ 
    try {
        const response = await fetch(fileName); 
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status} for ${fileName}`);
        return await response.json();
    } catch (error) {
        console.error("Could not fetch quotes:", error);
        return [];
    }
}

function filterQuotesByLength(quotesArray, maxWords) { /* ... same ... */ 
    if (!quotesArray) return [];
    return quotesArray.filter(quote => {
        if (quote && typeof quote.text === 'string') {
            const wordCount = quote.text.split(/\s+/).filter(word => word.length > 0).length;
            return wordCount <= maxWords;
        }
        return false;
    });
}

function getQuoteByDay(quotesArray, dayOfYear) { /* ... same ... */
    if (!quotesArray || quotesArray.length === 0) return null;
    const adjustedDay = Math.max(1, Math.min(dayOfYear, 366));
    const quoteIndex = (adjustedDay - 1) % quotesArray.length;
    return quotesArray[quoteIndex];
}

let currentQuoteObjectForCopy = null; 

function displayQuote(quoteObject) {
    const quoteTextElement = document.getElementById('quote-text');
    const quoteAuthorElement = document.getElementById('quote-author'); 
    const quoteSourceFullElement = document.getElementById('quote-source-full');

    currentQuoteObjectForCopy = quoteObject; 

    if (quoteTextElement && quoteAuthorElement && quoteSourceFullElement) {
        if (quoteObject && quoteObject.text) {
            quoteTextElement.style.opacity = 0;
            quoteAuthorElement.style.opacity = 0;
            quoteSourceFullElement.style.opacity = 0;

            setTimeout(() => {
                quoteTextElement.textContent = quoteObject.text; 
                
                let authorDisplay = quoteObject.author || 'Unknown';
                // ... (your existing author/speaker display logic) ...
                if (quoteObject.tradition === "Bahá’í") { // Example
                    authorDisplay = "Bahá’u’lláh";
                } else if (quoteObject.tradition === "Hinduism" && quoteObject.book && quoteObject.book.includes("Bhagavad-Gita")) {
                    authorDisplay = "Krishna (Bhagavad-Gita)";
                }


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

function getDayOfYear(date = new Date()) { /* ... same ... */ 
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
}

function displayGregorianDateForPanel(date = new Date()) { /* ... same ... */
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

async function initializeQuotes() { /* ... same ... */
    ALL_QUOTES = await fetchQuotes('data/quotes_hidden_words.json'); 
    if (ALL_QUOTES.length === 0) { displayQuote(null); return false; }
    SHORT_QUOTES = filterQuotesByLength(ALL_QUOTES, MAX_QUOTE_WORDS);
    console.log(`Fetched ${ALL_QUOTES.length} quotes, filtered to ${SHORT_QUOTES.length} quotes with <= ${MAX_QUOTE_WORDS} words.`);
    if (SHORT_QUOTES.length === 0) { displayQuote(null); return false; }
    return true;
}

function showQuoteForOffset(offset) { /* ... same, calls initializeBadiCalendar ... */
    if (SHORT_QUOTES.length === 0) { displayQuote(null); return; }
    const todayDateObj = new Date();
    const targetDateObj = new Date(todayDateObj);
    targetDateObj.setDate(todayDateObj.getDate() + offset); 
    const dayOfYearToDisplay = getDayOfYear(targetDateObj);
    const quote = getQuoteByDay(SHORT_QUOTES, dayOfYearToDisplay);
    displayQuote(quote);
    CURRENT_DISPLAY_DAY_OFFSET = offset;
    updateButtonStates();
    displayGregorianDateForPanel(targetDateObj);
    if (typeof initializeBadiCalendar === "function") {
        initializeBadiCalendar(targetDateObj); 
    }
}

function updateButtonStates() { /* ... same ... */
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
    const quoteTextElement = document.getElementById('quote-text'); // Get quote text element

    // ... (todayButton, yesterdayButton, scrollArrow event listeners same as before) ...
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

    // NEW: Click-to-copy for the quote text itself
    if (quoteTextElement) {
        quoteTextElement.addEventListener('click', () => {
            if (currentQuoteObjectForCopy && currentQuoteObjectForCopy.text) {
                const textToCopy = `${currentQuoteObjectForCopy.text}\n— ${currentQuoteObjectForCopy.author || ''}, ${currentQuoteObjectForCopy.source || ''}`;
                navigator.clipboard.writeText(textToCopy).then(() => {
                    // Brief visual feedback (optional)
                    // You could briefly change its style or show a tiny temporary message
                    console.log('Quote copied to clipboard!');
                    // Example: briefly change color
                    const originalColor = quoteTextElement.style.color;
                    quoteTextElement.style.color = 'var(--text-color-info, #3498db)'; // Use a theme color
                    setTimeout(() => { quoteTextElement.style.color = originalColor; }, 700);
                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                    // Might need to fall back to a prompt for older browsers or if permissions denied
                    // For simplicity, just log error for now.
                });
            }
        });
    }

    // Removed old copyButton event listener
}

// Main execution (DOMContentLoaded) - no major changes here needed for these requests
document.addEventListener('DOMContentLoaded', async () => {
    const gregorianDateElement = document.getElementById('gregorianDatePanel'); // Check the panel one
    if (!gregorianDateElement) { 
      const oldGregorianDatePlaceholder = document.getElementById('gregorianDate');
      if(oldGregorianDatePlaceholder) oldGregorianDatePlaceholder.style.display = 'none'; 
    }
    
    const quotesReady = await initializeQuotes();
    if (quotesReady) {
        showQuoteForOffset(0); 
    }
    setupEventListeners();
});