**Last Updated:** [2025-06-03] \
**Current Live Version:** [https://mschwar.github.io/bahai-homepage/](https://mschwar.github.io/bahai-homepage/)\
**Repository:** [https://github.com/mschwar/bahai-homepage](https://github.com/mschwar/bahai-homepage)\
\
## 1. Project Vision\
\
To create an evolving digital space for spiritual reflection, starting as a personal homepage displaying daily Bah\'e1\'92\'ed Writings and the Bad\'ed\uc0\u703  date, with the potential to grow into a richer, multi-faith, and multi-platform application.\
\
## 2. Current Status (as of [2025-06-03])\
\
*   **Core Functionality:**\
    *   Displays the current Bad\'ed\uc0\u703  date (using `BadiDateToday.js` via `js/badi-init.js`, requires location permission set to `askForUserLocation`).\
    *   Displays a daily quote selected from "The Hidden Words" by Bah\'e1\'92u\'92ll\'e1h.\
*   **Quote Sourcing:**\
    *   Quotes from "The Hidden Words" (153 verses) are scraped from [bahai.org](https://www.bahai.org/library/authoritative-texts/bahaullah/hidden-words/) using the Python script `scripts/scrape_hidden_words.py`.\
    *   Scraped quotes are stored in `data/quotes_hidden_words.json`.\
*   **Quote Display Logic (`js/script.js`):**\
    *   Fetches quotes from `data/quotes_hidden_words.json`.\
    *   Filters quotes by a `MAX_QUOTE_WORDS` setting.\
    *   Selects one quote daily based on the day of the year.\
*   **Deployment:** Hosted on GitHub Pages.\
*   **Key Files:**\
    *   `index.html`: Main page structure.\
    *   `css/style.css`: Styling.\
    *   `js/badi-init.js`: Initializes the Bad\'ed\uc0\u703  date display.\
    *   `js/script.js`: Handles quote fetching, filtering, and display.\
    *   `data/quotes_hidden_words.json`: Current quote data.\
    *   `scripts/scrape_hidden_words.py`: Python script for scraping The Hidden Words.\
\
## 3. Next Steps & Immediate To-Dos\
\
### 3.1. Enhancements to Current Version\
    \
1.  **Add Gregorian Date Display:**\
    *   **File:** `index.html`\
        *   Add `<p id="gregorianDate"></p>` (e.g., within the `<main>` tag, near `#badiDate`).\
    *   **File:** `js/badi-init.js` (or `js/script.js`)\
        *   Add JavaScript logic to get the current Gregorian date (YYYY-MM-DD) and set the `textContent` of `#gregorianDate`.\
    *   **File:** `css/style.css`\
        *   Add styling for the Gregorian date display.\
\
2.  **Design Improvements ("Make it Prettier"):**\
    *   **File:** `css/style.css`\
        *   Experiment with fonts (e.g., Google Fonts).\
        *   Refine color palette.\
        *   Improve layout, spacing, and visual hierarchy.\
        *   Consider a subtle background.\
\
3.  **Review & Refine Hidden Words Scraper:**\
    *   **File:** `scripts/scrape_hidden_words.py`\
        *   Remove debug `print` statements (if not already done).\
        *   Ensure text cleaning and formatting are optimal.\
    *   **File:** `data/quotes_hidden_words.json`\
        *   Manually review a sample of quotes for quality.\
\
### 3.2. Major Feature: Expanding Quote Sources\
\
This is a significant undertaking and likely the next big focus area.\
\
1.  **Objective:** Incorporate writings from the broader Bah\'e1\'92\'ed Reference Library (`bahai.org/library/`) and potentially the `bahai-library.com` offline database.\
2.  **Method for `bahai-library.com` Data (Primary Focus for Bulk Data):**\
    *   **Source:** Use the "Bah\'e1\'92\'ed Library Offline Database" from `archive.org` (e.g., `bahai_library_offline_2025-05.json.gz`).\
    *   **Local Pre-processing Script (`scripts/process_full_library.py` - new script):**\
        *   **Download & Uncompress:** Store the massive uncompressed JSON file **locally and outside the Git repository.**\
        *   **Python Script Development:**\
            *   Load the large JSON (it's an array of objects, each with a `"type"`).\
            *   Extract data for `CATALOG`, `AUTHORS`, `LANGUAGES` tables (note actual table names like `"24_authors"` from JSON).\
            *   Create lookup maps (e.g., `authors_map` using `"id"` and `"NAME-HUMAN"`).\
            *   Iterate through `CATALOG` entries.\
            *   **Language Filter:** Implement robust filtering (e.g., for "English") based on how the `LANGUAGES` field in `CATALOG` is structured and how it links to the `LANGUAGES` table.\
            *   **Author Lookup:** Use `AUTHORS-ID` from `CATALOG` to get author names.\
            *   **Source Title:** Use `TITLE-CURRENT`, `TITLE-PARENT`, `TITLE-JOURNAL`.\
            *   **CONTENT Processing (Most Complex):**\
                *   Determine format of `CATALOG.CONTENT` (HTML, plain text, etc.).\
                *   Implement `clean_text_content` function (use `BeautifulSoup4` if HTML).\
                *   Split cleaned content into quote units (e.g., paragraphs via `\\n\\n` or by parsing HTML paragraph tags).\
            *   **Quote Filtering:** Apply `MIN_WORDS_PER_QUOTE` and `MAX_WORDS_PER_QUOTE`.\
            *   **Categorization (Initial Thought):** As quotes are extracted, try to assign basic categories based on `source_title` or known Ruhi books. This will be refined later.\
            *   **Output:** Save to a new, comprehensive `data/all_quotes.json`.\
    *   **Integration:** Update `js/script.js` to load from `data/all_quotes.json`.\
3.  **Method for `bahai.org/library/` (Specific Works):**\
    *   For key texts not easily processed from the database dump, or for the most authoritative versions, individual scrapers similar to `scrape_hidden_words.py` can be developed.\
    *   Each new scraper would target a specific URL and require custom parsing logic.\
    *   Results can be appended to `data/all_quotes.json` by the main processing script or managed as separate JSON files initially.\
\
## 4. Future Vision & Long-Term Goals\
\
These are larger goals to consider after the content base is significantly expanded.\
\
### 4.1. Advanced Categorization & Tagging\
\
*   **Data Enhancement:**\
    *   Refine the Python processing script to assign more detailed categories to each quote:\
        *   `by_ruhibk` (identify Ruhi Book sources)\
        *   `by_author` (already available)\
        *   `stories_themaster` (identify sources of stories about \'91Abdu\'92l-Bah\'e1 \'96 may require manual tagging or specific source flags)\
        *   `by_book` (refine from `source` field)\
        *   `by_type` (prayers, general quotes, stories \'96 this will be challenging to automate reliably, might need source-based heuristics or manual tagging).\
    *   Consider adding a `tags: []` array to each quote for more granular topics.\
*   **UI/JS:**\
    *   Add UI elements (dropdowns, filters) in `index.html` to allow users to select desired categories/tags.\
    *   Update `js/script.js` to filter the quote list based on user selections before daily picking.\
\
### 4.2. Interactive Exploration (Hyperlinked Categories)\
\
*   **Concept:** Allow users to click on an author, source, or category to learn more and see related quotes.\
*   **Data:** Create small JSON files or JS objects containing:\
    *   Brief author biographies.\
    *   Short descriptions of major books.\
    *   Descriptions of categories.\
*   **UI/JS:**\
    *   Make author/source in the displayed quote clickable.\
    *   On click, show a modal or a new page section with:\
        *   The "about" information.\
        *   A list of other quotes matching that author/source/category.\
    *   This might involve more complex DOM manipulation or a simple client-side routing/view management approach. Consider if a lightweight JS framework/library would be beneficial at this stage if complexity grows.\
\
### 4.3. Extending to Other Spiritual Traditions\
\
*   **Content Sourcing:**\
    *   Identify public domain sources/websites for texts like Proverbs, Psalms, Dhammapada, Bhagavad Gita, etc.\
    *   Develop new Python scraper scripts for each source, adapting parsing logic as needed.\
*   **Data Structure:**\
    *   Add a `"tradition"` field to each quote object in the main JSON file (e.g., "Bah\'e1\'92\'ed", "Christianity", "Buddhism", "Hinduism").\
*   **UI/JS:**\
    *   Add a UI element to allow users to select which tradition(s) they want to see quotes from.\
    *   Update `js/script.js` to filter quotes based on selected tradition(s).\
\
### 4.4. Desktop & Phone Wallpaper/Screensaver\
\
*   **Simple Approach (User-driven):** Add a "Download as Image" button to the webpage.\
    *   Use JavaScript and HTML Canvas to render the current date and quote onto an image.\
    *   Allow the user to download this image and manually set it as wallpaper.\
*   **Dynamic Wallpaper (Complex - Separate Application):**\
    *   Requires a dedicated desktop application (e.g., built with Electron, Python with GUI libraries, or native OS tools).\
    *   This app would run the quote selection logic (or fetch from your live site if it exposed an API for the daily quote) and programmatically update the OS wallpaper. This is a significant undertaking beyond the scope of the current web project.\
\
### 4.5. Making it an "App"\
\
1.  **Progressive Web App (PWA - Most Feasible Next "App" Step):**\
    *   **Create `manifest.json`:** Define app name, icons, start URL, display mode.\
    *   **Implement a Service Worker (`sw.js`):** For caching app shell (HTML, CSS, JS) and quote data (`all_quotes.json`) for offline access.\
    *   **Ensure HTTPS:** Already handled by GitHub Pages.\
    *   Users could then "Add to Home Screen" or "Install" from their browser.\
2.  **Native Mobile App (iOS/Android - High Complexity):**\
    *   Requires full mobile app development using Swift/Kotlin, or cross-platform frameworks like React Native or Flutter.\
    *   This would involve rebuilding the UI and logic natively.\
    *   Allows for deeper OS integration (widgets, true background updates, etc.) but is a much larger project.\
\
## 5. Technical Notes & Reminders\
\
*   **Web Scraping Fragility:** Scrapers (Python scripts) are dependent on the HTML structure of the source websites (`bahai.org`). If these sites change their layout, the scrapers will likely break and need updating.\
*   **Large Data Handling:**\
    *   The full `bahai-library.com` database dump is very large. All processing of this dump **must** be done locally by a Python script. Only the curated, smaller JSON output (e.g., `data/all_quotes.json`) should be committed to the Git repository.\
    *   If `all_quotes.json` itself becomes excessively large (many MBs), consider strategies for the client:\
        *   Loading only a subset initially.\
        *   Client-side indexing/searching (e.g., using `lunr.js` if you add search).\
*   **Location Permission (Bad\'ed\uc0\u703  Date):** The current `BadiDateToday.js` setup using `askForUserLocation` provides accuracy but relies on user consent. If consent is denied, its fallback to `guessUserLocation` currently hits a mixed-content error due to `http://ipinfo.io`. This is a limitation of the external script.\
*   **Git Commits:** For local Python script development, commit the script changes. When the script successfully generates/updates the data JSON file, commit *both* the script and the data file.\
\
---\
\
**How to Use This Document:**\
\
1.  Save this as `PROJECT_ROADMAP.md` in the root of `bahai-homepage` repository.\
2.  Commit it to GitHub.\
3.  **Update the "Last Updated" date** at the top for significant progress or revised plans.\
4.  Refer to this document when returning to the project to quickly understand goals, current state, and what to work on next.\
5.  Move completed items from "Next Steps & Immediate To-Dos," to a "Completed Features" section or simply update their status here.\
}


