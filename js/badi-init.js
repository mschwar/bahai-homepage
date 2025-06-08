// js/badi-init.js
function displayBadiDateInfo(info, elementId = 'badiDate') {
    const el = document.getElementById(elementId);
    if (!el) return;
    if (!info) { el.textContent = 'Failed to load Badíʿ date.'; return; }

    const { bDay, bMonthMeaning, bMonthNameAr, bYear, bEraAbbrev } = info;
    if (bDay && bMonthMeaning && bMonthNameAr && bYear && bEraAbbrev) {
        el.textContent = `${bDay} ${bMonthMeaning} (${bMonthNameAr}) ${bYear} ${bEraAbbrev}`;
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
