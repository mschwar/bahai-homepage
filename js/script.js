// js/script.js

<!-- Badíʿ date (auto-calculates based on your location & sunset) -->
<script src="https://wondrous-badi.today/scripts/BadiDateToday.v1.js"></script>
<script>
  BadiDateToday.init({
    elementId: "badiDate",   // element to fill
    format: "long",          // e.g., “7 Núr 182 BE”
    language: "en"           // change if you want another translation
  });
</script>

// Helper function to get ordinal suffix for day of the month
function getOrdinalSuffix(day) {
    if (day > 3 && day < 21) return 'th'; // for 4th-20th
    switch (day % 10) {
        case 1:  return "st";
        case 2:  return "nd";
        case 3:  return "rd";
        default: return "th";
    }
}

async function fetchQuotes() {
    try {
        // This path is relative to index.html
        // If index.html is in the root, and js/ and data/ are folders in the root,
        // then 'data/quotes.json' is correct.
        const response = await fetch('data/quotes.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const quotesData = await response.json();
        return quotesData;
    } catch (error) {
        console.error("Could not fetch quotes:", error);
        // Return an empty array or a default quote object on error
        return [];
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

    // Use dayOfYear to pick a quote, cycling through if necessary
    // (dayOfYear - 1) because arrays are 0-indexed and dayOfYear is 1-indexed
    const quoteIndex = (dayOfYear - 1) % quotesArray.length;
    return quotesArray[quoteIndex];
}

function displayDailyData(quoteObject) {
    const quoteContainer = document.getElementById('quote-container');
    const dateContainer = document.getElementById('date'); // For the date display

    // Display the date
if (dateContainer) {
    const now = new Date();
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = daysOfWeek[now.getDay()];
    const dayOfMonth = now.getDate();
    const dayWithSuffix = dayOfMonth + getOrdinalSuffix(dayOfMonth);

    // Placeholders for Baha'i date components
    const bahaiMonthPlaceholder = "[bahai_month]";
    const bahaiYearPlaceholder = "[bahai_year]"; // B.E. for Baháʼí Era, or CE if you mean Gregorian year

    // Construct the desired date string
    // If you want the Gregorian year for CE: const gregorianYear = now.getFullYear();
    // Then use `${gregorianYear}CE` below instead of bahaiYearPlaceholder + "CE"
    // For now, using the placeholder as requested for the year part too.
    const formattedDate = `${dayName}, ${dayWithSuffix} of ${bahaiMonthPlaceholder}, ${bahaiYearPlaceholder}CE`;

    dateContainer.textContent = formattedDate;
} else {
    console.warn("Element with id 'date' not found.");
}
    

    // Display the quote
    if (quoteContainer) {
        if (quoteObject && quoteObject.text) {
            // Using the structure from your quotes.json (text, author, source)
            quoteContainer.innerHTML = `
                <blockquote>
                    <p>${quoteObject.text.replace(/\n/g, '<br>')}</p>
                    <footer>
                        — ${quoteObject.author || 'Unknown Author'}, 
                        <cite>${quoteObject.source || 'Unknown Source'}</cite>
                    </footer>
                </blockquote>
            `;
        } else {
            quoteContainer.innerHTML = "<p>No Baha'i writing available for today, or an error occurred.</p>";
        }
    } else {
        console.error("Element with id 'quote-container' not found!");
    }
}

// This function will run when the HTML page is fully loaded
document.addEventListener('DOMContentLoaded', async () => {
    const quoteContainer = document.getElementById('quote-container');
    if (quoteContainer) {
        quoteContainer.innerHTML = "<p>Loading Baha'i Writing...</p>"; // Initial loading message
    }

    const allQuotes = await fetchQuotes();
    const dailyQuote = getDailyQuoteFromList(allQuotes);
    displayDailyData(dailyQuote);
});
