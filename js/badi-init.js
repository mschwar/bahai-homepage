// js/badi-init.js

function displayBadiDateInfo(dateInfo, elementId = "badiDate") {
  const badiDateElement = document.getElementById(elementId);
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
  }
}

function initializeBadiCalendar(dateToCalculate = new Date(), targetElementId = "badiDate") {
  if (typeof BadiDateToday === 'function') {
    try {
      let badiDateConfig = {
        onReady: (di) => displayBadiDateInfo(di, targetElementId),
        language: 'en',
        currentTime: dateToCalculate 
      };
      if (typeof BadiDateLocationChoice !== 'undefined' && BadiDateLocationChoice.askForUserLocation) {
        badiDateConfig.locationMethod = BadiDateLocationChoice.askForUserLocation;
      } else {
        badiDateConfig.locationMethod = 3;
      }
      BadiDateToday(badiDateConfig);
    } catch (error) {
      console.error("Error calling BadiDateToday function:", error);
      const targetElement = document.getElementById(targetElementId);
      if (targetElement) {
        targetElement.textContent = "Error setting up Badíʿ Date.";
      }
    }
  } else {
     console.error("CRITICAL: BadiDateToday function is NOT defined.");
     const targetElement = document.getElementById(targetElementId);
      if (targetElement) {
        targetElement.textContent = "Error: Badíʿ Date script component unavailable.";
      }
  }
}

document.addEventListener('DOMContentLoaded', () => {
    initializeBadiCalendar(new Date(), "badiDate"); 
});