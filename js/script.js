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
const MAX_QUOTE_WORDS = 75; // User-configurable
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
        // Fade out
        quoteTextElement.style.opacity = 0;
        quoteAuthorElement.style.opacity = 0;
        quoteSourceFullElement.style.opacity = 0;

        setTimeout(() => { // Allow fade out before changing content
            if (quoteObject && quoteObject.text) {
                quoteTextElement.textContent = quoteObject.text; 
                
                let authorDisplay = quoteObject.author || 'Unknown';
                // Add specific author display logic if needed, e.g. for Gita, Hidden Words
                if (quoteObject.tradition === "Bahá’í") authorDisplay = "Bahá’u’lláh";
                
                quoteAuthorElement.textContent = authorDisplay; // No hyphen, CSS can add if needed
                
                let sourceText = quoteObject.source || 'Unknown Source';
                let translatorInfo = quoteObject.translator ? ` (trans. ${quoteObject.translator})` : '';
                quoteSourceFullElement.innerHTML = `<cite>${sourceText}</cite>${translatorInfo}`;
            } else {
                quoteTextElement.textContent = "No suitable sacred verse available.";
                quoteAuthorElement.textContent = "";
                quoteSourceFullElement.innerHTML = "";
            }
            // Fade in
            quoteTextElement.style.opacity = 1;
            quoteAuthorElement.style.opacity = 1;
            quoteSourceFullElement.style.opacity = 1;
        }, 200); // Duration of fade-out (should match CSS transition if used differently)
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
    if (ALL_QUOTES.length === 0) { displayQuoteInJumbotron(null); return false; }
    
    SHORT_QUOTES = filterQuotesByLength(ALL_QUOTES, MAX_QUOTE_WORDS);
    if (!Array.isArray(SHORT_QUOTES)) SHORT_QUOTES = []; 
    console.log(`Fetched ${ALL_QUOTES.length} total quotes, filtered to ${SHORT_QUOTES.length} quotes with <= ${MAX_QUOTE_WORDS} words.`);
    if (SHORT_QUOTES.length === 0) { displayQuoteInJumbotron(null); return false; }

    showQuoteForDayOffset(0); // Show today's quote and dates
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

    displayGregorianDate(targetDateObj, "gregorianDatePanel"); // Update Gregorian in panel
    if (typeof initializeBadiCalendar === "function") {
        initializeBadiCalendar(targetDateObj, "badiDate"); // Update Badi in panel
    }
}

function updateButtonActiveStates() {
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
    const scrollArrow = document.getElementById('scroll-down-arrow');
    const quoteTextElement = document.getElementById('quote-text');
    const badiDateTitle = document.getElementById('badiDate');

    if (todayButton) {
        todayButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (CURRENT_DISPLAY_DAY_OFFSET !== 0) {
                showQuoteForDayOffset(0);
            }
            window.scrollTo({ top: 0, behavior: 'smooth' }); 
        });
    }
    if (yesterdayButton) {
        yesterdayButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (CURRENT_DISPLAY_DAY_OFFSET !== -1) {
                showQuoteForDayOffset(-1);
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    if (scrollArrow) {
        scrollArrow.addEventListener('click', (e) => {
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

    if (quoteTextElement) {
        quoteTextElement.addEventListener('click', () => copyQuoteToClipboard(currentQuoteObjectForCopy));
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
                             gregorianEl.classList.add('visible'); // Add if CSS uses it
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