import requests
from bs4 import BeautifulSoup
import json
import os
import re

# --- Configuration ---
# Using the HTML text directly for Project Gutenberg as they have plain text versions often
# URL = "https://www.gutenberg.org/files/2017/2017-h/2017-h.htm" # The HTML version
URL_TEXT = "https://www.gutenberg.org/cache/epub/2017/pg2017.txt" # Plain text version might be easier

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
# Save to a new file for this specific source
OUTPUT_QUOTES_PATH = os.path.join(PROJECT_ROOT, 'data', 'quotes_dhammapada.json') 
AUTHOR = "Buddha" # Or "Unknown", or specific translator if preferred for attribution
SOURCE_BOOK_TITLE = "The Dhammapada"
TRADITION = "Buddhism"

# --- Main Script ---
def fetch_page_content_text(url):
    """Fetches the plain text content of the given URL."""
    print(f"Fetching content from: {url}")
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=20)
        response.raise_for_status()
        # Project Gutenberg text files are often ISO-8859-1 or similar, but let's try UTF-8 first
        try:
            text_content = response.content.decode('utf-8')
        except UnicodeDecodeError:
            print("UTF-8 decode failed, trying ISO-8859-1")
            text_content = response.content.decode('iso-8859-1')
        print("Content fetched successfully.")
        return text_content
    except requests.exceptions.RequestException as e:
        print(f"Error fetching URL {url}: {e}")
        return None

def parse_dhammapada_text(text_content):
    """Parses the plain text content to extract Dhammapada verses."""
    if not text_content:
        return []

    quotes = []
    current_chapter_name = ""
    
    # Regex to find chapter headings like "Chapter I. The Twin-Verses"
    # It also tries to capture just the name like "The Twin-Verses"
    chapter_regex = re.compile(r"Chapter\s+[IVXLCDM]+\.\s*(.*)", re.IGNORECASE)
    
    # Regex to find verse lines starting with a number, like "1. All that we are..."
    # This captures the number and the verse text.
    verse_regex = re.compile(r"^\s*(\d+)\.\s*(.+)")

    # Skip the Project Gutenberg header and license before the actual content
    try:
        start_marker = "Chapter I. The Twin-Verses" # Or a more generic start like "DHAMMAPADA"
        content_start_index = text_content.upper().find(start_marker.upper())
        if content_start_index == -1:
            # Try finding just "DHAMMAPADA" as a major heading if Chapter I is not found
            start_marker_alt = "DHAMMAPADA"
            content_start_index = text_content.upper().find(start_marker_alt.upper())
            # If found, advance past this line
            if content_start_index != -1:
                 content_start_index = text_content.find('\n', content_start_index) + 1


        if content_start_index == -1:
            print("Could not find the start of Dhammapada content (e.g., 'Chapter I' or 'DHAMMAPADA').")
            return []
        
        relevant_content = text_content[content_start_index:]
    except Exception as e:
        print(f"Error finding start marker: {e}")
        relevant_content = text_content # Process all if marker not found, might get junk

    lines = relevant_content.splitlines()
    
    current_verse_lines = []
    current_verse_number = None

    for line in lines:
        line = line.strip()
        if not line: # Skip empty lines
            continue

        # Check for chapter heading
        chapter_match = chapter_regex.match(line)
        if chapter_match:
            # If we have a pending verse, save it
            if current_verse_number and current_verse_lines:
                verse_text = " ".join(current_verse_lines).strip()
                verse_text = re.sub(r'\s+', ' ', verse_text) # Normalize whitespace
                if verse_text:
                    source_detail = f"{SOURCE_BOOK_TITLE}, {current_chapter_name}, Verse {current_verse_number}"
                    quotes.append({
                        "text": verse_text,
                        "source": source_detail,
                        "author": AUTHOR,
                        "tradition": TRADITION
                    })
                current_verse_lines = []
                current_verse_number = None

            current_chapter_name = chapter_match.group(1).strip()
            print(f"\nProcessing Chapter: {current_chapter_name}")
            continue # Move to next line after processing chapter heading

        # Check for verse line
        verse_match = verse_regex.match(line)
        if verse_match:
            # If we have a pending verse from a *previous* number, save it
            if current_verse_number and current_verse_lines:
                verse_text = " ".join(current_verse_lines).strip()
                verse_text = re.sub(r'\s+', ' ', verse_text)
                if verse_text:
                    source_detail = f"{SOURCE_BOOK_TITLE}, {current_chapter_name}, Verse {current_verse_number}"
                    quotes.append({
                        "text": verse_text,
                        "source": source_detail,
                        "author": AUTHOR,
                        "tradition": TRADITION
                    })
            
            # Start a new verse
            current_verse_number = verse_match.group(1).strip()
            verse_line_text = verse_match.group(2).strip()
            current_verse_lines = [verse_line_text]
        elif current_verse_number: 
            # This line is a continuation of the current verse (if not empty and not a new chapter/verse)
            # Heuristic: if line doesn't start with typical chapter/verse markers and we are in a verse
            if not chapter_regex.match(line) and not re.match(r"^\s*End of the Project Gutenberg EBook", line, re.IGNORECASE):
                current_verse_lines.append(line)
        
        # Stop at the end marker
        if re.match(r"^\s*End of the Project Gutenberg EBook", line, re.IGNORECASE) or \
           re.match(r"^\s*\*\*\* END OF THE PROJECT GUTENBERG EBOOK", line, re.IGNORECASE) :
            print("Found end of ebook marker.")
            break

    # Save any last pending verse
    if current_verse_number and current_verse_lines:
        verse_text = " ".join(current_verse_lines).strip()
        verse_text = re.sub(r'\s+', ' ', verse_text)
        if verse_text:
            source_detail = f"{SOURCE_BOOK_TITLE}, {current_chapter_name}, Verse {current_verse_number}"
            quotes.append({
                "text": verse_text,
                "source": source_detail,
                "author": AUTHOR,
                "tradition": TRADITION
            })

    print(f"\nSuccessfully parsed {len(quotes)} Dhammapada verses.")
    return quotes


def save_quotes_to_json(quotes, filepath):
    if not quotes:
        print("No quotes to save.")
        return

    # Simple duplicate check based on text, just in case
    unique_quotes = []
    seen_texts = set()
    for quote in quotes:
        normalized_text = ' '.join(quote["text"].split())
        if normalized_text not in seen_texts:
            unique_quotes.append(quote)
            seen_texts.add(normalized_text)
    
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(unique_quotes, f, indent=2, ensure_ascii=False)
        print(f"Quotes successfully saved to: {filepath} ({len(unique_quotes)} unique quotes)")
    except IOError as e:
        print(f"Error saving quotes to {filepath}: {e}")

if __name__ == "__main__":
    # Using the plain text URL for Project Gutenberg is generally easier
    plain_text_content = fetch_page_content_text(URL_TEXT)
    if plain_text_content:
        dhammapada_quotes = parse_dhammapada_text(plain_text_content)
        save_quotes_to_json(dhammapada_quotes, OUTPUT_QUOTES_PATH)
    else:
        print("Could not fetch Dhammapada content. Skipping HTML parsing attempt for now.")
        # Optionally, you could try parsing the HTML you provided as a fallback
        # html_page_content = your_provided_html_string 
        # dhammapada_quotes_html = parse_dhammapada_html(html_page_content) # You'd need to write this function
        # save_quotes_to_json(dhammapada_quotes_html, OUTPUT_QUOTES_PATH.replace('.json', '_html.json'))