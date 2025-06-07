// js/script.js

// --- START OF ALL FUNCTION DEFINITIONS ---
async function fetchQuotes(fileName = 'data/quotes_hidden_words.json') {
    // console.log(`Fetching from: ${fileName}`);
    try {
        const response = await fetch(fileName); 
        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status} for ${fileName}`);
            return []; 
        }
        const quotesData = await response.json();
        return quotesData;
    } catch (error) {
        console.error("Could not fetch or parse quotes:", error);
        return []; 
    }
}

function filterQuotesByLength(quotesArray, maxWords) { // maxWords will be passed from the global const
    if (!Array.isArray(quotesArray)) { 
        // console.warn("filterQuotesByLength received non-array:", quotesArray);
        return [];
    }
    return quotesArray.filter(quote => {
        if (quote && typeof quote.text === 'string') {
            const wordCount = quote.text.split(/\s+/).filter(word => word.length > 0).length;
            return wordCount <= maxWords;
        }
        return false;
    });
}

function getQuoteByDay(quotesArray, dayOfYear) {
    if (!Array.isArray(quotesArray) || quotesArray.length === 0) { 
        return null;
    }
    const adjustedDay = Math.max(1, Math.min(dayOfYear, 366));
    const quoteIndex = (adjustedDay - 1) % quotesArray.length;
    return quotesArray[quoteIndex];
}

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
                if (quoteObject.tradition === "Bahá’í") authorDisplay = "Bahá’u’lláh";
                
                quoteAuthorElement.textContent = authorDisplay; 
                
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

function displayGregorianDate(date = new Date(), elementId = "gregorianDatePanel") {
    const gregorianDateElement = document.getElementById(elementId);
    if (gregorianDateElement) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        gregorianDateElement.textContent = `${year}-${month}-${day}`;
    }
}

async function initializeAndShowPage() { 
    ALL_QUOTES = await fetchQuotes('data/quotes_hidden_words.json'); 
    if (!Array.isArray(ALL_QUOTES)) ALL_QUOTES = []; 
    if (ALL_QUOTES.length === 0) { 
        displaySingleQuote(null, 'quote-text-today', 'quote-author-today', 'quote-source-full-today'); 
        return false; 
    }
    
    // MAX_QUOTE_WORDS is now accessed from global scope
    SHORT_QUOTES = filterQuotesByLength(ALL_QUOTES, MAX_QUOTE_WORDS); 
    if (!Array.isArray(SHORT_QUOTES)) SHORT_QUOTES = []; 
    console.log(`Fetched ${ALL_QUOTES.length} total quotes, filtered to ${SHORT_QUOTES.length} quotes with <= ${MAX_QUOTE_WORDS} words.`);
    if (SHORT_QUOTES.length === 0) { 
        displaySingleQuote(null, 'quote-text-today', 'quote-author-today', 'quote-source-full-today'); 
        return false; 
    }

    showQuoteForDayOffset(0); 
    return true; 
}

function showYesterdaySection() {
    if (SHORT_QUOTES.length === 0) {
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
        if (!isYesterdaySectionVisible) { 
            setTimeout(() => { 
                 yesterdaySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 50); 
        }
        isYesterdaySectionVisible = true;
    }
    
    document.getElementById('yesterday-button')?.classList.add('button-active');
    document.getElementById('today-button')?.classList.remove('button-active');
}

function showQuoteForDayOffset(offset) { 
    if (SHORT_QUOTES.length === 0) { 
        displaySingleQuote(null, 'quote-text-today', 'quote-author-today', 'quote-source-full-today'); 
        return; 
    }

    const todayDateObj = new Date(); 
    const targetDateObj = new Date(todayDateObj);
    targetDateObj.setDate(todayDateObj.getDate() + offset); 

    const dayOfYearToDisplay = getDayOfYear(targetDateObj);
    const quote = getQuoteByDay(SHORT_QUOTES, dayOfYearToDisplay);
    displaySingleQuote(quote, 'quote-text-today', 'quote-author-today', 'quote-source-full-today'); 

    CURRENT_DISPLAY_DAY_OFFSET = offset; 
    updateButtonActiveStates();

    displayGregorianDate(targetDateObj, "gregorianDatePanel");
    if (typeof initializeBadiCalendar === "function") {
        initializeBadiCalendar(targetDateObj, "badiDate"); 
    }
}

function updateButtonActiveStates() {
    const todayButton = document.getElementById('today-button');
    const yesterdayButton = document.getElementById('yesterday-button');
    if(todayButton && yesterdayButton){
        todayButton.classList.toggle('button-active', CURRENT_DISPLAY_DAY_OFFSET === 0);
        yesterdayButton.classList.toggle('button-active', CURRENT_DISPLAY_DAY_OFFSET === -1 && isYesterdaySectionVisible); 
        // Only make yesterday button active if its section is actually shown
    }
}

function setupEventListeners() {
    const todayButton = document.getElementById('today-button');
    const yesterdayButton = document.getElementById('yesterday-button');
    const scrollArrowToday = document.getElementById('scroll-down-arrow-today');
    const quoteTextToday = document.getElementById('quote-text-today');
    const quoteTextYesterday = document.getElementById('quote-text-yesterday');
    const badiDateTitle = document.getElementById('badiDate');

    if (todayButton) {
        todayButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (CURRENT_DISPLAY_DAY_OFFSET !== 0 && !isYesterdaySectionVisible) { // If main quote was yesterday's
                showQuoteForDayOffset(0); 
            }
            document.getElementById('main-jumbotron').scrollIntoView({ behavior: 'smooth' });
            const todayDateObj = new Date();
            displayGregorianDate(todayDateObj, "gregorianDatePanel");
            if (typeof initializeBadiCalendar === "function") {
                initializeBadiCalendar(todayDateObj, "badiDate"); 
            }
            todayButton.classList.add('button-active');
            yesterdayButton?.classList.remove('button-active');
            
            const yesterdaySection = document.getElementById('yesterday-jumbotron');
            if (yesterdaySection) yesterdaySection.style.display = 'none';
            isYesterdaySectionVisible = false;
            CURRENT_DISPLAY_DAY_OFFSET = 0; // Reset offset when today is explicitly clicked
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

    function copyQuoteToClipboard(quoteObj) { 
        if (quoteObj && quoteObj.text) {
            let textToCopy = quoteObj.text;
            if (quoteObj.author) textToCopy += `\n— ${quoteObj.author}`;
            if (quoteObj.source) textToCopy += `, ${quoteObj.source}`;
            if (quoteObj.translator) textToCopy += ` (trans. ${quoteObj.translator})`;
            
            navigator.clipboard.writeText(textToCopy.trim()).then(() => {
                alert("Quote copied to clipboard!"); 
            }).catch(err => {
                console.error('Failed to copy text: ', err);
                alert("Could not copy quote.");
            });
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
// --- END OF FUNCTION DEFINITIONS ---

// --- GLOBAL VARIABLE DECLARATIONS ---
let ALL_QUOTES = [];
let SHORT_QUOTES = [];
let CURRENT_DISPLAY_DAY_OFFSET = 0; 
const MAX_QUOTE_WORDS = 75; // NOW GLOBAL
let currentQuoteObjectForToday = null;
let currentQuoteObjectForYesterday = null;
let isYesterdaySectionVisible = false; 

// --- IMMEDIATE EXECUTION CODE (Theme Toggle) ---
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
// --- END IMMEDIATE EXECUTION CODE ---

// --- MAIN DOMCONTENTLOADED LISTENER ---
document.addEventListener('DOMContentLoaded', async () => {
    await initializeAndShowPage(); 
    setupEventListeners();
});