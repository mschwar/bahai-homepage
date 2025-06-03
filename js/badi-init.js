// js/badi-init.js

/**
 * Callback function to display the Badíʿ date information.
 * This function is passed to BadiDateToday's onReady setting.
 * @param {object} dateInfo - The date information object provided by BadiDateToday.
 */
function displayBadiDateInfo(dateInfo) {
  console.log("BadiDateToday onReady callback executed. Date Info:", dateInfo);
  const badiDateElement = document.getElementById("badiDate");

  if (badiDateElement && dateInfo) {
    let formattedBadiDate = "";
    // Check for the essential properties needed for the desired format
    if (dateInfo.bDay && dateInfo.bMonthMeaning && dateInfo.bMonthNameAr && dateInfo.bYear && dateInfo.bEraAbbrev) {
      formattedBadiDate = `${dateInfo.bDay} ${dateInfo.bMonthMeaning} (${dateInfo.bMonthNameAr}) ${dateInfo.bYear} ${dateInfo.bEraAbbrev}`;
    } else {
      // Fallback message if some data is missing
      formattedBadiDate = "Badíʿ date data incomplete.";
      console.warn("Some expected Badíʿ date properties were missing in dateInfo:", dateInfo);
    }
    badiDateElement.textContent = formattedBadiDate;
  } else if (badiDateElement) {
    // This case means dateInfo was null or undefined
    badiDateElement.textContent = "Failed to receive Badíʿ Date details.";
    console.error("badiDateElement found, but dateInfo was not provided to onReady or was invalid.", dateInfo);
  } else {
    // This case means the HTML element itself is missing
    console.error("Element with id 'badiDate' not found in the HTML.");
  }
}

// This main block of code in badi-init.js will execute when the script is loaded and parsed.
// Due to 'defer', it should run after BadiDateToday.v1.js has also been loaded and parsed.
if (typeof BadiDateToday === 'function') {
  console.log("BadiDateToday function found (from badi-init.js). Calling it with settings...");
  try {
    // Prepare the configuration object for BadiDateToday
    let badiDateConfig = {
      onReady: displayBadiDateInfo, // Our function to handle the result
      language: 'en'                // Optional: specify language
    };

    // Set locationMethod to ignoreLocation to prevent mixed content errors.
    // BadiDateLocationChoice is defined globally by BadiDateToday.v1.js.
    if (typeof BadiDateLocationChoice !== 'undefined' && BadiDateLocationChoice.ignoreLocation) {
        console.log("Setting locationMethod to BadiDateLocationChoice.ignoreLocation (value: " + BadiDateLocationChoice.ignoreLocation + ")");
        badiDateConfig.locationMethod = BadiDateLocationChoice.ignoreLocation;
    } else {
        // Fallback if BadiDateLocationChoice is somehow not defined globally when this runs
        // (though it should be if BadiDateToday.v1.js loaded and ran correctly).
        // The value for ignoreLocation is 1 according to their script comments.
        console.warn("BadiDateLocationChoice was not found globally. Falling back to raw value 1 for ignoreLocation.");
        badiDateConfig.locationMethod = 1;
    }

    // Call the BadiDateToday function with our configuration
    BadiDateToday(badiDateConfig);

  } catch (error) {
    // This would catch errors thrown by the BadiDateToday() function call itself
    console.error("Error calling BadiDateToday function (from badi-init.js):", error);
    const badiDateElement = document.getElementById("badiDate");
    if (badiDateElement) {
      badiDateElement.textContent = "Error setting up Badíʿ Date.";
    }
  }
} else {
  // This block executes if BadiDateToday is not defined as a function globally
  console.error("CRITICAL: BadiDateToday function is NOT defined when badi-init.js executed. The external script (BadiDateToday.v1.js) might have failed to load, parse, or correctly define the global BadiDateToday function.");
  const badiDateElement = document.getElementById("badiDate");
  if (badiDateElement) {
    badiDateElement.textContent = "Error: Badíʿ Date script component unavailable.";
  }
}
