// js/script.js

async function fetchQuotes(fileName = 'data/quotes_hidden_words.json') {
    try {
        const response = await fetch(fileName); 
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} for ${fileName}`);
        }
        const quotesData = await response.json();
        return quotesData;
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
    if (!quotesArray || quotesArray.length === 0) {
        return null;
    }
    const adjustedDay = Math.max(1, Math.min(dayOfYear, 366));
    const quoteIndex = (adjustedDay - 1) % quotesArray.length;
    return quotesArray[quoteIndex];
}

function displayQuote(quoteObject) {
    const quoteTextElement = document.getElementById('quote-text');
    const quoteAuthorElement = document.getElementById('quote-author'); // New ID for just author
    const quoteSourceFullElement = document.getElementById('quote-source-full'); // New ID for full source

    if (quoteTextElement && quoteAuthorElement && quoteSourceFullElement) {
        if (quoteObject && quoteObject.text) {
            quoteTextElement.style.opacity = 0;
            quoteAuthorElement.style.opacity = 0;
            quoteSourceFullElement.style.opacity = 0;

            setTimeout(() => {
                quoteTextElement.textContent = quoteObject.text; 
                
                let authorDisplay = quoteObject.author || 'Unknown';
                let sourceText = quoteObject.source || 'Unknown Source';
                let translatorInfo = quoteObject.translator ? ` (trans. ${quoteObject.translator})` : '';
                
                if (quoteObject.tradition === "Hinduism" && quoteObject.book && quoteObject.book.includes("Bhagavad-Gita")) {
                    authorDisplay = "Krishna (Bhagavad-Gita)"; // Or "Krishna"
                    // If you want to include the speaker from Gita in the author line:
                    // if (quoteObject.speaker && quoteObject.speaker.toLowerCase() !== 'krishna' && quoteObject.speaker.toLowerCase() !== 'narrative') {
                    //    authorDisplay = `${quoteObject.speaker} (from the Bhagavad-Gita, as told by Krishna)`;
                    // }
                } else if (quoteObject.tradition === "Bahá’í") {
                    authorDisplay = quoteObject.author;
                } // Add more specific author handling as needed

                quoteAuthorElement.textContent = `— ${authorDisplay}`;
                quoteSourceFullElement.innerHTML = `<cite>${sourceText}</cite>${translatorInfo}`;
                
                quoteTextElement.style.opacity = 1;
                quoteAuthorElement.style.opacity = 1;
                quoteSourceFullElement.style.opacity = 1;
            }, 150); // Reduced animation time for snappier feel

        } else {
            quoteTextElement.textContent = "No suitable sacred verse available.";
            quoteAuthorElement.textContent = "";
            quoteSourceFullElement.innerHTML = "";
        }
    } else {
        if (!quoteTextElement) console.error("Element with id 'quote-text' not found!");
        if (!quoteAuthorElement) console.error("Element with id 'quote-author' not found!");
        if (!quoteSourceFullElement) console.error("Element with id 'quote-source-full' not found!");
    }
}

function getDayOfYear(date = new Date()) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
}

let ALL_QUOTES = [];
let SHORT_QUOTES = [];
let CURRENT_DISPLAY_DAY_OFFSET = 0; 
const MAX_QUOTE_WORDS = 75; // Adjusted from 100 back to 75, or your preference

async function initializeQuotes() {
    ALL_QUOTES = await fetchQuotes('data/quotes_hidden_words.json'); 
    if (ALL_QUOTES.length === 0) {
        displayQuote(null); 
        return false;
    }
    SHORT_QUOTES = filterQuotesByLength(ALL_QUOTES, MAX_QUOTE_WORDS);
    console.log(`Fetched ${ALL_QUOTES.length} quotes, filtered to ${SHORT_QUOTES.length} quotes with <= ${MAX_QUOTE_WORDS} words.`);

    if (SHORT_QUOTES.length === 0) {
        console.warn(`No quotes found that meet the max word count of ${MAX_QUOTE_WORDS}.`);
        displayQuote(null); 
        return false;
    }
    return true;
}

function showQuoteForOffset(offset) {
    if (SHORT_QUOTES.length === 0 && ALL_QUOTES.length > 0) {
        // Fallback if no short quotes, use all quotes (optional)
        // SHORT_QUOTES = ALL_QUOTES; 
        // console.log("No short quotes, using all quotes for display.");
    }
    if (SHORT_QUOTES.length === 0) { // If still no quotes (e.g. fetch failed or all_quotes also empty)
        displayQuote(null);
        return;
    }

    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + offset); 

    const dayOfYearToDisplay = getDayOfYear(targetDate);
    const quote = getQuoteByDay(SHORT_QUOTES, dayOfYearToDisplay);
    displayQuote(quote);

    CURRENT_DISPLAY_DAY_OFFSET = offset;
    updateButtonStates();

    // Re-initialize Badi Calendar for the target date
    // Ensure initializeBadiCalendar is globally accessible or imported if in separate modules
    if (typeof initializeBadiCalendar === "function") {
        const badiDateTarget = new Date(); // Create a new date object for Badi calculation
        badiDateTarget.setDate(badiDateTarget.getDate() + offset);
        initializeBadiCalendar(badiDateTarget); 
    } else {
        console.warn("initializeBadiCalendar function not found. Badi date won't update for yesterday/today.");
    }
}

function updateButtonStates() {
    const todayButton = document.getElementById('today-button');
    const yesterdayButton = document.getElementById('yesterday-button');
    if(todayButton && yesterdayButton){
        if (CURRENT_DISPLAY_DAY_OFFSET === 0) {
            todayButton.classList.add('button-active');
            yesterdayButton.classList.remove('button-active');
        } else if (CURRENT_DISPLAY_DAY_OFFSET === -1) {
            yesterdayButton.classList.add('button-active');
            todayButton.classList.remove('button-active');
        }
    }
}

function setupEventListeners() {
    const todayButton = document.getElementById('today-button');
    const yesterdayButton = document.getElementById('yesterday-button');
    const scrollArrow = document.querySelector('.scroll-down-arrow');

    if (todayButton) {
        todayButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (CURRENT_DISPLAY_DAY_OFFSET !== 0) {
                showQuoteForOffset(0);
            }
        });
    }
    if (yesterdayButton) {
        yesterdayButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (CURRENT_DISPLAY_DAY_OFFSET !== -1) {
                showQuoteForOffset(-1);
            }
        });
    }
    if (scrollArrow) {
        scrollArrow.addEventListener('click', (e) => {
            e.preventDefault();
            const scrollTarget = document.getElementById('scroll-content-start');
            if (scrollTarget) {
                scrollTarget.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
    const yearSpan = document.getElementById('current-year');
    if(yearSpan) { // Check if the year span exists (it was removed from HTML)
        // yearSpan.textContent = new Date().getFullYear(); 
    } else { // If you want to add it back, ensure current-year id is in footer
        const footer = document.querySelector('footer p');
        if (footer && !document.getElementById('current-year')) { // Avoid duplicate
            // Example: footer.innerHTML = `© ${new Date().getFullYear()} ${footer.textContent}`;
        }
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const gregorianDateElement = document.getElementById('gregorianDate');
    if (gregorianDateElement) { 
        gregorianDateElement.style.display = 'none'; 
    }
    const quotesReady = await initializeQuotes();
    if (quotesReady) {
        showQuoteForOffset(0); 
    }
    setupEventListeners();
});