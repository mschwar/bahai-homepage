// js/script.js

// --- START OF FUNCTION DEFINITIONS ---

// Helper and Core Logic Functions
async function fetchQuotes(fileName = 'data/quotes_hidden_words.json') {
    console.log(`Fetching from: ${fileName}`); // Added log
    try {
        const response = await fetch(fileName); 
        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status} for ${fileName}`);
            // throw new Error(`HTTP error! status: ${response.status} for ${fileName}`);
            return []; // Return empty array on fetch error
        }
        const quotesData = await response.json();
        // console.log("Quotes data fetched:", quotesData); // Optional: log fetched data
        return quotesData;
    } catch (error) {
        console.error("Could not fetch or parse quotes:", error);
        return []; // Ensure an array is always returned
    }
}

function filterQuotesByLength(quotesArray, maxWords) {
    if (!Array.isArray(quotesArray)) { // Check if it's an array
        console.warn("filterQuotesByLength received non-array:", quotesArray);
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
    if (!Array.isArray(quotesArray) || quotesArray.length === 0) { // Check if it's a non-empty array
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
                if (quoteObject.tradition === "Bahá’í") {
                    authorDisplay = "Bahá’u’lláh";
                } else if (quoteObject.tradition === "Hinduism" && quoteObject.book && quoteObject.book.includes("Bhagavad-Gita")) {
                    authorDisplay = "Krishna (Bhagavad-Gita)";
                } else if (quoteObject.tradition === "Buddhism" && quoteObject.book === "The Dhammapada"){
                    authorDisplay = "Buddha";
                }
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
    } else {
        // console.error("Missing one or more display elements:", {textElId, authorElId, sourceElId});
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

// State Management and Main Logic Functions
let ALL_QUOTES = [];
let SHORT_QUOTES = [];
let CURRENT_DISPLAY_DAY_OFFSET = 0; // Not strictly needed if today button just scrolls up
const MAX_QUOTE_WORDS = 75;
let currentQuoteObjectForToday = null;
let currentQuoteObjectForYesterday = null;

async function initializeAndShowToday() {
    console.log("Initializing quotes...");
    try {
        ALL_QUOTES = await fetchQuotes('data/quotes_hidden_words.json'); // Ensure this file exists and is correct
        
        if (!Array.isArray(ALL_QUOTES)) {
            console.error("fetchQuotes did not return an array. ALL_QUOTES is:", ALL_QUOTES);
            ALL_QUOTES = []; 
        }

        if (ALL_QUOTES.length === 0) { 
            console.warn("No quotes fetched or ALL_QUOTES is empty.");
            displaySingleQuote(null, 'quote-text-today', 'quote-author-today', 'quote-source-full-today'); 
            return false;
        }

        SHORT_QUOTES = filterQuotesByLength(ALL_QUOTES, MAX_QUOTE_WORDS);

        if (!Array.isArray(SHORT_QUOTES)) {
            console.error("filterQuotesByLength did not return an array. SHORT_QUOTES is:", SHORT_QUOTES);
            SHORT_QUOTES = []; 
        }
        
        console.log(`Fetched ${ALL_QUOTES.length} total quotes, filtered to ${SHORT_QUOTES.length} quotes with <= ${MAX_QUOTE_WORDS} words.`);

        if (SHORT_QUOTES.length === 0) { 
            console.warn(`No quotes found that meet the max word count of ${MAX_QUOTE_WORDS}.`);
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

    } catch (error) {
        console.error("Error during initializeAndShowToday:", error);
        displaySingleQuote(null, 'quote-text-today', 'quote-author-today', 'quote-source-full-today');
        return false; 
    }
}

function showYesterdayQuote() { // Renamed from showQuoteForOffset to be specific
    if (SHORT_QUOTES.length === 0 && ALL_QUOTES.length > 0) {
        SHORT_QUOTES = filterQuotesByLength(ALL_QUOTES, MAX_QUOTE_WORDS);
        if(SHORT_QUOTES.length === 0) {
            displaySingleQuote(null, 'quote-text-yesterday', 'quote-author-yesterday', 'quote-source-full-yesterday');
            return;
        }
    } else if (SHORT_QUOTES.length === 0) {
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
        yesterdaySection.style.display = 'flex'; 
        // Scroll after a short delay to ensure content is populated and layout is ready
        setTimeout(() => {
             yesterdaySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100); // Adjust delay if needed, 100ms should be enough for text population
    }
    
    // Update button states (if keeping active states)
    document.getElementById('show-yesterday-button')?.classList.add('button-active');
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
            // Optionally hide yesterday's section if it's visible
            // document.getElementById('yesterday-jumbotron').style.display = 'none';
            // And reset Badi/Gregorian dates in the main panel to today
            const todayDateObj = new Date();
            displayGregorianDate(todayDateObj, "gregorianDatePanel");
            if (typeof initializeBadiCalendar === "function") {
                initializeBadiCalendar(todayDateObj, "badiDate");
            }
            viewTodayButton.classList.add('button-active');
            showYesterdayButton?.classList.remove('button-active');
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

    function copyQuoteToClipboard(quoteObj, clickedElement) { // Added clickedElement for feedback
        if (quoteObj && quoteObj.text) {
            const textToCopy = `${quoteObj.text}\n— ${quoteObj.author || ''}${quoteObj.source ? ', ' + quoteObj.source : ''}${quoteObj.translator ? ' (trans. ' + quoteObj.translator + ')' : ''}`;
            navigator.clipboard.writeText(textToCopy).then(() => {
                console.log('Quote copied to clipboard!');
                if (clickedElement) {
                    const originalColor = clickedElement.style.color;
                    clickedElement.style.color = 'var(--text-color-info)'; 
                    setTimeout(() => { clickedElement.style.color = originalColor; }, 700);
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
                const isHidden = gregorianEl.style.display === 'none' || gregorianEl.style.display === '';
                gregorianEl.style.display = isHidden ? 'block' : 'none';
                gregorianEl.style.opacity = isHidden ? 1 : 0; // For smoother transition if CSS supports it
            }
        });
    }
}

// --- THEME TOGGLE --- (This should be at the very top or called early)
const themeToggleButton = document.getElementById('theme-toggle-button');
const currentTheme = localStorage.getItem('theme');

if (currentTheme) {
    document.body.classList.add(currentTheme);
} else {
    document.body.classList.add('light-mode'); 
}

if (themeToggleButton) { // Ensure button exists before adding listener
    themeToggleButton.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        document.body.classList.toggle('light-mode');
        
        let theme = document.body.classList.contains('dark-mode') ? 'dark-mode' : 'light-mode';
        localStorage.setItem('theme', theme);
    });
}
// --- END THEME TOGGLE ---

// --- MAIN EXECUTION ---
document.addEventListener('DOMContentLoaded', async () => {
    await initializeAndShowToday(); 
    setupEventListeners();
});