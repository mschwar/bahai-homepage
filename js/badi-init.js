// js/badi-init.js
function displayBadiDateInfo(info, elementId = 'badiDate') {
  const el = document.getElementById(elementId);
  if (!el) return;

  if (!info) {
    el.textContent = 'Badíʿ date unavailable.';
    return;
  }

  const {
    bDay,
    bMonthMeaning,   // e.g. "Light"
    bMonthNameAr,    // e.g. "Núr"
    bYear,           // e.g. 182
    bEraAbbrev = 'BE'
  } = info;

  if (bDay && bMonthMeaning && bMonthNameAr && bYear) {
    /* line 1:  Day 4, Núr (light)
       line 2:  182 BE                                         */
    const line1 = `Day ${bDay}, ${bMonthNameAr} (${bMonthMeaning.toLowerCase()})`;
    const line2 = `${bYear} ${bEraAbbrev}`;
    el.innerHTML = `${line1}<br>${line2}`;
  } else {
    console.warn('Badíʿ date object incomplete:', info);
    el.textContent = 'Badíʿ date unavailable.';
  }
}

function buildBadiKey(info) {
  if (!info || !info.bYear || !info.bMonthNameAr || !info.bDay) return null;
  return `badi:${info.bYear}-${info.bMonthNameAr}-${info.bDay}`;
}

function initializeBadiCalendar(date = new Date(), targetId = 'badiDate', options = {}) {
  const { onReady, onFailure } = options;
  const target = document.getElementById(targetId);
  if (!target) return;

  if (typeof BadiDateToday !== 'function') {
    console.error('BadiDateToday JS not loaded.');
    target.textContent = 'Badíʿ date unavailable.';
    if (onFailure) onFailure('script-missing');
    return;
  }

  let finished = false;
  const finishFailure = (reason, error) => {
    if (finished) return;
    finished = true;
    target.textContent = 'Badíʿ date unavailable.';
    if (onFailure) onFailure(reason, error);
  };

  const timeoutId = window.setTimeout(() => {
    if (finished) return;
    target.textContent = 'Badíʿ date unavailable.';
    if (onFailure) onFailure('timeout');
  }, 4000);

  try {
    BadiDateToday({
      onReady: di => {
        if (finished) return;
        finished = true;
        window.clearTimeout(timeoutId);
        displayBadiDateInfo(di, targetId);
        if (onReady) onReady(di, buildBadiKey(di));
      },
      language: 'en',
      currentTime: date,
      locationMethod:
        (typeof BadiDateLocationChoice !== 'undefined' &&
         BadiDateLocationChoice.askForUserLocation) || 3
    });
  } catch (error) {
    window.clearTimeout(timeoutId);
    finishFailure('exception', error);
  }
}
