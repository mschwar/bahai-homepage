// js/script.js – integrated

/* -------------------------  CONSTANTS  -------------------------- */
const MAX_QUOTE_WORDS = 75;

/* -------------------------  THEME TOGGLE  ----------------------- */
const themeToggleBtn = document.getElementById('theme-toggle-button');
const savedTheme = localStorage.getItem('theme');
document.body.classList.add(savedTheme || 'light-mode');

themeToggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  document.body.classList.toggle('light-mode');
  localStorage.setItem(
    'theme',
    document.body.classList.contains('dark-mode') ? 'dark-mode' : 'light-mode'
  );
});

/* --------------------  QUOTE FETCH / PREP  ---------------------- */
async function fetchQuotes(path = 'data/quotes_hidden_words.json') {
  try {
    const res = await fetch(path);
    return res.ok ? await res.json() : [];
  } catch {
    return [];
  }
}
const countWords = (t) => (t || '').trim().split(/\s+/).length;
function filterShort(list) { return list.filter(q => countWords(q.text) <= MAX_QUOTE_WORDS); }
const dayOfYear = d => Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 8.64e7);

/* ----------------------  RENDER HELPERS  ------------------------ */
function renderQuote(obj, suffix = '') {
  const txt  = document.getElementById(`quote-text${suffix}`);
  const auth = document.getElementById(`quote-author${suffix}`);
  const src  = document.getElementById(
    suffix ? 'quote-source-full-yesterday' : 'quote-source-full'
  );
  if (!obj) { txt.textContent = 'No verse available.'; if(src) src.textContent=''; return; }

  txt.textContent  = obj.text;
  auth.textContent = 'Bahá’u’lláh';
  if (src) src.textContent = obj.source || 'The Hidden Words';
}
function renderGregorian(d, elId){
  const el=document.getElementById(elId);
  if(el) el.textContent=d.toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
}

/* --------------------------  STATE  ----------------------------- */
let quotes=[], todayObj=null, yestObj=null;

/* ----------------------  INITIALISE PAGE  ----------------------- */
async function initPage(){
  const all = await fetchQuotes(); if(!all.length) return;
  quotes = filterShort(all);
  const today=new Date(), yest=new Date(); yest.setDate(yest.getDate()-1);

  todayObj = quotes[dayOfYear(today)%quotes.length];
  yestObj  = quotes[dayOfYear(yest)%quotes.length];

  renderQuote(todayObj,'');
  renderQuote(yestObj,'-yesterday');  // citation prepopulated but hidden
  renderGregorian(today,'gregorianDatePanel');
  initializeBadiCalendar(today,'badiDate');
}

/* --------------------  COPY TO CLIPBOARD  ----------------------- */
const copyQuote = q => q && navigator.clipboard.writeText(`${q.text}\n— Bahá’u’lláh`);

/* -----------------------------  UI  ----------------------------- */
function setEvents(){
  /* main arrow → scroll only to end of date panel */
  document.getElementById('scroll-down-arrow').addEventListener('click',e=>{
    e.preventDefault();
    document.querySelector('.panel-date').scrollIntoView({behavior:'smooth'});
  });

  /* yesterday button */
  const btnY=document.getElementById('yesterday-button');
  btnY.addEventListener('click',e=>{
    e.preventDefault();
    const block=document.getElementById('yesterday-jumbotron-display');
    block.style.display='flex';
    block.scrollIntoView({behavior:'smooth'});
  });

  /* toggle yesterday citation */
  document.getElementById('yesterday-arrow')
          .addEventListener('click',e=>{
            e.preventDefault();
            document.getElementById('quote-source-full-yesterday')
                    .classList.toggle('visible');
          });

  /* copy-to-clipboard */
  document.getElementById('quote-text')
          .addEventListener('click',()=>copyQuote(todayObj));
  document.getElementById('quote-text-yesterday')
          .addEventListener('click',()=>copyQuote(yestObj));

  /* Badíʿ date → show / hide Gregorian */
  document.getElementById('badiDate')
          .addEventListener('click',()=>{
            document.getElementById('gregorianDatePanel')
                    .classList.toggle('visible');
          });
}

document.addEventListener('DOMContentLoaded', async ()=>{
  await initPage();
  setEvents();
});
