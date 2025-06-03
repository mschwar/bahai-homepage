 // Your existing quotes array (we'll improve this later)
 const quotes = [
     "The earth is but one country, and mankind its citizens.",
     "So powerful is the light of unity that it can illuminate the whole earth.",
     "Let your heart burn with loving kindness for all who may cross your path."
     // Add many more quotes here
 ];

 function getDailyQuote() {
     const now = new Date();
     const start = new Date(now.getFullYear(), 0, 0); // Day 0 of the current year
     const diff = now - start;
     const oneDay = 1000 * 60 * 60 * 24;
     const dayOfYear = Math.floor(diff / oneDay); // Day number (1-366)

     // Use dayOfYear to pick a quote, cycling through if necessary
     const quoteIndex = (dayOfYear - 1) % quotes.length; // -1 because arrays are 0-indexed
     return quotes[quoteIndex];
 }

 function displayQuote() {
     const quoteContainer = document.getElementById('quote-container');
     const dailyQuote = getDailyQuote();
     if (dailyQuote) {
         quoteContainer.innerHTML = `<p>${dailyQuote}</p>`; // Simple paragraph for now
     } else {
         quoteContainer.innerHTML = "<p>No quote available for today.</p>";
     }
 }

 document.addEventListener('DOMContentLoaded', displayQuote);
