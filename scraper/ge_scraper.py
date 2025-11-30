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

def generate_sql_script(courses: List[Course]) -> str:
    sql_lines = [
        "-- ========================================================",
        "-- FINAL SCRIPT (No Procedure / No 'IF' logic Fix)",
        "-- This script uses INSERT IGNORE, which requires that",
        "-- the 'code' column in your 'Class' table has a",
        "-- UNIQUE constraint (which it should).",
        "-- ========================================================",
        "",
        "----------------------------------------------------------",
        f"-- Total Courses Parsed: {len(courses)}",
        "----------------------------------------------------------",
        "",
        "-- ========================================================",
        "-- STEP 1: DEFINE FIXED REQUIREMENT IDs (DO NOT CHANGE THESE)",
        "-- ========================================================",
        "",
        "SET @r_hist_id = 138; -- Society and Culture: Historical Analysis",
        "SET @r_social_id = 139; -- Society and Culture: Social Analysis",
        "SET @r_life_sci_id = 140; -- Scientific Inquiry: Life Sciences",
        "SET @r_lit_cult_id = 141; -- Arts and Humanities: Literary and Cultural Analysis",
        "SET @r_phil_ling_id = 142; -- Arts and Humanities: Philosophical and Linguistic Analysis",
        "SET @r_vis_perf_id = 143; -- Arts and Humanities: Visual and Performance Arts Analysis",
        "",
        "-- ========================================================",
        "-- STEP 2: INSERT CLASSES AND LINK THEM TO GE CATEGORIES",
        "-- ========================================================",
    ]

    for course in courses:
        safe_title = course.title.replace("'", "''")
        safe_abbr = course.subject_abbr.replace("'", "''")
        safe_cat_num = course.cat_num.replace("'", "''")
        
        # Combine them into the final code identifier
        safe_code = f"{safe_abbr} {safe_cat_num}"
        
        sql_lines.append(f"\n-- {course.code}: {safe_title} ({course.units} units)")
        
        # --- This is the new logic (No IF statements) ---
        
        # 1. Attempt to insert the class. If 'code' is UNIQUE and exists,
        #    this line will be safely skipped.
        sql_lines.append(f"INSERT IGNORE INTO Class (code, units, description) VALUES ('{safe_code}', {course.units}, '{safe_title}');")

        # 2. Get the ID of the class (which either existed or was just created).
        sql_lines.append("SET @c_id = NULL;")
        sql_lines.append(f"SELECT id INTO @c_id FROM Class WHERE code = '{safe_code}' COLLATE utf8mb4_unicode_ci;")
        
        # 3. Now link the class.
        #    We are *already* using INSERT IGNORE here.
        #    If @c_id is NULL (which should never happen if step 1&2 work),
        #    this INSERT will fail, which is correct.
        for category in course.categories:
            req_id = REQ_MAP.get(category)
            if not req_id:
                sql_lines.append(f"-- WARNING: No ID found for category: {category}")
                continue

            req_var = {
                138: '@r_hist_id', 139: '@r_social_id', 140: '@r_life_sci_id',
                141: '@r_lit_cult_id', 142: '@r_phil_ling_id', 143: '@r_vis_perf_id'
            }.get(req_id, f'-- ERROR: Unknown ID {req_id}')
            
            sql_lines.append(f"INSERT IGNORE INTO RequirementClasses (reqId, classId) VALUES ({req_var}, @c_id);")

    return "\n".join(sql_lines)

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

        js_find_option = """
            const options = arguments[0].shadowRoot.querySelectorAll('div[role="option"]');
            for (const opt of options) {
              if (opt.textContent.includes('Scientific Inquiry')) {
                return opt;
              }
            }
            return null;
        """
        option = driver.execute_script(js_find_option, outer)
        if not option:
            raise RuntimeError("option 'Foundation' not found")
        
        option.click()
        print("✅ Selected first foundation.")
                

        driver.execute_script(
        'arguments[0].shadowRoot.querySelector(\'input[id="btn_gecourses_go"]\').click()', host
        )
        print("Clicked GO button.")

        print("Waiting for search results to load...")
        try:
            # We will wait up to 15 seconds for the first subject header (h4)
            # to appear inside the results div. This proves the content is loaded.
            wait = WebDriverWait(driver, 15)
            wait.until(
                lambda d: d.execute_script(
                    # Check for the first h4 inside the results div
                    'return arguments[0].shadowRoot.querySelector("#divSearchResults h4")', 
                    host
                )
            )
            print("✅ Results loaded successfully.")
        except TimeoutException:
            # If this fails, the page structure may have changed or the site is down.
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
                        
                        # =======================================================
                        #  START OF FIX
                        # =======================================================
                        
                        # Define the set of 5-unit requirement IDs
                        five_unit_ids = {138, 139, 141, 142, 143}
                        
                        # Check if any of the course's categories map to an ID in our 5-unit set
                        is_five_units = any(REQ_MAP.get(cat) in five_unit_ids for cat in categories)
                        
                        # Set units to 5 if it matches, otherwise default to 4
                        units = 5 if is_five_units else 4
                        
                        # =======================================================
                        #  END OF FIX
                        # =======================================================
                        
                        courses_list.append(Course(current_subject_name, cat_num, title, categories, units))

    except TimeoutException as e:
        print(f"\n--- ERROR: TIMEOUT ---", file=sys.stderr)
        print(f"The script timed out waiting for an element. This might mean the page structure has changed or the site is slow.", file=sys.stderr)
        print(f"Details: {e}", file=sys.stderr)
    except Exception as e:
        print(f"\n--- ERROR during scraping ---", file=sys.stderr)
        print(f"An unexpected error occurred: {e}", file=sys.stderr)
            
    finally:
            driver.quit()
            print("Browser closed.")

            return courses_list

if __name__ == "__main__":
    
    courses = main_scraper()
    
    if not courses:
        print("\nNo courses were parsed. This might be a script error or the source website is down.", file=sys.stderr)
        sys.exit(1)
        
    print(f"\nSuccessfully parsed {len(courses)} courses.")
    
    final_sql_script = generate_sql_script(courses)
    
    output_filename = "ge_courses.sql"
    try:
        with open(output_filename, "w", encoding="utf-8") as f:
            f.write(final_sql_script)
        print(f"\n✅ Success! SQL script saved to: {output_filename}")
    except IOError as e:
        print(f"\n❌ Error writing to file: {e}", file=sys.stderr)