import csv
import re
import time
import sys
from tqdm import tqdm
from bs4 import BeautifulSoup

# Selenium Imports
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options

# --- Config ---
URL_TMPL  = "https://catalog.registrar.ucla.edu/course/2024/{}"
IN_FILE   = 'courses.txt'
OUT_FILE  = 'ucla_catalog_selenium.csv'

# --- (!!!!) UPDATED PARSER (!!!!) ---
UNITS_PAT  = re.compile(r'(\d+(?:\.\d+)?)\s+units?', re.I)
# Find "Requisites:" and capture everything until the first period.
# re.DOTALL makes '.' match newlines, just in case.
REQ_PAT    = re.compile(r'Requisites?:\s*(.*?)\.', re.I | re.DOTALL) 

def parse_units_and_req_string(text: str):
    """
    Returns: (units_float, 'The full raw requisite string.')
    """
    if not text:
        return None, ''
    
    # 1. Parse Units (same as before)
    u = UNITS_PAT.search(text)
    units = float(u.group(1)) if u else None
    
    # 2. Parse Prereq String
    r = REQ_PAT.search(text)
    
    # Get the captured group (everything between "Requisites:" and ".")
    # .strip() to clean up leading/trailing whitespace
    prereq_string = r.group(1).strip() if r else '' 
        
    return units, prereq_string
# --- End of UPDATED Section ---


# --- Load and SANITIZE Course Codes (same as before) ---
print(f"Loading and SANITIZING codes from '{IN_FILE}'...")
CODES = []
try:
    with open(IN_FILE) as f:
        for line in f:
            clean_line = line.strip().strip("\"'")
            if not clean_line:
                continue
            url_code = clean_line.replace(' ', '').replace('&', '').upper()
            if url_code:
                CODES.append(url_code)

    if not CODES:
        print(f"Error: Your input file '{IN_FILE}' is empty or contains no valid codes.")
        sys.exit(1)
    
    print(f"Loaded {len(CODES)} sanitized codes.")
    print(f"Example codes being used: {CODES[:5]}")

except FileNotFoundError:
    print(f"Error: Input file '{IN_FILE}' not found.")
    sys.exit(1)


# --- Setup Selenium Driver (same as before) ---
print("Setting up Selenium Chrome driver...")
chrome_options = Options()
# chrome_options.add_argument("--headless")
chrome_options.add_argument("--log-level=3") 
chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36")

try:
    service = ChromeService(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    print("Chrome driver is running.")
except Exception as e:
    print(f"Error setting up Chrome Driver: {e}")
    sys.exit(1)


# --- Main Scrape Loop ---
with open(OUT_FILE, 'w', newline='', encoding='utf-8') as f:
    # UPDATED CSV header
    writer = csv.writer(f)
    writer.writerow(['course_code', 'title', 'units', 'prerequisite_text']) 
    
    print(f"Starting scrape... Output will be in '{OUT_FILE}'")
    
    for code in tqdm(CODES, desc="Scraping with Selenium"):
        url = URL_TMPL.format(code) 
        
        try:
            driver.get(url)
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "h1"))
            )
            
            html_source = driver.page_source
            soup = BeautifulSoup(html_source, 'html.parser')

            title_tag = soup.h1
            title = title_tag.get_text(strip=True) if title_tag else "TITLE NOT FOUND"
            
            body_text = soup.get_text(' ', strip=True)
            
            # UPDATED function call
            units, prereq_text = parse_units_and_req_string(body_text) 
            
            # UPDATED writer call
            writer.writerow([code, title, units, prereq_text]) 
            f.flush()

        except Exception as e:
            print(f"  -> Failed on {code}: Page timed out or 404")
            writer.writerow([code, 'PAGE FAILED TO LOAD', '', ''])
            f.flush()

# --- Cleanup ---
driver.quit()
print("\n---")
print(f"Scrape finished! All data saved to '{OUT_FILE}'.")