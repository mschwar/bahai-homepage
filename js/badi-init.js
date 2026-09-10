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
    // TECH_DEBT_AND_RISKS.md #11: build the two-line label from text nodes +
    // <br> rather than innerHTML. Same rendering, no HTML parsing of the value.
    el.textContent = '';
    el.appendChild(document.createTextNode(line1));
    el.appendChild(document.createElement('br'));
    el.appendChild(document.createTextNode(line2));
  } else {
    console.warn('Badíʿ date object incomplete:', info);
    el.textContent = 'Badíʿ date unavailable.';
  }
}

function buildBadiKey(info) {
  if (!info || !info.bYear || !info.bMonthNameAr || !info.bDay) return null;
  return `badi:${info.bYear}-${info.bMonthNameAr}-${info.bDay}`;
}

/* Location strategies, read from the vendor's global when present. A second call with
   `ignoreLocation` needs no network and no permission: it uses the library's default
   6:30 sunset. */
const BADI_LOCATION_IGNORE =
  (typeof BadiDateLocationChoice !== 'undefined' && BadiDateLocationChoice.ignoreLocation) || 1;
const BADI_LOCATION_ASK =
  (typeof BadiDateLocationChoice !== 'undefined' && BadiDateLocationChoice.askForUserLocation) || 3;

/* How long to wait for the location-accurate path before downgrading. */
const BADI_ACCURATE_TIMEOUT_MS = 4000;
/* How long to allow the no-network downgrade once started. */
const BADI_IGNORE_TIMEOUT_MS = 2000;

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

  let settled = false;
  let timerId = null;

  const succeed = (di) => {
    if (settled) return;
    settled = true;
    window.clearTimeout(timerId);
    displayBadiDateInfo(di, targetId);
    if (onReady) onReady(di, buildBadiKey(di));
  };

  const giveUp = (reason, error) => {
    if (settled) return;
    settled = true;
    window.clearTimeout(timerId);
    target.textContent = 'Badíʿ date unavailable.';
    if (onFailure) onFailure(reason, error);
  };

  // One attempt with an explicit location strategy. Each call is an independent instance
  // (the vendor reinitializes its own local settings per call), so a retry is safe.
  const attempt = (locationMethod) => {
    if (settled) return;
    BadiDateToday({
      onReady: succeed,
      language: 'en',
      currentTime: date,
      locationMethod
    });
  };

  const startTimer = (ms, onElapsed) => {
    timerId = window.setTimeout(() => {
      if (settled) return;
      onElapsed();
    }, ms);
  };

  const downgrade = () => {
    // No location in time. Overwhelmingly this is a first-time visitor who declined the
    // permission prompt -- and the vendor cannot recover on its own: it falls back to
    // guessUserLocation, which requests http://ipinfo.io/geo?json (blocked as mixed
    // content on HTTPS), and that request sets ontimeout but no onerror, so a blocked
    // request reports nothing and the library never continues.
    //
    // Rather than render nothing, retry with ignoreLocation: the default 6:30 sunset
    // needs no network and no permission, so the date always renders.
    console.warn('Badíʿ date: no location after', BADI_ACCURATE_TIMEOUT_MS, 'ms; retrying with the default sunset time.');
    try {
      attempt(BADI_LOCATION_IGNORE);
    } catch (error) {
      giveUp('exception', error);
      return;
    }
    startTimer(BADI_IGNORE_TIMEOUT_MS, () => giveUp('timeout'));
  };

  // 1st: ask for the user's location -> sunset-accurate Badíʿ date. The caller owns the
  // timeout because every vendor failure path here is silent.
  try {
    attempt(BADI_LOCATION_ASK);
  } catch (error) {
    giveUp('exception', error);
    return;
  }
  startTimer(BADI_ACCURATE_TIMEOUT_MS, downgrade);
}
