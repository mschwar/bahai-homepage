import requests
import json
import os
import re

# --- Configuration ---
# URL for the PLAIN TEXT version of the KJV Bible on Project Gutenberg
URL_TEXT = "https://www.gutenberg.org/ebooks/10.txt.utf-8" 

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
OUTPUT_QUOTES_PATH = os.path.join(PROJECT_ROOT, 'data', 'quotes_kjv_bible.json') 
# AUTHOR: Traditionally, various authors, or "Inspired by God". For simplicity, can be generic.
AUTHOR = "Various (King James Version)" 
SOURCE_BOOK_TITLE = "The Holy Bible (King James Version)"
TRADITION = "Christianity/Judaism" # KJV Old Testament is shared

# --- Main Script ---
def fetch_text_content(url):
    """Fetches the plain text content of the given URL."""
    print(f"Fetching content from: {url}")
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 YourAppName/1.0 (Contact: youremail@example.com)' # Be a good internet citizen
        }
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        # PG text files are often UTF-8, but can vary.
        # The .txt.utf-8 URL should enforce UTF-8.
        text_content = response.text # requests handles decoding based on headers/chardet
        print("Content fetched successfully.")
        return text_content
    except requests.exceptions.RequestException as e:
        print(f"Error fetching URL {url}: {e}")
        return None

