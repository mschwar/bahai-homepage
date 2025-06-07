// js/badi-init.js

// Keep displayBadiDateInfo as is, it just displays whatever dateInfo it gets
function displayBadiDateInfo(dateInfo) {
  // console.log("BadiDateToday onReady callback executed. Date Info:", dateInfo); // Keep for debug if needed
  const badiDateElement = document.getElementById("badiDate");

  if (badiDateElement && dateInfo) {
    let formattedBadiDate = "";
    if (dateInfo.bDay && dateInfo.bMonthMeaning && dateInfo.bMonthNameAr && dateInfo.bYear && dateInfo.bEraAbbrev) {
      formattedBadiDate = `${dateInfo.bDay} ${dateInfo.bMonthMeaning} (${dateInfo.bMonthNameAr}) ${dateInfo.bYear} ${dateInfo.bEraAbbrev}`;
    } else {
      formattedBadiDate = "Badíʿ date data incomplete.";
      console.warn("Some expected Badíʿ date properties were missing in dateInfo:", dateInfo);
    }
    badiDateElement.textContent = formattedBadiDate;
  } else if (badiDateElement) {
    badiDateElement.textContent = "Failed to receive Badíʿ Date details.";
    // console.error("badiDateElement found, but dateInfo was not provided to onReady or was invalid.", dateInfo);
  } else {
    // console.error("Element with id 'badiDate' not found in the HTML.");
  }
}

// Store the BadiDateToday instance if needed for re-init, or just call it
// let badiDateInstance; // Not strictly needed if we just re-call BadiDateToday()

function initializeBadiCalendar(dateToCalculate = new Date()) { // Takes a date object
  if (typeof BadiDateToday === 'function') {
    // console.log("BadiDateToday function found. Calling it with settings for date:", dateToCalculate.toDateString());
    try {
      let badiDateConfig = {
        onReady: displayBadiDateInfo,
        language: 'en',
        currentTime: dateToCalculate // Pass the specific date to BadiDateToday
      };

      if (typeof BadiDateLocationChoice !== 'undefined' && BadiDateLocationChoice.askForUserLocation) {
        // console.log("Setting locationMethod to BadiDateLocationChoice.askForUserLocation");
        badiDateConfig.locationMethod = BadiDateLocationChoice.askForUserLocation;
      } else {
        // console.warn("BadiDateLocationChoice.askForUserLocation was not found globally. Falling back to raw value 3.");
        badiDateConfig.locationMethod = 3;
      }
      BadiDateToday(badiDateConfig);
    } catch (error) {
      console.error("Error calling BadiDateToday function:", error);
      const badiDateElement = document.getElementById("badiDate");
      if (badiDateElement) {
        badiDateElement.textContent = "Error setting up Badíʿ Date.";
      }
    }
  } else {
    console.error("CRITICAL: BadiDateToday function is NOT defined. External script might have failed.");
    const badiDateElement = document.getElementById("badiDate");
    if (badiDateElement) {
      badiDateElement.textContent = "Error: Badíʿ Date script component unavailable.";
    }
  }
}

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    initializeBadiCalendar(); // Initialize for today
});