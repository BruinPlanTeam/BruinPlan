import re
import sys
import time
from typing import List, Dict, Set
from bs4 import BeautifulSoup

from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException

print("SCRIPT STARTED –", __file__)

GE_MASTER_LIST_URL = "https://sa.ucla.edu/ro/Public/SOC/Search/GECoursesMasterList"

REQ_MAP = {
    'Society and Culture: Historical Analysis': 138,
    'Society and Culture: Social Analysis': 139,
    'Scientific Inquiry: Life Sciences': 140, 
    'Arts and Humanities: Literary and Cultural Analysis': 141,
    'Arts and Humanities: Philosophical and Linguistic Analysis': 142,
    'Arts and Humanities: Visual and Performance Arts Analysis and Practice': 143,
}

ABBR_MAP = {
    'African American Studies': 'AF AMER',
    'American Indian Studies': 'AM IND',
    'Ancient Near East': 'ANES',
    'Anthropology': 'ANTHRO',
    'Architecture and Urban Design': 'ARCH&UD',
    'Art History': 'ARTHIST',
    'Arts Education': 'ARTSED',
    'Asian': 'ASIAN',
    'Asian American Studies': 'ASIAAM',
    'Central and East European Studies': 'CEES',
    'Chicana/o and Central American Studies': 'CHIC&CAM',
    'Chinese': 'CHIN',
    'Classics': 'CLASSIC',
    'Clusters': 'CLUSTER',
    'Communication': 'COMM',
    'Community Engagement and Social Change': 'CESC',
    'Community Health Sciences': 'CHS',
    'Comparative Literature': 'COMPLIT',
    'Design / Media Arts': 'DMA',
    'Digital Humanities': 'DH',
    'Disability Studies': 'DISABIL',
    'Economics': 'ECON',
    'Education': 'EDUC',
    'English': 'ENG',
    'Environment': 'ENVIRON',
    'Ethnomusicology': 'ETHNOMU',
    'European Languages and Transcultural Studies': 'ELTS',
    'Food Studies': 'FOOD',
    'French': 'FRENCH',
    'Gender Studies': 'GENDER',
    'Geography': 'GEOG',
    'German': 'GERMAN',
    'Gerontology': 'GERON',
    'Global Studies': 'GLOBAL',
    'History': 'HIST',
    'Honors Collegium': 'HONORS',
    'Information Studies': 'INFOSTD',
    'International and Area Studies': 'INTL&AREA',
    'International Development Studies': 'IDS',
    'Iranian': 'IRAN',
    'Islamic Studies': 'ISLAM',
    'Italian': 'ITAL',
    'Japanese': 'JPN',
    'Jewish Studies': 'JEWISH',
    'Korean': 'KOREAN',
    'Labor Studies': 'LABOR',
    'Lesbian, Gay, Bisexual, Transgender, and Queer Studies': 'LGBTQ',
    'Linguistics': 'LING',
    'Middle Eastern Studies': 'MIDEAST',
    'Musicology': 'MUSICOL',
    'Philosophy': 'PHILOS',
    'Political Science': 'POL SCI',
    'Portuguese': 'PORT',
    'Public Affairs': 'PBAF',
    'Public Health': 'PUB HLT',
    'Public Policy': 'PUB PLC',
    'Religion, Study of': 'REL',
    'Russian': 'RUSS',
    'Scandinavian': 'SCAND',
    'Slavic': 'SLAVIC',
    'Social Welfare': 'SW',
    'Society and Genetics': 'SOCGEN',
    'Sociology': 'SOCIOL',
    'Southeast Asian': 'SEASIAN',
    'Spanish': 'SPAN',
    'Statistics': 'STATS',
    'Theater': 'THEATER',
    'Vietnamese': 'VIET',
    'World Arts and Cultures': 'WAC',
}

def get_subject_abbr(subject_name: str) -> str:
    return ABBR_MAP.get(subject_name, subject_name.upper().replace(r'[^A-Z0-9&]', ''))

class Course:
    def __init__(self, subject_name: str, cat_num: str, title: str, categories: List[str], units: int):
        self.subject_abbr = get_subject_abbr(subject_name)
        self.cat_num = cat_num.strip()
        self.title = title.strip()
        self.categories = categories
        self.units = units
        self.code = f"{self.subject_abbr} {self.cat_num}"

    def __repr__(self):
        return f"Course(code={self.code}, title={self.title}, units={self.units}, categories={self.categories})"

# ==================================================================
#  NEW FUNCTION: Generates an UPDATE-only script
# ==================================================================
def generate_unit_update_sql(courses_to_update: List[Course]) -> str:
    sql_lines = [
        "-- ========================================================",
        "-- PATCH SCRIPT FOR COURSE UNITS",
        "-- This script updates the 'units' column for courses that",
        "-- were incorrectly set to 4.",
        f"-- Total Courses to Update: {len(courses_to_update)}",
        "-- ========================================================",
        "",
    ]

    for course in courses_to_update:
        # We already filtered this list, but this is a good safeguard
        if course.units != 5:
            continue

        # Sanitize the code just in case
        safe_code = course.code.replace("'", "''")
        
        sql_lines.append(f"-- Patching: {safe_code} -> 5 units")
        
        # The UPDATE command with the critical collation fix
        sql_lines.append(
            f"UPDATE Class SET units = 5 "
            f"WHERE code = '{safe_code}' COLLATE utf8mb4_unicode_ci;"
        )

    sql_lines.append("\n-- --- END OF SCRIPT ---")
    return "\n".join(sql_lines)

