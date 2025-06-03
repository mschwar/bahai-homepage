// js/script.js

async function fetchQuotes() {
    try {
        const response = await fetch('data/quotes.json');
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

/**
 * Filters an array of quote objects based on a maximum word count.
 * @param {Array<object>} quotesArray - The array of quote objects.
 * @param {number} maxWords - The maximum number of words allowed for a quote's text.
 * @returns {Array<object>} A new array containing only quotes that meet the word count criteria.
 */
function filterQuotesByLength(quotesArray, maxWords) {
    if (!quotesArray) return [];
    return quotesArray.filter(quote => {
        if (quote && typeof quote.text === 'string') {
            const wordCount = quote.text.split(/\s+/).length; // Simple space-based word count
            return wordCount <= maxWords;
        }
        return false; // Exclude if quote.text is not a string or quote is malformed
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
    const quoteDisplayElement = document.getElementById('quote-display-area');

    if (quoteDisplayElement) {
        if (quoteObject && quoteObject.text) {
            quoteDisplayElement.innerHTML = `
                <blockquote>
                    <p>${quoteObject.text.replace(/\n/g, '<br>')}</p>
                    <footer>
                        — ${quoteObject.author || 'Unknown Author'},
                        <cite>${quoteObject.source || 'Unknown Source'}</cite>
                    </footer>
                </blockquote>
            `;
        } else {
            quoteDisplayElement.innerHTML = "<p>No suitable Baha'i writing available for today (perhaps check length criteria or add more quotes).</p>";
        }
    } else {
        console.error("Element with id 'quote-display-area' not found!");
    }
}

// Main execution when the HTML page is fully loaded
document.addEventListener('DOMContentLoaded', async () => {
    const MAX_QUOTE_WORDS = 75; // <<< --- SET YOUR DESIRED MAX WORD COUNT HERE

    const quoteDisplayElement = document.getElementById('quote-display-area');
    if (quoteDisplayElement) {
        // Initial "Loading..." message is already in index.html
    }

    const allQuotes = await fetchQuotes();
    if (allQuotes.length === 0) {
        displayQuoteInArea(null); // Display error if no quotes fetched
        return;
    }

    const shortQuotes = filterQuotesByLength(allQuotes, MAX_QUOTE_WORDS);
    console.log(`Fetched ${allQuotes.length} quotes, filtered to ${shortQuotes.length} quotes with <= ${MAX_QUOTE_WORDS} words.`);

    if (shortQuotes.length === 0) {
        console.warn(`No quotes found that meet the max word count of ${MAX_QUOTE_WORDS}. Displaying from all quotes as a fallback or showing an error.`);
        // Option 1: Display from all quotes if no short ones (might be long)
        // const dailyQuote = getDailyQuoteFromList(allQuotes);
        // displayQuoteInArea(dailyQuote);

        // Option 2: Display a specific message if no short quotes are found
        displayQuoteInArea(null); // This will show the "No suitable Baha'i writing..." message
        return;
    }

    const dailyQuote = getDailyQuoteFromList(shortQuotes);
    displayQuoteInArea(dailyQuote);
});
