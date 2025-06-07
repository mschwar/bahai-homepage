// js/script.js

// --- START OF ALL FUNCTION DEFINITIONS ---
async function fetchQuotes(fileName = 'data/quotes_hidden_words.json') {
    console.log(`SCRIPT.JS: Fetching from: ${fileName}`);
    try {
        const response = await fetch(fileName); 
        if (!response.ok) {
            console.error(`SCRIPT.JS: HTTP error! status: ${response.status} for ${fileName}`);
            return []; 
        }
        const quotesData = await response.json();
        return quotesData;
    } catch (error) {
        console.error("SCRIPT.JS: Could not fetch or parse quotes:", error);
        return []; 
    }
}

// This function is NOT CALLED in this debug version
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

// This function is NOT CALLED in this debug version
function getQuoteByDay(quotesArray, dayOfYear) {
    if (!Array.isArray(quotesArray) || quotesArray.length === 0) return null;
    const adjustedDay = Math.max(1, Math.min(dayOfYear, 366));
    const quoteIndex = (adjustedDay - 1) % quotesArray.length;
    return quotesArray[quoteIndex];
}

function displaySingleQuote(quoteObject, textElId, authorElId, sourceElId) {
    console.log(`SCRIPT.JS: displaySingleQuote called for ${textElId} with quote:`, quoteObject ? quoteObject.text.substring(0,30)+"..." : "null");
    const quoteTextElement = document.getElementById(textElId);
    const quoteAuthorElement = document.getElementById(authorElId);
    const quoteSourceFullElement = document.getElementById(sourceElId);

    currentQuoteObjectForCopy = quoteObject; 

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
            console.warn("SCRIPT.JS: displaySingleQuote received null or invalid quoteObject.");
            quoteTextElement.textContent = "No suitable sacred verse available."; // This message will show if ALL_QUOTES[0] is bad
            quoteAuthorElement.textContent = "";
            quoteSourceFullElement.innerHTML = "";
            // Ensure opacity is reset if content is cleared
            quoteTextElement.style.opacity = 1; 
            quoteAuthorElement.style.opacity = 1;
            quoteSourceFullElement.style.opacity = 1;
        }
    } else {
        if(!quoteTextElement) console.error(`SCRIPT.JS: Element with ID '${textElId}' not found!`);
        if(!quoteAuthorElement) console.error(`SCRIPT.JS: Element with ID '${authorElId}' not found!`);
        if(!quoteSourceFullElement) console.error(`SCRIPT.JS: Element with ID '${sourceElId}' not found!`);
    }
}

function getDayOfYear(date = new Date()) { /* ... same ... */ } // Still needed for date display
function displayGregorianDate(date = new Date(), elementId = "gregorianDatePanel") { /* ... same ... */ } // Still needed

// These globals will be set, but SHORT_QUOTES and OFFSET won't be used by initializeAndShowPage in this version
let ALL_QUOTES = [];
let SHORT_QUOTES = []; // Will be empty in this debug version
let CURRENT_DISPLAY_DAY_OFFSET = 0; 
const MAX_QUOTE_WORDS = 75; // Defined globally but not used by initializeAndShowPage in this debug version
let currentQuoteObjectForCopy = null; // For the copy function
// let isYesterdaySectionVisible = false; // Not used in this simplified version

async function initializeAndShowPage() { 
    console.log("SCRIPT.JS: Entered initializeAndShowPage - FORCING FIRST QUOTE");
    ALL_QUOTES = await fetchQuotes('data/quotes_hidden_words.json'); 
    
    console.log("SCRIPT.JS: ALL_QUOTES length after fetch:", ALL_QUOTES ? ALL_QUOTES.length : 'undefined/null');
    if (!Array.isArray(ALL_QUOTES)) {
        console.error("SCRIPT.JS: ALL_QUOTES is not an array after fetch! Value:", ALL_QUOTES);
        ALL_QUOTES = []; 
    }

    if (ALL_QUOTES.length > 0) {
        console.log("SCRIPT.JS: Quotes fetched. Displaying the VERY FIRST quote from ALL_QUOTES.");
        // Force display of the very first quote from the JSON file
        displaySingleQuote(ALL_QUOTES[0], 'quote-text', 'quote-author', 'quote-source-full'); 
        
        const todayDateObj = new Date();
        displayGregorianDate(todayDateObj, "gregorianDatePanel");
        if (typeof initializeBadiCalendar === "function") {
            initializeBadiCalendar(todayDateObj, "badiDate");
        }
    } else {
        console.warn("SCRIPT.JS: No quotes in ALL_QUOTES or fetch failed. Cannot display first quote.");
        displaySingleQuote(null, 'quote-text', 'quote-author', 'quote-source-full'); 
    }
    // Bypassing filtering and daily selection logic for this test
    return ALL_QUOTES.length > 0; 
}

// This function will NOT be called by initializeAndShowPage in this debug version
function showQuoteForDayOffset(offset) { /* ... definition can remain but won't be primary call path ... */ }
function updateButtonActiveStates() { /* ... definition can remain ... */ }

function setupEventListeners() {
    // Yesterday/Today buttons will NOT change the quote in this debug version
    // as initializeAndShowPage only shows the first quote.
    // We keep them to ensure no errors if they are clicked.
    const todayButton = document.getElementById('today-button');
    const yesterdayButton = document.getElementById('yesterday-button');
    const scrollArrow = document.getElementById('scroll-down-arrow');
    const quoteTextElement = document.getElementById('quote-text');
    const badiDateTitle = document.getElementById('badiDate');

    if (todayButton) {
        todayButton.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("SCRIPT.JS: Today button clicked (debug mode - no quote change).");
            document.getElementById('main-jumbotron')?.scrollIntoView({ behavior: 'smooth' }); 
        });
    }
    if (yesterdayButton) {
        yesterdayButton.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("SCRIPT.JS: Yesterday button clicked (debug mode - no quote change).");
            document.getElementById('main-jumbotron')?.scrollIntoView({ behavior: 'smooth' });
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
            }).catch(err => console.error('Failed to copy text: ', err));
        } else {
            console.log("SCRIPT.JS: Attempted to copy, but no quote data available.");
        }
    }

    if (quoteTextElement) {
        quoteTextElement.addEventListener('click', () => copyQuoteToClipboard(currentQuoteObjectForCopy));
    }

    if (badiDateTitle) { /* ... same Gregorian toggle logic ... */ }
}
// --- END OF FUNCTION DEFINITIONS ---

// --- GLOBAL VARIABLE DECLARATIONS ---
// Moved MAX_QUOTE_WORDS to be with others if not already
// const MAX_QUOTE_WORDS = 75; // Defined above

// --- IMMEDIATE EXECUTION CODE (Theme Toggle) ---
const themeToggleButton = document.getElementById('theme-toggle-button');
// ... (rest of theme toggle logic) ...
if (themeToggleButton) { /* ... */ }


// --- MAIN DOMCONTENTLOADED LISTENER ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log("SCRIPT.JS: DOMContentLoaded event fired.");
    await initializeAndShowPage(); // This calls the modified version
    setupEventListeners();
});