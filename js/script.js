// js/script.js

async function fetchQuotes() {
    try {
        // Make sure this points to your latest, complete quotes file
        // For now, we'll assume you're still using quotes_hidden_words.json
        // If you've run combine_quotes.py, change to 'data/all_combined_quotes.json'
        const response = await fetch('data/quotes_hidden_words.json'); 
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
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

function getDailyQuoteFromList(quotesArray) {
    if (!quotesArray || quotesArray.length === 0) {
        return null;
    }
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const diff = now - startOfYear;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    const quoteIndex = (dayOfYear - 1) % quotesArray.length;
    return quotesArray[quoteIndex];
}

function displayQuoteInArea(quoteObject) {
    const quoteTextElement = document.getElementById('quote-text'); // New ID for quote text
    const quoteAuthorSourceElement = document.getElementById('quote-author-source'); // New ID for attribution

    if (quoteTextElement && quoteAuthorSourceElement) {
        if (quoteObject && quoteObject.text) {
            // Set text content for the quote. CSS 'white-space: pre-line;' will handle \n
            quoteTextElement.textContent = quoteObject.text; 
            
            let authorDisplay = quoteObject.author || 'Unknown Author';
            let sourceText = quoteObject.source || 'Unknown Source';
            let translatorInfo = quoteObject.translator ? ` (trans. ${quoteObject.translator})` : '';
            
            // Specific handling for different traditions if needed for display
            if (quoteObject.tradition === "Hinduism" && quoteObject.book === "The Song Celestial (Bhagavad-Gita)") {
                // Author is already "Krishna (Bhagavad-Gita)" or "Vyasa (Traditional)" from scraper
                // Speaker field can provide more context if desired
                authorDisplay = quoteObject.author; // e.g., "Krishna (Bhagavad-Gita)"
                if (quoteObject.speaker && 
                    quoteObject.speaker.toLowerCase() !== 'narrative' && 
                    quoteObject.speaker.toLowerCase() !== 'krishna') { // Avoid "Krishna (Speaker: Krishna)"
                    authorDisplay = `${quoteObject.speaker} (in the Bhagavad-Gita)`; // Or more creative display
                }
            } else if (quoteObject.tradition === "Bahá’í") {
                authorDisplay = quoteObject.author; // Should be "Bahá’u’lláh" for Hidden Words
            }
            // Add more 'else if' for other traditions as you add them

            // Use innerHTML for the author/source if you want to include <cite>
            quoteAuthorSourceElement.innerHTML = `— ${authorDisplay}${translatorInfo}, <cite>${sourceText}</cite>`;

        } else {
            quoteTextElement.textContent = "No suitable sacred verse available for today.";
            quoteAuthorSourceElement.innerHTML = ""; // Clear author/source too
        }
    } else {
        if (!quoteTextElement) console.error("Element with id 'quote-text' not found!");
        if (!quoteAuthorSourceElement) console.error("Element with id 'quote-author-source' not found!");
    }
}

function displayGregorianDate() {
    const gregorianDateElement = document.getElementById('gregorianDate');
    if (gregorianDateElement) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const day = String(now.getDate()).padStart(2, '0');
        gregorianDateElement.textContent = `${year}-${month}-${day}`;
    } else {
        console.warn("Element with id 'gregorianDate' not found.");
    }
}

// Main execution when the HTML page is fully loaded
document.addEventListener('DOMContentLoaded', async () => {
    const MAX_QUOTE_WORDS = 75; // You can adjust this

    displayGregorianDate(); // Display the Gregorian date

    // The initial "Loading..." message for the quote is in index.html's #quote-text
    // const quoteTextElement = document.getElementById('quote-text'); 

    const allQuotes = await fetchQuotes();
    if (allQuotes.length === 0) {
        displayQuoteInArea(null); 
        return;
    }

    const shortQuotes = filterQuotesByLength(allQuotes, MAX_QUOTE_WORDS);
    console.log(`Fetched ${allQuotes.length} quotes, filtered to ${shortQuotes.length} quotes with <= ${MAX_QUOTE_WORDS} words from ${allQuotes[0]?.tradition || 'unknown tradition'}.`);


    if (shortQuotes.length === 0) {
        console.warn(`No quotes found that meet the max word count of ${MAX_QUOTE_WORDS}.`);
        displayQuoteInArea(null); 
        return;
    }

    const dailyQuote = getDailyQuoteFromList(shortQuotes);
    displayQuoteInArea(dailyQuote);
});