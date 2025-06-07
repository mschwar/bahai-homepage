// js/script.js

// ... (keep other functions like theme toggle, fetchQuotes, filterQuotesByLength, getQuoteByDay, displaySingleQuote, getDayOfYear, displayGregorianDateForPanel, updateButtonStates, setupEventListeners) ...

// Global variables
let ALL_QUOTES = [];
let SHORT_QUOTES = [];
let CURRENT_DISPLAY_DAY_OFFSET = 0; 
const MAX_QUOTE_WORDS = 75; // Or your preferred value
let currentQuoteObjectForToday = null;
let currentQuoteObjectForYesterday = null;


async function initializeAndShowToday() {
    console.log("Initializing quotes...");
    try {
        ALL_QUOTES = await fetchQuotes('data/quotes_hidden_words.json'); 
        console.log("Fetched ALL_QUOTES:", ALL_QUOTES); // DEBUG

        if (!Array.isArray(ALL_QUOTES)) {
            console.error("fetchQuotes did not return an array. ALL_QUOTES is:", ALL_QUOTES);
            ALL_QUOTES = []; // Ensure it's an array for safety
        }

        if (ALL_QUOTES.length === 0) { 
            console.warn("No quotes fetched or ALL_QUOTES is empty.");
            displaySingleQuote(null, 'quote-text-today', 'quote-author-today', 'quote-source-full-today'); 
            return false; // Indicate failure or no quotes
        }

        SHORT_QUOTES = filterQuotesByLength(ALL_QUOTES, MAX_QUOTE_WORDS);
        console.log("Filtered SHORT_QUOTES:", SHORT_QUOTES); // DEBUG

        if (!Array.isArray(SHORT_QUOTES)) {
            console.error("filterQuotesByLength did not return an array. SHORT_QUOTES is:", SHORT_QUOTES);
            SHORT_QUOTES = []; // Ensure it's an array
        }
        
        // Now this log should be safe
        console.log(`Fetched ${ALL_QUOTES.length} total quotes, filtered to ${SHORT_QUOTES.length} quotes with <= ${MAX_QUOTE_WORDS} words.`);

        if (SHORT_QUOTES.length === 0) { 
            console.warn(`No quotes found that meet the max word count of ${MAX_QUOTE_WORDS}.`);
            displaySingleQuote(null, 'quote-text-today', 'quote-author-today', 'quote-source-full-today'); 
            return false; // Indicate no suitable quotes
        }

        const todayDateObj = new Date();
        const dayOfYearToday = getDayOfYear(todayDateObj);
        const todaysQuote = getQuoteByDay(SHORT_QUOTES, dayOfYearToday);
        displaySingleQuote(todaysQuote, 'quote-text-today', 'quote-author-today', 'quote-source-full-today');
        
        displayGregorianDateForPanel(todayDateObj, "gregorianDatePanel");
        if (typeof initializeBadiCalendar === "function") {
            initializeBadiCalendar(todayDateObj, "badiDate");
        }
        return true; // Indicate success

    } catch (error) {
        console.error("Error during initializeAndShowToday:", error);
        displaySingleQuote(null, 'quote-text-today', 'quote-author-today', 'quote-source-full-today');
        return false; // Indicate failure
    }
}

function showQuoteForOffset(offset) {
    // Ensure SHORT_QUOTES is populated
    if (SHORT_QUOTES.length === 0) {
        console.warn("showQuoteForOffset called but no short quotes available.");
        // Optionally try to re-initialize if ALL_QUOTES has data but SHORT_QUOTES is empty due to filter
        if (ALL_QUOTES.length > 0) {
            SHORT_QUOTES = filterQuotesByLength(ALL_QUOTES, MAX_QUOTE_WORDS);
            if(SHORT_QUOTES.length === 0) {
                displaySingleQuote(null, offset === 0 ? 'quote-text-today' : 'quote-text-yesterday', 
                                   offset === 0 ? 'quote-author-today' : 'quote-author-yesterday', 
                                   offset === 0 ? 'quote-source-full-today' : 'quote-source-full-yesterday');
                return;
            }
        } else {
            displaySingleQuote(null, offset === 0 ? 'quote-text-today' : 'quote-text-yesterday', 
                                   offset === 0 ? 'quote-author-today' : 'quote-author-yesterday', 
                                   offset === 0 ? 'quote-source-full-today' : 'quote-source-full-yesterday');
            return;
        }
    }

    const todayDateObj = new Date(); 
    const targetDateObj = new Date(todayDateObj);
    targetDateObj.setDate(todayDateObj.getDate() + offset); 

    const dayOfYearToDisplay = getDayOfYear(targetDateObj);
    const quote = getQuoteByDay(SHORT_QUOTES, dayOfYearToDisplay);

    if (offset === 0) {
        displaySingleQuote(quote, 'quote-text-today', 'quote-author-today', 'quote-source-full-today');
        displayGregorianDateForPanel(targetDateObj, "gregorianDatePanel");
        if (typeof initializeBadiCalendar === "function") {
            initializeBadiCalendar(targetDateObj, "badiDate");
        }
    } else if (offset === -1) {
        const yesterdaySection = document.getElementById('yesterday-jumbotron');
        displaySingleQuote(quote, 'quote-text-yesterday', 'quote-author-yesterday', 'quote-source-full-yesterday');
        displayGregorianDate(targetDateObj, "gregorianDateYesterday"); // Corrected function name
        if (typeof initializeBadiCalendar === "function") {
            initializeBadiCalendar(targetDateObj, "badiDateYesterday");
        }
        if (yesterdaySection) {
            yesterdaySection.style.display = 'flex'; 
            // Small delay for content to populate before scrolling, if needed.
            setTimeout(() => {
                 yesterdaySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 200); // Adjust delay if necessary
        }
    }

    CURRENT_DISPLAY_DAY_OFFSET = offset; // This might not be needed if Today/Yesterday buttons just reveal/scroll
    updateButtonStates(); // This function might need rethinking if we aren't "switching" the main view
}


// Main execution
document.addEventListener('DOMContentLoaded', async () => {
    const gregorianDateElement = document.getElementById('gregorianDatePanel'); 
    // This element starts hidden by CSS, JS will toggle it on Badi date click.
    // if (gregorianDateElement) { 
    //     gregorianDateElement.style.display = 'none'; 
    // }
    
    await initializeAndShowToday(); // This now displays today's quote and dates
    setupEventListeners();
});