# ==================================================================
#  This is the CORRECTED scraper function from our previous chat
# ==================================================================
def main_scraper():
    print("Setting up Selenium Chrome driver...")
    chrome_options = Options()
    # chrome_options.add_argument("--headless") 
    chrome_options.add_argument("--log-level=3") 
    chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36")

    try:
        service = ChromeService(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=chrome_options)
    except Exception as e:
        print(f"Error setting up Chrome Driver: {e}", file=sys.stderr)
        print("Please ensure you have Google Chrome installed.", file=sys.stderr)
        sys.exit(1)

    print(f"Loading page: {GE_MASTER_LIST_URL}...")
    
    courses_list: List[Course] = []
    
    try:
        driver.get(GE_MASTER_LIST_URL)
        
        try:
            host = driver.execute_script('return document.querySelector("ucla-sa-soc-app")')
            if not host:
                print("❌  host <ucla-sa-soc-app> not found in light DOM")
                raise RuntimeError("host missing")
            print("✅  host <ucla-sa-soc-app> found")

            outer = driver.execute_script(
                'return arguments[0].shadowRoot.querySelector(\'iwe-autocomplete[id="select_soc_filter_geclasses_foundation"]\')', host
            )
            if not outer:
                print("❌  <iwe-autocomplete> not found inside host shadow-root")
                raise RuntimeError("outer missing")
            print("✅  <iwe-autocomplete> found inside host shadow-root")

            shadow_input = driver.execute_script(
                'return arguments[0].shadowRoot.querySelector(\'input[placeholder="Enter a Foundation (Required)"]\')', outer
            )
            if not shadow_input:
                print("❌  input not found inside <iwe-autocomplete> shadow-root")
                raise RuntimeError("input missing")
            print("✅  input found inside <iwe-autocomplete> shadow-root")

            shadow_input.click()
            print("✅  clicked foundation dropdown")
        except Exception as e:
            print("💥  shadow-root chain failed:", e)
            raise

        print("Clicked dropdown button.")

        time.sleep(1.0) 

        print("Looking for option inside same shadow-root...")
        option = driver.execute_script(
            'return arguments[0].shadowRoot.querySelector(\'div[role="option"]\')', outer
        )
        if not option:
            raise RuntimeError("option 'Foundations of Arts and Humanities' not found")
        option.click()
        print("✅ Selected first foundation.")
                

        driver.execute_script(
        'arguments[0].shadowRoot.querySelector(\'input[id="btn_gecourses_go"]\').click()', host
        )
        print("Clicked GO button.")

        print("Waiting for search results to load...")
        try:
            wait = WebDriverWait(driver, 15)
            wait.until(
                lambda d: d.execute_script(
                    'return arguments[0].shadowRoot.querySelector("#divSearchResults h4")', 
                    host
                )
            )
            print("✅ Results loaded successfully.")
        except TimeoutException:
            print("❌ Timed out waiting for search results.", file=sys.stderr)
            raise RuntimeError("Page did not load search results in time.")

        current_subject_name = None
        
        print("Parsing results inside shadow-root...")
        shadow_html = driver.execute_script(
            'return arguments[0].shadowRoot.querySelector("#divSearchResults").innerHTML', host
        )
        soup_shadow = BeautifulSoup(shadow_html, 'html.parser')

        current_subject_name = None

        for wrapper in soup_shadow.select('.ContainerWrapper'):
            h4 = wrapper.find('h4')
            if h4:
                current_subject_name = h4.get_text(strip=True)
                continue

            table = wrapper.select_one('table.table-striped')
            if table and current_subject_name:
                for tr in table.select('tbody tr'):
                    cols = tr.select('td')
                    if len(cols) != 6:
                        continue
                    
                    cat_num = cols[0].text.strip()
                    title = cols[1].text.strip()
                    categories = [
                        c.strip() for c in cols[5].get_text(separator='\n').split('\n')
                        if c.strip() in REQ_MAP
                    ]

                    if cat_num and title and categories:
                        
                        # --- This is the correct 5-unit logic ---
                        five_unit_ids = {138, 139, 141, 142, 143}
                        is_five_units = any(REQ_MAP.get(cat) in five_unit_ids for cat in categories)
                        units = 5 if is_five_units else 4
                        # --- End of unit logic ---
                        
                        courses_list.append(Course(current_subject_name, cat_num, title, categories, units))

    except TimeoutException as e:
        print(f"\n--- ERROR: TIMEOUT ---", file=sys.stderr)
        print(f"Details: {e}", file=sys.stderr)
    except Exception as e:
        print(f"\n--- ERROR during scraping ---", file=sys.stderr)
        print(f"An unexpected error occurred: {e}", file=sys.stderr)
            
    finally:
            driver.quit()
            print("Browser closed.")

            return courses_list

# ==================================================================
#  UPDATED main execution block
# ==================================================================
if __name__ == "__main__":
    
    print("Scraping all courses to find unit mismatches...")
    all_courses = main_scraper()
    
    if not all_courses:
        print("\nNo courses were parsed. This might be a script error or the source website is down.", file=sys.stderr)
        sys.exit(1)
        
    print(f"\nSuccessfully parsed {len(all_courses)} courses.")
    
    # Filter the list to ONLY include the 5-unit courses
    five_unit_courses = [c for c in all_courses if c.units == 5]
    
    if not five_unit_courses:
        print("No 5-unit courses were found by the scraper. No patch script needed.")
        sys.exit(0)
        
    print(f"Found {len(five_unit_courses)} courses that should be 5 units.")
    
    # Generate the new SQL patch script
    final_sql_script = generate_unit_update_sql(five_unit_courses)
    
    output_filename = "update_units.sql"  # <-- New filename
    try:
        with open(output_filename, "w", encoding="utf-8") as f:
            f.write(final_sql_script)
        print(f"\n✅ Success! SQL patch script saved to: {output_filename}")
    except IOError as e:
        print(f"\n❌ Error writing to file: {e}", file=sys.stderr)