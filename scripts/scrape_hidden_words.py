import requests
from bs4 import BeautifulSoup
import json
import os
import re

# --- Configuration ---
URL = "https://www.bahai.org/library/authoritative-texts/bahaullah/hidden-words/hidden-words.xhtml?28ffb3b6"
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
OUTPUT_QUOTES_PATH = os.path.join(PROJECT_ROOT, 'data', 'quotes_hidden_words.json')
AUTHOR = "Bahá’u’lláh"
SOURCE_PREFIX = "The Hidden Words"

# --- Function Definitions ---
def fetch_page_content(url):
    print(f"Fetching content from: {url}")
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=20)
        response.raise_for_status()
        print("Content fetched successfully.")
        return response.text
    except requests.exceptions.RequestException as e:
        print(f"Error fetching URL {url}: {e}")
        return None

def parse_one_hidden_word_item(hw_item_div, part_name, quotes_list):
    number_p_tag = hw_item_div.find('p', class_=lambda c: c and 'db' in c.split() and 'if' in c.split() and 'zd' in c.split(), recursive=False)
    if not number_p_tag:
        return 
    number_text_match = re.match(r'(\d+)\.', number_p_tag.get_text(strip=True))
    if not number_text_match:
        return
    number_str = number_text_match.group(1)
    inner_div_for_quote = number_p_tag.find_next_sibling('div')
    if not inner_div_for_quote:
        return
    quote_p_tag = inner_div_for_quote.find('p', class_=lambda c: c and 'dd' in c.split() and 'zd' in c.split())
    if not quote_p_tag:
        return

    for br_tag in quote_p_tag.find_all('br'):
        br_tag.replace_with('\n') 
    
    kf_span = quote_p_tag.find('span', class_='kf') 
    text_parts = []
    if kf_span:
        text_parts.append(kf_span.get_text(strip=True))
        current_node = kf_span.next_sibling
        while current_node:
            if isinstance(current_node, str): 
                text_parts.append(str(current_node).strip())
            elif hasattr(current_node, 'get_text'):
                if not (current_node.name == 'a' and current_node.get('class') and 'td' in current_node.get('class')):
                    text_parts.append(current_node.get_text(strip=True))
            current_node = current_node.next_sibling
    else:
        for a_num_tag in quote_p_tag.find_all('a', class_="td ff gf"):
            a_num_tag.decompose()
        for a_sf_tag in quote_p_tag.find_all('a', class_="sf"):
            a_sf_tag.decompose()
        full_quote_text_raw = quote_p_tag.get_text(strip=False) 
        text_parts = [line.strip() for line in full_quote_text_raw.split('\n') if line.strip()]

    full_quote_text = ' '.join(part for part in text_parts if part).strip()
    full_quote_text = re.sub(r'[ \t]+', ' ', full_quote_text) 
    full_quote_text = full_quote_text.replace(' \n ', '\n').replace('\n ', '\n').replace(' \n', '\n') 

    if full_quote_text:
        source_detail = f"{SOURCE_PREFIX}, From the {part_name} #{number_str}"
        quotes_list.append({
            "text": full_quote_text,
            "source": source_detail,
            "author": AUTHOR
        })
    else:
        print(f"    Warning: Empty quote text for {part_name} #{number_str} after processing.")

def parse_hidden_words(html_content):
    if not html_content:
        return []
    soup = BeautifulSoup(html_content, 'lxml')
    all_quotes = []
    
    top_level_div_b = soup.find('div', class_='b')
    if not top_level_div_b:
        print("DEBUG: Could not find the top-level div with class 'b'.")
        return all_quotes
    # print("DEBUG: Found top_level_div_b.")

    nav_and_title_wrapper = top_level_div_b.find('div', recursive=False)
    if not nav_and_title_wrapper:
        print("DEBUG: Error finding first child div of div.b (nav_and_title_wrapper)")
        return all_quotes
    # print("DEBUG: Found nav_and_title_wrapper.")
    
    content_wrapper = nav_and_title_wrapper.find_next_sibling('div')
    if not content_wrapper:
        print("DEBUG: Error finding content_wrapper (sibling of nav_and_title_wrapper).")
        return all_quotes
    print(f"DEBUG: content_wrapper found. Let's list its direct 'div' children that will be sections:")
    
    section_div_candidates = content_wrapper.find_all('div', recursive=False)
    
    # --- NEW DEBUG ---
    candidate_idx = 0
    for candidate in section_div_candidates:
        if candidate.name == 'div': 
            print(f"  Candidate Section Div {candidate_idx}: <{candidate.name}> class='{candidate.get('class', [])}' id='{candidate.get('id', '')}'")
        candidate_idx += 1
    # --- END NEW DEBUG ---
    print(f"DEBUG: Found {len(section_div_candidates)} direct 'div' children of content_wrapper to check as sections.")

    for i, section_container_div_candidate in enumerate(section_div_candidates):
        # This candidate is the direct child of content_wrapper. 
        # The actual content (ic div, hw divs) is one level deeper inside it.
        actual_part_content_holder = section_container_div_candidate.find('div', recursive=False)
        if not actual_part_content_holder:
            print(f"DEBUG: Outer Loop - Iteration {i} - No direct child div in section_container_div_candidate. Skipping.")
            continue

        print(f"\nDEBUG: Outer Loop - Iteration {i} - Examining an actual_part_content_holder.")
        current_part_name = ""
        
        ic_div = actual_part_content_holder.find('div', class_='ic') 
        if not ic_div:
            print(f"DEBUG: No div.ic found in this actual_part_content_holder. Skipping.")
            continue 
        
        h2_header = ic_div.find('h2', class_='g')
        h3_lang_header = ic_div.find('h3', class_='j')

        if not h2_header or not h3_lang_header:
            print(f"DEBUG: Missing H2 or H3 within ic_div for this part. Skipping.")
            continue

        part_text_h2 = h2_header.get_text(strip=True)
        lang_text_h3 = h3_lang_header.get_text(strip=True)

        if "Arabic" in lang_text_h3:
            current_part_name = "Arabic"
        elif "Persian" in lang_text_h3:
            current_part_name = "Persian"
        
        if not current_part_name:
            print(f"DEBUG: Could not determine language part for H2: '{part_text_h2}' / H3: '{lang_text_h3}'")
            continue
            
        print(f"Processing: {SOURCE_PREFIX} - From the {current_part_name} (section found via '{part_text_h2}')")
        
        # The HW items (<div class="">) are direct children of actual_part_content_holder
        hw_items_processed_this_part = 0
        for element_in_part_holder in actual_part_content_holder.find_all(recursive=False):
            if element_in_part_holder.name == 'div' and not element_in_part_holder.get('class'):
                parse_one_hidden_word_item(element_in_part_holder, current_part_name, all_quotes)
                hw_items_processed_this_part +=1
        
        if hw_items_processed_this_part > 0:
             print(f"DEBUG: Attempted to parse {hw_items_processed_this_part} <div class=''> items for {current_part_name}.")
        else:
            print(f"DEBUG: No <div class=''> items (potential HWs) found as direct children of actual_part_content_holder for {current_part_name}.")


    print(f"\nSuccessfully parsed a total of {len(all_quotes)} Hidden Words.")
    return all_quotes

def save_quotes_to_json(quotes, filepath):
    if not quotes:
        print("No quotes to save.")
        return
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
    html_page_content = fetch_page_content(URL)
    if html_page_content:
        hidden_words_quotes_list = parse_hidden_words(html_page_content)
        save_quotes_to_json(hidden_words_quotes_list, OUTPUT_QUOTES_PATH)