/* js/main.js */
async function showDailyQuote(){
  const res  = await fetch('data/quotes.json');
  const list = await res.json();

  // Day-of-year index (0-364)
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(),0,0)) / 86400000
  );
  const quote = list[dayOfYear % list.length];

  document.getElementById('quote').textContent = quote;
  document.getElementById('date').textContent  = new Date().toDateString();
}
showDailyQuote();
