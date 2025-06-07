// js/script.js

async function fetchQuotes(fileName = 'data/quotes_hidden_words.json') { // Default to Hidden Words
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

function getQuoteByDay(quotesArray, dayOfYear) { // Modified to take dayOfYear
    if (!quotesArray || quotesArray.length === 0) {
        return null;
    }
    // Ensure dayOfYear is within valid bounds (1 to 366)
    const adjustedDay = Math.max(1, Math.min(dayOfYear, 366));
    const quoteIndex = (adjustedDay - 1) % quotesArray.length;
    return quotesArray[quoteIndex];
}

function displayQuote(quoteObject) { // Renamed, more generic
    const quoteTextElement = document.getElementById('quote-text');
    const quoteAuthorSourceElement = document.getElementById('quote-author-source');

    if (quoteTextElement && quoteAuthorSourceElement) {
        if (quoteObject && quoteObject.text) {
            // Animate out
            quoteTextElement.style.opacity = 0;
            quoteAuthorSourceElement.style.opacity = 0;

            setTimeout(() => {
                quoteTextElement.textContent = quoteObject.text;
                
                let authorDisplay = quoteObject.author || 'Unknown';
                let sourceText = quoteObject.source || 'Unknown Source';
                let translatorInfo = quoteObject.translator ? ` (trans. ${quoteObject.translator})` : '';

                if (quoteObject.tradition === "Hinduism" && quoteObject.book && quoteObject.book.includes("Bhagavad-Gita")) {
                    authorDisplay = "Krishna (Bhagavad-Gita)";
                    if (quoteObject.speaker && 
                        quoteObject.speaker.toLowerCase() !== 'krishna' && 
                        quoteObject.speaker.toLowerCase() !== 'narrative') {
                        // authorDisplay = `${quoteObject.speaker} (in the Bhagavad-Gita)`; 
                    }
                } else if (quoteObject.tradition === "Bahá’í") {
                    authorDisplay = quoteObject.author;
                } else if (quoteObject.tradition === "Buddhism" && quoteObject.book === "The Dhammapada"){
                    authorDisplay = "Buddha"; // Or keep original 'Various' if preferred
                }
                // Add more specific author handling for other traditions as you add them

                quoteAuthorSourceElement.innerHTML = `— ${authorDisplay}${translatorInfo}, <cite>${sourceText}</cite>`;
                
                // Animate in
                quoteTextElement.style.opacity = 1;
                quoteAuthorSourceElement.style.opacity = 1;
            }, 250); // Match animation duration (e.g., Sensible Words used 250ms)

        } else {
            quoteTextElement.textContent = "No suitable sacred verse available.";
            quoteAuthorSourceElement.innerHTML = "";
        }
    } else {
        if (!quoteTextElement) console.error("Element with id 'quote-text' not found!");
        if (!quoteAuthorSourceElement) console.error("Element with id 'quote-author-source' not found!");
    }
}

function getDayOfYear(date = new Date()) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
}

// Global variables for quotes and current display state
let ALL_QUOTES = [];
let SHORT_QUOTES = [];
let CURRENT_DISPLAY_DAY_OFFSET = 0; // 0 for today, -1 for yesterday
const MAX_QUOTE_WORDS = 100; // Increased default, can be adjusted

async function initializeQuotes() {
    // Assuming you'll use a combined file later, or stick to one for now
    // ALL_QUOTES = await fetchQuotes('data/all_combined_quotes.json');
    ALL_QUOTES = await fetchQuotes('data/quotes_hidden_words.json'); // Or your current primary file

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
    if (SHORT_QUOTES.length === 0) {
        displayQuote(null);
        return;
    }
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + offset); // offset is 0 for today, -1 for yesterday

    const dayOfYearToDisplay = getDayOfYear(targetDate);
    const quote = getQuoteByDay(SHORT_QUOTES, dayOfYearToDisplay);
    displayQuote(quote);

    CURRENT_DISPLAY_DAY_OFFSET = offset;
    updateButtonStates();
}

function updateButtonStates() {
    const todayButton = document.getElementById('today-button');
    const yesterdayButton = document.getElementById('yesterday-button');

    if (CURRENT_DISPLAY_DAY_OFFSET === 0) {
        todayButton.classList.add('button-active');
        yesterdayButton.classList.remove('button-active');
    } else if (CURRENT_DISPLAY_DAY_OFFSET === -1) {
        yesterdayButton.classList.add('button-active');
        todayButton.classList.remove('button-active');
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

    // Populate current year in footer
    const yearSpan = document.getElementById('current-year');
    if(yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
}


// Main execution
document.addEventListener('DOMContentLoaded', async () => {
    const gregorianDateElement = document.getElementById('gregorianDate'); // Get Gregorian date element
    if (gregorianDateElement) { // Remove Gregorian date from main display
        gregorianDateElement.style.display = 'none'; // Hide it, as it's not part of this design's main view
    }

    const quotesReady = await initializeQuotes();
    if (quotesReady) {
        showQuoteForOffset(0); // Display today's quote initially
    }
    setupEventListeners();
});