def parse_kjv_bible_text(text_content):
    """Parses the plain text KJV Bible to extract verses."""
    if not text_content:
        return []

    quotes = []
    current_book_name = ""
    
    # Regex to identify a book heading (e.g., "The First Book of Moses: Called Genesis")
    # This is heuristic and might need adjustment based on the exact PG text file format.
    # It looks for lines that are likely book titles (often all caps or title case, longer than typical verse lines)
    book_title_regex = re.compile(r"^(The\s+(First|Second|Third|Fourth|Fifth)\s+Book\s+of\s+\w+.*?)$|^(The\s+Book\s+of\s+\w+.*?)$|^(The\s+(Gospel|Acts|Epistle|Lamentations|Revelation|Song)\s+.*?)$|^(Ezra|Nehemiah|Esther|Job|Psalms|Proverbs|Ecclesiastes|Hosea|Joel|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi)$", re.MULTILINE | re.IGNORECASE)

    # Regex to identify a verse line: "chapter:verse Text of the verse"
    # It captures book (from state), chapter, verse number, and verse text.
    # Example: "1:1 In the beginning God created..."
    # Example: "10:15 And he said..."
    verse_regex = re.compile(r"^\s*(\d+):(\d+)\s+(.*)")

    # Find the start of the actual scripture content
    # Typically after "*** START OF THE PROJECT GUTENBERG EBOOK..."
    start_marker_1 = "*** START OF THE PROJECT GUTENBERG EBOOK"
    start_marker_2 = "The Old Testament of the King James Version of the Bible" # More specific
    
    content_start_index = text_content.upper().find(start_marker_1.upper())
    if content_start_index != -1:
        # Find the next newline to get past the marker line itself
        content_start_index = text_content.find('\n', content_start_index) + 1
    else:
        print(f"Warning: Could not find primary start marker '{start_marker_1}'. Trying alternative.")
        content_start_index = text_content.upper().find(start_marker_2.upper())
        if content_start_index != -1:
            content_start_index = text_content.find('\n', content_start_index) + 1
        else:
            print("Warning: Could not find any start marker. Processing from beginning, may include header text.")
            content_start_index = 0
        
    relevant_content = text_content[content_start_index:]
    lines = relevant_content.splitlines()
    
    # Variables to hold multi-line verses
    current_verse_text_lines = []
    current_chapter = ""
    current_verse_num = ""

    for line_num, line_content in enumerate(lines):
        line_stripped = line_content.strip()

        if not line_stripped: # Skip empty lines
            continue

        # Stop at the end marker
        if "*** END OF THE PROJECT GUTENBERG EBOOK" in line_stripped.upper():
            print("Found end of ebook marker.")
            break
        
        # Attempt to identify book titles
        # This is tricky because book titles are just lines of text.
        # We look for lines that are NOT verse lines and seem like titles.
        # A more robust way would be to have a predefined list of KJV book names.
        # For now, we'll try to infer it when a new C:V pattern appears after non-verse lines.
        
        verse_match = verse_regex.match(line_stripped)
        
        if verse_match: # This line starts a verse (e.g., "1:1 ...")
            # If there was a pending verse, save it
            if current_book_name and current_chapter and current_verse_num and current_verse_text_lines:
                full_verse_text = " ".join(current_verse_text_lines).strip()
                full_verse_text = re.sub(r'\s+', ' ', full_verse_text) # Normalize whitespace
                if full_verse_text: # Ensure it's not empty
                    source_detail = f"{current_book_name}, {current_chapter}:{current_verse_num}"
                    quotes.append({
                        "text": full_verse_text,
                        "source": source_detail,
                        "author": AUTHOR,
                        "tradition": TRADITION,
                        "book": current_book_name, # Add specific book for easier filtering later
                        "reference": f"{current_chapter}:{current_verse_num}"
                    })
            
            # Start the new verse
            current_chapter = verse_match.group(1)
            current_verse_num = verse_match.group(2)
            verse_text_part = verse_match.group(3).strip()
            current_verse_text_lines = [verse_text_part]

            # Infer book name if current_book_name is not set or if chapter is "1"
            # This needs a list of books or more sophisticated logic.
            # For this example, we'll need a way to set current_book_name.
            # The plain text file often has the book name on a line before its first chapter.
            # Let's try a heuristic: if chapter is 1 and verse is 1, look at previous non-empty lines for book title.
            if current_chapter == "1" and current_verse_num == "1":
                # Look backwards for a potential book title line
                # This is a simplified approach. A list of KJV books would be better.
                potential_title_line_index = line_num -1 # Index in the *original* lines list
                while potential_title_line_index >= 0:
                    prev_line = lines[potential_title_line_index].strip()
                    # Heuristic: A book title is often Title Cased or ALL CAPS, not starting with C:V,
                    # and not part of the Gutenberg boilerplate.
                    if prev_line and not verse_regex.match(prev_line) and \
                       len(prev_line) > 3 and len(prev_line) < 100 and \
                       "PROJECT GUTENBERG" not in prev_line.upper() and \
                       "BIBLE" not in prev_line.upper() and \
                       "TESTAMENT" not in prev_line.upper():
                        # Check if it resembles a known book pattern
                        book_match_attempt = book_title_regex.match(prev_line)
                        if book_match_attempt:
                            current_book_name = prev_line # Use the full line as the book name
                            print(f"\nIdentified Book: {current_book_name}")
                            break 
                    if potential_title_line_index < line_num - 5: # Don't look back too far
                        break
                    potential_title_line_index -=1
                if not current_book_name: # If still no book name after looking back
                    print(f"Warning: Could not determine book name for {current_chapter}:{current_verse_num}. Using last known or 'Unknown'.")
                    current_book_name = current_book_name or "Unknown Book" # Keep last or set to unknown


        elif current_verse_num and current_book_name: 
            # This line is a continuation of the current verse if we are already processing one.
            # Only append if it doesn't look like a new verse from a different chapter (unlikely in KJV PG)
            # or a new book title.
             if not book_title_regex.match(line_stripped): # Avoid appending book titles as verse continuations
                current_verse_text_lines.append(line_stripped)
        # else:
            # This line is not a verse start and we are not in a verse,
            # it could be a book title or header info. We try to catch book titles above.
            # print(f"Skipping line (not a verse start or continuation): {line_stripped[:100]}")


    # Save any last pending verse
    if current_book_name and current_chapter and current_verse_num and current_verse_text_lines:
        full_verse_text = " ".join(current_verse_text_lines).strip()
        full_verse_text = re.sub(r'\s+', ' ', full_verse_text)
        if full_verse_text:
            source_detail = f"{current_book_name}, {current_chapter}:{current_verse_num}"
            quotes.append({
                "text": full_verse_text,
                "source": source_detail,
                "author": AUTHOR,
                "tradition": TRADITION,
                "book": current_book_name,
                "reference": f"{current_chapter}:{current_verse_num}"
            })

    print(f"\nSuccessfully parsed {len(quotes)} KJV Bible verses.")
    return quotes

def save_quotes_to_json(quotes, filepath):
    if not quotes:
        print("No quotes to save.")
        return
    unique_quotes = []
    seen_texts = {} # Using dict for more complex duplicate check if needed {text_normalized: source_detail}
    for quote in quotes:
        normalized_text = ' '.join(quote["text"].split())
        if normalized_text not in seen_texts:
            unique_quotes.append(quote)
            seen_texts[normalized_text] = quote["source"]
        # else:
            # print(f"Duplicate text found ('{normalized_text[:30]}...'), first seen from {seen_texts[normalized_text]}, current: {quote['source']}")
    
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(unique_quotes, f, indent=2, ensure_ascii=False)
        print(f"Quotes successfully saved to: {filepath} ({len(unique_quotes)} unique quotes)")
    except IOError as e:
        print(f"Error saving quotes to {filepath}: {e}")

if __name__ == "__main__":
    plain_text_content = fetch_text_content(URL_TEXT)
    if plain_text_content:
        kjv_bible_quotes = parse_kjv_bible_text(plain_text_content)
        save_quotes_to_json(kjv_bible_quotes, OUTPUT_QUOTES_PATH)