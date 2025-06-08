// js/badi-init.js
function displayBadiDateInfo(info, elementId = 'badiDate') {
  const el = document.getElementById(elementId);
  if (!el) return;

  if (!info) {
    el.textContent = 'Failed to load Badíʿ date.';
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

function initializeBadiCalendar(date = new Date(), targetId = 'badiDate') {
  if (typeof BadiDateToday !== 'function') {
    console.error('BadiDateToday JS not loaded.');
    document.getElementById(targetId).textContent = 'Badíʿ date script missing';
    return;
  }

  BadiDateToday({
    onReady: di => displayBadiDateInfo(di, targetId),
    language: 'en',
    currentTime: date,
    locationMethod:
      (typeof BadiDateLocationChoice !== 'undefined' &&
       BadiDateLocationChoice.askForUserLocation) || 3
  });
}
