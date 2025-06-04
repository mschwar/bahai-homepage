import requests
import json
import os
import re

# --- Configuration ---
URL_TEXT = "https://www.gutenberg.org/cache/epub/2388/pg2388.txt" 

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
OUTPUT_QUOTES_PATH = os.path.join(PROJECT_ROOT, 'data', 'quotes_gita_arnold.json') 

# Attributions
PRIMARY_AUTHOR = "Krishna (Bhagavad-Gita)" # All quotes from this work attributed to Krishna
TRANSLATOR_NAME = "Sir Edwin Arnold"
SOURCE_BOOK_TITLE = "The Song Celestial (Bhagavad-Gita)"
TRADITION = "Hinduism"
NARRATIVE_LABEL = "Narrative" # Still useful for the 'speaker' field

# --- Main Script ---
def fetch_text_content(url):
    print(f"Fetching content from: {url}")
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 YourAppName/1.0 (Contact: youremail@example.com)'
        }
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        try:
            text_content = response.content.decode('utf-8')
        except UnicodeDecodeError:
            try:
                text_content = response.content.decode('iso-8859-1')
            except UnicodeDecodeError:
                text_content = response.content.decode('cp1252')
        print("Content fetched successfully.")
        return text_content
    except requests.exceptions.RequestException as e:
        print(f"Error fetching URL {url}: {e}")
        return None

def parse_gita_text(text_content):
    if not text_content:
        return []

    quotes = []
    current_chapter_title_short = "Unknown Chapter"
    current_chapter_name_long = ""
    current_speaker_label = NARRATIVE_LABEL 
    paragraph_counter_within_chapter_section = 0

    chapter_heading_regex = re.compile(r"^\s*CHAPTER\s+([IVXLCDM]+)\s*$", re.MULTILINE)
    chapter_name_regex = re.compile(r"^\s*([A-Z0-9\s'-]+[A-Z0-9'-])\s*$", re.MULTILINE)
    speaker_regex = re.compile(r"^\s*([A-Za-z\s]+(?:irashtra)?)\s*[:.]\s*(.*)", re.IGNORECASE)

    start_marker = "CHAPTER I" 
    content_start_index = text_content.upper().find(start_marker)
    if content_start_index == -1:
        relevant_content = text_content
    else:
        content_start_index = text_content.rfind('\n', 0, content_start_index) + 1
        relevant_content = text_content[content_start_index:]
        
    lines = relevant_content.splitlines()
    
    paragraphs = []
    current_paragraph_lines = []
    for line in lines:
        if line.strip() == "": 
            if current_paragraph_lines:
                paragraphs.append(" ".join(current_paragraph_lines))
                current_paragraph_lines = []
        else:
            current_paragraph_lines.append(line.strip())
    if current_paragraph_lines:
        paragraphs.append(" ".join(current_paragraph_lines))

    expecting_chapter_name = False

    for para_text_original in paragraphs:
        para_text = para_text_original.strip()
        if not para_text:
            continue

        if "*** END OF THE PROJECT GUTENBERG EBOOK" in para_text.upper() or \
           ("HERE ENDETH CHAPTER XVIII" in para_text.upper() and "OF THE BHAGAVAD-GITA" in para_text.upper()):
            print("Found end of ebook marker within paragraph processing.")
            break
        
        if "HERE ENDETH CHAPTER" in para_text.upper() and "OF THE BHAGAVAD-GITA" in para_text.upper():
            current_speaker_label = NARRATIVE_LABEL 
            continue

        chapter_match = chapter_heading_regex.match(para_text)
        if chapter_match:
            current_chapter_title_short = f"Chapter {chapter_match.group(1).strip()}"
            current_speaker_label = NARRATIVE_LABEL 
            current_chapter_name_long = "" 
            paragraph_counter_within_chapter_section = 0
            expecting_chapter_name = True
            print(f"\nProcessing: {current_chapter_title_short}")
            continue

        if expecting_chapter_name and not speaker_regex.match(para_text) and len(para_text.split()) > 1 and len(para_text.split()) < 10:
            if para_text.isupper() or (para_text.istitle() and "  " not in para_text):
                current_chapter_name_long = para_text
                print(f"  Chapter Name: {current_chapter_name_long}")
            expecting_chapter_name = False 
            continue

        speaker_text_from_line = ""
        speaker_match = speaker_regex.match(para_text)
        if speaker_match:
            identified_speaker = speaker_match.group(1).strip()
            if "Arjun" in identified_speaker: identified_speaker = "Arjuna" # Normalize
            current_speaker_label = identified_speaker 
            speaker_text_from_line = speaker_match.group(2).strip()
            paragraph_counter_within_chapter_section = 0 
            if speaker_text_from_line:
                para_text = speaker_text_from_line 
            else:
                continue 
        
        if current_chapter_title_short != "Unknown Chapter":
            cleaned_text = re.sub(r'\s*\[FN#\d+\]\s*', '', para_text) 
            cleaned_text = re.sub(r'_', '', cleaned_text) 
            cleaned_text = re.sub(r'\s+', ' ', cleaned_text).strip() 

            if cleaned_text and len(cleaned_text.split()) > 3: 
                paragraph_counter_within_chapter_section += 1
                
                source_detail = f"{SOURCE_BOOK_TITLE}, {current_chapter_title_short}"
                if current_chapter_name_long:
                    source_detail += f": {current_chapter_name_long}"
                # Add narrative speaker to source if it's not Krishna (who is the main author now)
                if current_speaker_label != NARRATIVE_LABEL and current_speaker_label.lower() != "krishna":
                    source_detail += f" (Speaker: {current_speaker_label})"
                source_detail += f", Para. {paragraph_counter_within_chapter_section}"

                reference_speaker_part = current_speaker_label if current_speaker_label != NARRATIVE_LABEL else "Narrative"

                quotes.append({
                    "text": cleaned_text,
                    "source": source_detail,
                    "author": PRIMARY_AUTHOR,  # Consistently Krishna for all Gita quotes
                    "speaker": current_speaker_label, # Who is narratively speaking
                    "translator": TRANSLATOR_NAME,
                    "tradition": TRADITION,
                    "book": SOURCE_BOOK_TITLE,
                    "reference": f"{current_chapter_title_short}, {reference_speaker_part} Para. {paragraph_counter_within_chapter_section}"
                })

    print(f"\nSuccessfully parsed {len(quotes)} paragraphs/stanzas from Bhagavad-Gita.")
    return quotes


def save_quotes_to_json(quotes, filepath):
    if not quotes:
        print("No quotes to save.")
        return
    unique_quotes = []
    seen_texts = {} 
    for quote in quotes:
        normalized_text = ' '.join(quote["text"].split())
        unique_key = normalized_text + "||" + quote["source"] 
        if unique_key not in seen_texts:
            unique_quotes.append(quote)
            seen_texts[unique_key] = True
    
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(unique_quotes, f, indent=2, ensure_ascii=False)
        print(f"Quotes successfully saved to: {filepath} ({len(unique_quotes)} unique quotes)")
    except IOError as e:
        print(f"Error saving quotes to {filepath}: {e}")

if __name__ == "__main__":
    plain_text_content = fetch_text_content(URL_TEXT)
    if plain_text_content:
        gita_quotes = parse_gita_text(plain_text_content)
        save_quotes_to_json(gita_quotes, OUTPUT_QUOTES_PATH)