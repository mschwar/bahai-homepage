// js/script.js

async function fetchQuotes() {
    try {
        const response = await fetch('data/quotes.json'); // Path relative to index.html
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const quotesData = await response.json();
        return quotesData;
    } catch (error) {
        console.error("Could not fetch quotes:", error);
        return []; // Return an empty array on error
    }
}

function getDailyQuoteFromList(quotesArray) {
    if (!quotesArray || quotesArray.length === 0) {
        return null; // No quotes to choose from
    }
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0); // Day 0 of the current year
    const diff = now - startOfYear;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay); // Day number (1-366)

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
            quoteDisplayElement.innerHTML = "<p>No Baha'i writing available for today, or an error occurred loading the quote.</p>";
        }
    } else {
        console.error("Element with id 'quote-display-area' not found!");
    }
}

// Main execution when the HTML page is fully loaded
document.addEventListener('DOMContentLoaded', async () => {
    const quoteDisplayElement = document.getElementById('quote-display-area');
    if (quoteDisplayElement) {
        // The initial "Loading Baha'i Writing..." is already in index.html
        // So no need to set it here unless you want to change it dynamically
    }

    const allQuotes = await fetchQuotes();
    const dailyQuote = getDailyQuoteFromList(allQuotes);
    displayQuoteInArea(dailyQuote);
});
