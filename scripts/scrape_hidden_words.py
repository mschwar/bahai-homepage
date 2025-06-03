import requests
from bs4 import BeautifulSoup
import json
import os
import re

# --- Configuration ---
URL = "https://www.bahai.org/library/authoritative-texts/bahaullah/hidden-words/hidden-words.xhtml?28ffb3b6"
# Output path relative to the script's location
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
OUTPUT_QUOTES_PATH = os.path.join(PROJECT_ROOT, 'data', 'quotes_hidden_words.json') # Specific file for these quotes
AUTHOR = "Bahá’u’lláh"
SOURCE_PREFIX = "The Hidden Words"

# --- Main Script ---
def fetch_page_content(url):
    """Fetches the content of the given URL."""
    print(f"Fetching content from: {url}")
    try:
        response = requests.get(url, timeout=10) # Add a timeout
        response.raise_for_status()  # Raise an exception for HTTP errors (4xx or 5xx)
        print("Content fetched successfully.")
        return response.text
    except requests.exceptions.RequestException as e:
        print(f"Error fetching URL {url}: {e}")
        return None

def parse_hidden_words(html_content):
    """Parses the HTML content to extract Hidden Words."""
    if not html_content:
        return []

    soup = BeautifulSoup(html_content, 'lxml') # Use lxml parser
    quotes = []
    
    # --- Inspect the HTML structure of the target page ---
    # We need to find a reliable way to identify each Hidden Word.
    # Let's assume each Hidden Word (English part) is within a <p> tag
    # and might have a specific class or be preceded by a numbered heading.
    #
    # Update: After inspecting the page, Hidden Words are often in <p> tags
    # with class "Para". The Arabic/Persian distinction is also important.
    # The structure is:
    # <div class="Section"> for "FROM THE ARABIC" / "FROM THE PERSIAN"
    #   <h3> numbered heading (e.g., "1.") </h3>
    #   <p class="Para">O SON OF SPIRIT! ...</p>
    #   <p class="Para"><em>(‘Abdu’l‑Bahá, The Promulgation of Universal Peace, p. 292)</em></p> <--- This is a citation, not part of the HW text itself

    current_part = "" # "Arabic" or "Persian"

    # Find all major sections (like "FROM THE ARABIC" and "FROM THE PERSIAN")
    # The overall content seems to be within <div data-media-id="HW">...</div>
    main_content_div = soup.find('div', attrs={'data-media-id': 'HW'})
    if not main_content_div:
        print("Could not find main content div for Hidden Words. Parser needs adjustment.")
        return []

    # Iterate through children of the main content div
    # Looking for headings that indicate parts and numbered items
    for element in main_content_div.find_all(['h2', 'h3', 'p'], recursive=False): # Direct children mostly
        # Check for section headings like "FROM THE ARABIC"
        if element.name == 'h2' and element.get('class') and 'TitleSub' in element.get('class'):
            if "ARABIC" in element.get_text().upper():
                current_part = "Arabic"
                print(f"\nProcessing: {SOURCE_PREFIX} - From the {current_part}")
            elif "PERSIAN" in element.get_text().upper():
                current_part = "Persian"
                print(f"\nProcessing: {SOURCE_PREFIX} - From the {current_part}")
            continue

        # Check for numbered Hidden Word headings (e.g., "1.", "2.")
        if element.name == 'h3' and element.get('class') and 'HeadNumbered' in element.get('class'):
            number_text = element.get_text(strip=True).replace('.', '')
            
            # The actual quote text is usually in the *next* sibling <p class="Para">
            quote_paragraph = element.find_next_sibling('p', class_='Para')
            
            if quote_paragraph:
                quote_text_parts = []
                # Collect text from this p and subsequent p.Para until another h3 or h2 or non-Para p
                current_p = quote_paragraph
                while current_p and current_p.name == 'p' and 'Para' in current_p.get('class', []):
                    # Avoid picking up citation paragraphs like "(‘Abdu’l‑Bahá...)"
                    if not (current_p.find('em') and '(' in current_p.get_text() and ')' in current_p.get_text()):
                        quote_text_parts.append(current_p.get_text(separator=' ', strip=True))
                    else:
                        # This paragraph is likely a citation, so we stop accumulating text for this Hidden Word
                        break 
                    current_p = current_p.find_next_sibling()
                    # Stop if the next sibling is a heading or not a paragraph we want
                    if not current_p or current_p.name in ['h2', 'h3'] or \
                       (current_p.name == 'p' and 'Para' not in current_p.get('class', [])):
                        break


                full_quote_text = " ".join(quote_text_parts).strip()
                # Further clean up potential artifacts like "바하올라" or extra spaces
                full_quote_text = re.sub(r'\s*바하올라\s*', '', full_quote_text) # Remove Korean "Baha'u'llah" if it appears
                full_quote_text = re.sub(r'\s+', ' ', full_quote_text).strip() # Normalize whitespace

                if full_quote_text:
                    source_detail = f"{SOURCE_PREFIX}, From the {current_part} #{number_text}"
                    quotes.append({
                        "text": full_quote_text,
                        "source": source_detail,
                        "author": AUTHOR
                    })
                    # print(f"  Added: {current_part} #{number_text} - {full_quote_text[:50]}...")
    
    print(f"\nSuccessfully parsed {len(quotes)} Hidden Words.")
    return quotes

def save_quotes_to_json(quotes, filepath):
    """Saves the list of quotes to a JSON file."""
    if not quotes:
        print("No quotes to save.")
        return
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(quotes, f, indent=2, ensure_ascii=False)
        print(f"Quotes successfully saved to: {filepath}")
    except IOError as e:
        print(f"Error saving quotes to {filepath}: {e}")

if __name__ == "__main__":
    html = fetch_page_content(URL)
    if html:
        hidden_words_quotes = parse_hidden_words(html)
        save_quotes_to_json(hidden_words_quotes, OUTPUT_QUOTES_PATH)