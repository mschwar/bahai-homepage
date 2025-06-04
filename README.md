# Bahá’í Daily Homepage

A minimalist personal homepage that displays the current Badíʿ date and a daily selection from "The Hidden Words" by Bahá’u’lláh each time you open your browser. It is designed to support spiritual reflection and a centered start to digital interactions.

## Purpose

To create a sacred digital threshold — a homepage that offers a moment for the soul with sacred verses and the unique rhythm of the Badíʿ calendar.

## Live Demo

You can view and use the live version here:
[https://mschwar.github.io/bahai-homepage/](https://mschwar.github.io/bahai-homepage/)

## Key Features

-   **Daily Quote from The Hidden Words:** Displays one of the 153 verses from Bahá’u’lláh's "The Hidden Words" each day.
-   **Accurate Badíʿ Date Display:** Shows the current date in the Badíʿ calendar (requires user location permission for sunset calculations via the integrated `BadiDateToday.js` script).
-   **Automated Quote Sourcing:** Includes a Python script (`scripts/scrape_hidden_words.py`) to automatically scrape and format all verses from "The Hidden Words" from [bahai.org](https://www.bahai.org/library/authoritative-texts/bahaullah/hidden-words/).
-   **Client-Side Logic:** Uses JavaScript for:
    -   Initializing the Badíʿ date display.
    -   Fetching the locally stored quotes.
    -   Filtering quotes by a configurable maximum word count.
    -   Selecting one quote daily based on the day of the year.
-   **Clean and Focused Design:** Minimalist layout with an emphasis on the Writings.
-   **Lightweight and Fast:** Designed for quick loading.

## How It Works

1.  **Quote Preparation (Developer Task):**
    *   The Python script `scripts/scrape_hidden_words.py` is run locally by the developer.
    *   This script fetches the HTML content of "The Hidden Words" from the Bahá’í Reference Library website.
    *   It uses the `requests` and `BeautifulSoup4` libraries to parse the HTML and extract each verse, its part (Arabic/Persian), and its number.
    *   The extracted quotes are saved into `data/quotes_hidden_words.json`. This JSON file is then committed to the repository.
2.  **Homepage Display (User Browser):**
    *   When `index.html` is loaded:
        *   `js/badi-init.js` initializes, which in turn calls the external `BadiDateToday.js` script. If location permission is granted, the current Badíʿ date is displayed in the `<p id="badiDate">` element.
        *   `js/script.js` executes:
            *   It fetches the quote data from `data/quotes_hidden_words.json`.
            *   It filters these quotes based on the `MAX_QUOTE_WORDS` setting within the script.
            *   It selects one quote deterministically based on the current day of the year.
            *   The selected quote is then displayed in the `<div id="quote-display-area">` element.

## Setup and Usage

**For End-Users (Viewing & Setting as Homepage):**

1.  Visit the live demo: [https://mschwar.github.io/bahai-homepage/](https://mschwar.github.io/bahai-homepage/)
2.  To set it as your browser’s homepage:
    *   **Chrome:** Settings > Appearance > Show home button > Enter custom web address: `https://mschwar.github.io/bahai-homepage/`. Also, Settings > On startup > Open a specific page or set of pages > Add a new page: `https://mschwar.github.io/bahai-homepage/`.
    *   **Firefox:** Settings > Home > Homepage and new windows > Custom URLs... > Enter: `https://mschwar.github.io/bahai-homepage/`.
    *   **Safari:** Safari > Preferences (or Settings) > General > Homepage > Enter: `https://mschwar.github.io/bahai-homepage/`.
    *   **Edge:** Settings > Start, home, and new tabs > When Edge starts > Open these pages > Add a new page > Enter: `https://mschwar.github.io/bahai-homepage/`. Also configure the Home button if desired.

**For Developers (Running Locally or Modifying):**

1.  **Clone or download** the repository.
2.  **Python Environment (for updating quotes):**
    *   Ensure Python 3 is installed on your system.
    *   Navigate to the project directory in your terminal.
    *   Install required Python libraries: `pip install requests beautifulsoup4 lxml`
3.  **Generating/Updating Quotes:**
    *   To re-scrape "The Hidden Words" (e.g., if the source page changes or you modify the scraper):
        ```bash
        cd scripts
        python scrape_hidden_words.py
        ```
    *   This will update `data/quotes_hidden_words.json`.
    *   *Note: The scraper is specific to the current HTML structure of the bahai.org page for "The Hidden Words" and may break if that structure changes.*
4.  **Viewing Locally:** Open `index.html` in any web browser.
5.  **Committing Changes:** If you update the scraper or the generated `quotes_hidden_words.json`, commit these files to your repository.

## Customization

-   **Quote Length Filter:** Modify the `MAX_QUOTE_WORDS` constant in `js/script.js` to change the maximum word count for displayed quotes.
-   **Adding More Quotes:**
    *   To add quotes from other books, you would need to:
        1.  Create a new Python scraper script (or significantly modify the existing one) to target a different URL and parse its specific HTML structure.
        2.  Run the new scraper to generate a new JSON file (e.g., `data/quotes_some_other_book.json`).
        3.  Update `js/script.js` to fetch from this new file or combine data from multiple JSON files.
    *   Alternatively, you could manually add quotes to `data/quotes_hidden_words.json`, but be aware that running `scrape_hidden_words.py` will overwrite this file with only The Hidden Words.
-   **Styling:** Modify `css/style.css` to change the appearance.

## Future Enhancements

-   Scrapers for additional books/sources from the Bahá’í Writings.
-   User option to choose which book or collection to display quotes from.
-   Light/dark mode toggle.
-   Option to favorite/save quotes locally (using browser local storage).
-   A "show another quote" button (perhaps from the already filtered daily list, or a random one).

## Acknowledgements

This project is offered with reverence and love, inspired by the Ocean of Bahá’u’lláh's Revelation. The Badíʿ date functionality utilizes the `BadiDateToday.js` script by Glen Little.

> *“Immerse yourselves in the ocean of My words, that ye may unravel its secrets, and discover all the pearls of wisdom that lie hid in its depths.”*
> — Bahá’u’lláh, Gleanings From the Writings of Bahá’u’lláh

---

Feel free to fork, remix, or offer improvements to this project.