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
            // No opacity animation for now, can be added back if desired
            quoteTextElement.textContent = quoteObject.text; 
            
            let authorDisplay = quoteObject.author || 'Unknown';
            if (quoteObject.tradition === "Bahá’í") {
                authorDisplay = "Bahá’u’lláh";
            } // Add more author logic as needed
            
            quoteAuthorElement.textContent = authorDisplay; // Hyphen removed from JS, CSS can add "— " if desired via ::before
            
            let sourceText = quoteObject.source || 'Unknown Source';
            let translatorInfo = quoteObject.translator ? ` (trans. ${quoteObject.translator})` : '';
            // If you want <cite> tags, use innerHTML. If just text, use textContent.
            quoteSourceFullElement.innerHTML = `<cite>${sourceText}</cite>${translatorInfo}`; 
            // quoteSourceFullElement.textContent = `${sourceText}${translatorInfo}`; // Alternative if no <cite>

        } else {
            quoteTextElement.textContent = "No suitable sacred verse available.";
            quoteAuthorElement.textContent = "";
            quoteSourceFullElement.textContent = ""; // Use textContent for clearing
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
        // Ensure it's visible if it was hidden and now has content
        // This will be handled by the click toggle now
    }
}

let ALL_QUOTES = [];
let SHORT_QUOTES = [];
const MAX_QUOTE_WORDS = 75;

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
    
    displayGregorianDate(todayDateObj, "gregorianDatePanel");
    if (typeof initializeBadiCalendar === "function") {
        initializeBadiCalendar(todayDateObj, "badiDate");
    }
    return true; 
}

let yesterdayQuoteLoaded = false; // Track if yesterday's quote has been loaded

function showYesterdayQuote() { 
    if (SHORT_QUOTES.length === 0) {
        // Potentially try to init quotes if not already done
        if (ALL_QUOTES.length > 0) SHORT_QUOTES = filterQuotesByLength(ALL_QUOTES, MAX_QUOTE_WORDS);
        if (SHORT_QUOTES.length === 0) {
             displaySingleQuote(null, 'quote-text-yesterday', 'quote-author-yesterday', 'quote-source-full-yesterday');
             return;
        }
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
        yesterdaySection.style.display = 'flex'; 
        if (!yesterdayQuoteLoaded) { // Only scroll into view the first time it's shown
            setTimeout(() => {
                 yesterdaySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
            yesterdayQuoteLoaded = true;
        }
    }
    
    // Update button states
    document.getElementById('yesterday-button')?.classList.add('button-active');
    document.getElementById('today-button')?.classList.remove('button-active');
}


function setupEventListeners() {
    const todayButton = document.getElementById('today-button'); // Corrected ID
    const yesterdayButton = document.getElementById('yesterday-button'); // Corrected ID
    const scrollArrowToday = document.getElementById('scroll-down-arrow-today');
    const quoteTextToday = document.getElementById('quote-text-today');
    const quoteTextYesterday = document.getElementById('quote-text-yesterday');
    const badiDateTitle = document.getElementById('badiDate');

    if (todayButton) {
        todayButton.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('today-jumbotron').scrollIntoView({ behavior: 'smooth' });
            // No need to re-fetch today's quote, it's always there.
            // Update Badi/Gregorian in info panel to today's date
            const todayDateObj = new Date();
            displayGregorianDate(todayDateObj, "gregorianDatePanel");
            if (typeof initializeBadiCalendar === "function") {
                initializeBadiCalendar(todayDateObj, "badiDate"); // Updates main Badi date
            }
            todayButton.classList.add('button-active');
            yesterdayButton?.classList.remove('button-active');
        });
    }
    if (yesterdayButton) {
        yesterdayButton.addEventListener('click', (e) => {
            e.preventDefault();
            showYesterdayQuote(); // This function now handles display and scroll
        });
    }
    if (scrollArrowToday) {
        scrollArrowToday.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('scroll-content-start')?.scrollIntoView({ behavior: 'smooth' });
        });
    }

    function copyQuoteToClipboard(quoteObj, clickedElement) { 
        if (quoteObj && quoteObj.text) {
            // Construct text: Quote, then Author, then Source, then Translator if exists
            let textToCopy = quoteObj.text;
            if (quoteObj.author) textToCopy += `\n— ${quoteObj.author}`;
            if (quoteObj.source) textToCopy += `, ${quoteObj.source}`;
            if (quoteObj.translator) textToCopy += ` (trans. ${quoteObject.translator})`;
            
            navigator.clipboard.writeText(textToCopy.trim()).then(() => {
                console.log('Quote copied to clipboard!');
                if (clickedElement) {
                    const originalCursor = clickedElement.style.cursor;
                    clickedElement.style.cursor = 'default'; // Indicate something happened
                    // Could add a more visible temporary feedback
                    setTimeout(() => { clickedElement.style.cursor = originalCursor; }, 700);
                }
            }).catch(err => console.error('Failed to copy text: ', err));
        }
    }

    if (quoteTextToday) {
        quoteTextToday.addEventListener('click', (e) => copyQuoteToClipboard(currentQuoteObjectForToday, e.target));
    }
    if (quoteTextYesterday) {
        quoteTextYesterday.addEventListener('click', (e) => copyQuoteToClipboard(currentQuoteObjectForYesterday, e.target));
    }

    if (badiDateTitle) {
        badiDateTitle.addEventListener('click', () => {
            const gregorianEl = document.getElementById('gregorianDatePanel');
            if (gregorianEl) {
                const isCurrentlyHidden = gregorianEl.style.display === 'none' || gregorianEl.style.display === '';
                if (isCurrentlyHidden) {
                    gregorianEl.style.display = 'block';
                    // Trigger reflow for transition
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                             gregorianEl.classList.add('visible'); // Assuming you have CSS for .visible opacity
                        });
                    });
                } else {
                    gregorianEl.classList.remove('visible');
                    // Listen for transition end to set display: none
                    gregorianEl.addEventListener('transitionend', function handler() {
                        if (!gregorianEl.classList.contains('visible')) {
                             gregorianEl.style.display = 'none';
                        }
                        gregorianEl.removeEventListener('transitionend', handler);
                    });
                }
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await initializeAndShowToday(); 
    setupEventListeners();
});