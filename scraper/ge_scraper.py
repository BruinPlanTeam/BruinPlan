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
from selenium.common.exceptions import TimeoutException, NoSuchElementException

print(f"SCRIPT STARTED – {__file__}")

GE_MASTER_LIST_URL = "https://sa.ucla.edu/ro/Public/SOC/Search/GECoursesMasterList"

# Requirement Name to Database ID mapping
REQ_MAP = {
    'Society and Culture: Historical Analysis': 138,
    'Society and Culture: Social Analysis': 139,
    'Scientific Inquiry: Life Sciences': 140,
    'Arts and Humanities: Literary and Cultural Analysis': 141,
    'Arts and Humanities: Philosophical and Linguistic Analysis': 142,
    'Arts and Humanities: Visual and Performance Arts Analysis and Practice': 143,
}

# Subject Area Name to Abbreviation mapping
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
    """Gets the official abbreviation for a subject name."""
    return ABBR_MAP.get(subject_name, subject_name.upper().replace(r'[^A-Z0-9&]', ''))

class Course:
    """A simple class to hold course data."""
    def __init__(self, subject_name: str, cat_num: str, title: str, categories: Set[str], units: int):
        self.subject_abbr = get_subject_abbr(subject_name)
        self.cat_num = cat_num.strip()
        self.title = title.strip()
        self.categories = categories
        self.units = units
        self.code = f"{self.subject_abbr} {self.cat_num}"

    def __repr__(self):
        return f"Course(code={self.code}, title={self.title}, units={self.units}, categories={self.categories})"
    
    def merge_categories(self, new_categories: Set[str]):
        """Adds new categories to the course's existing set."""
        self.categories.update(new_categories)

def generate_sql_script(courses: Dict[str, Course]) -> str:
    """Generates the final SQL script from the dictionary of courses."""
    sql_lines = [
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

    # Sort courses by code for a clean script
    sorted_courses = sorted(courses.values(), key=lambda c: c.code)

    for course in sorted_courses:
        safe_title = course.title.replace("'", "''")
        safe_code = course.code.replace("'", "''")
        
        sql_lines.append(f"\n-- {course.code}: {safe_title} ({course.units} units)")
        sql_lines.append(f"INSERT IGNORE INTO Class (code, units, description) VALUES ('{safe_code}', {course.units}, '{safe_title}');")
        
        sql_lines.append("SET @c_id = NULL;")
        sql_lines.append(f"SELECT id INTO @c_id FROM Class WHERE code = '{safe_code}' COLLATE utf8mb4_unicode_ci;")
        
        for category in sorted(list(course.categories)): # Sort categories for deterministic output
            req_id = REQ_MAP.get(category)
            if not req_id:
                sql_lines.append(f"-- WARNING: No ID found for category: {category}")
                continue

            # Map the database ID to the SQL variable name
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
    
    # Use a dictionary to store courses, keyed by code to prevent duplicates
    courses_dict: Dict[str, Course] = {}
    wait = WebDriverWait(driver, 15)
    
    try:
        driver.get(GE_MASTER_LIST_URL)
        
        # Find the main app host element
        host = wait.until(
            EC.presence_of_element_located((By.TAG_NAME, "ucla-sa-soc-app"))
        )
        host_shadow_root = host.shadow_root
        
        # Find the 'Go' button
        go_button = host_shadow_root.find_element(By.CSS_SELECTOR, 'input[id="btn_gecourses_go"]')
        
        # Find the foundation dropdown
        foundation_dropdown = host_shadow_root.find_element(
            By.CSS_SELECTOR, 'iwe-autocomplete[id="select_soc_filter_geclasses_foundation"]'
        )
        foundation_input = foundation_dropdown.shadow_root.find_element(
            By.CSS_SELECTOR, 'input[placeholder="Enter a Foundation (Required)"]'
        )

        # --- Main Scraper Loop ---
        # Iterate over each foundation, scrape it, and add to the dict
        for foundation_name in REQ_MAP.keys():
            print(f"\n--- Scraping Foundation: {foundation_name} ---")
            
            try:
                # 1. Click the input to open the dropdown
                foundation_input.click()
                print("Clicked foundation dropdown.")
                time.sleep(0.5) # Wait for dropdown animation

                # 2. Find and click the correct option in the dropdown
                options = foundation_dropdown.shadow_root.find_elements(By.CSS_SELECTOR, 'div[role="option"]')
                found_option = False
                for opt in options:
                    if foundation_name in opt.text:
                        opt.click()
                        print(f"Selected foundation: {foundation_name}")
                        found_option = True
                        break
                if not found_option:
                    print(f"Warning: Could not find foundation option for '{foundation_name}'")
                    continue
                
                time.sleep(0.5) # Wait for click to register

                # 3. Click the 'Go' button
                go_button.click()
                print("Clicked 'GO' button.")

                # 4. Wait for results to load
                print("Waiting for search results...")
                results_div = wait.until(
                    lambda d: host.shadow_root.find_element(By.CSS_SELECTOR, "#divSearchResults")
                )
                
                # Wait for the headers (h4) to be present, indicating results are in
                wait.until(
                    lambda d: results_div.find_elements(By.CSS_SELECTOR, "h4")
                )
                print("Results loaded.")

                # 5. Parse the results directly with Selenium
                current_subject_name = None
                elements = results_div.find_elements(By.CSS_SELECTOR, ".ContainerWrapper, .ContainerWrapper h4")

                for element in elements:
                    if element.tag_name == 'h4':
                        current_subject_name = element.text.strip()
                        continue
                    
                    if not current_subject_name:
                        continue # Skip any tables before the first subject header

                    try:
                        table_rows = element.find_elements(By.CSS_SELECTOR, 'table.table-striped tbody tr')
                        for tr in table_rows:
                            cols = tr.find_elements(By.TAG_NAME, 'td')
                            if len(cols) != 6:
                                continue
                            
                            cat_num = cols[0].text.strip()
                            title = cols[1].text.strip()
                            
                            # Get all categories listed for this course
                            categories_text = cols[5].text
                            categories = {
                                c.strip() for c in categories_text.split('\n')
                                if c.strip() in REQ_MAP
                            }

                            if not (cat_num and title and categories):
                                continue # Skip if essential info is missing
                            
                            # Infer units based on GE requirement type
                            # (Arts/Hum and Soc/Cult are 5 units, Sci Inquiry are 4)
                            five_unit_ids = {138, 139, 141, 142, 143}
                            is_five_units = any(REQ_MAP.get(cat) in five_unit_ids for cat in categories)
                            units = 5 if is_five_units else 4
                            
                            # Create code and merge if exists
                            course_code = f"{get_subject_abbr(current_subject_name)} {cat_num}"
                            if course_code in courses_dict:
                                courses_dict[course_code].merge_categories(categories)
                            else:
                                courses_dict[course_code] = Course(current_subject_name, cat_num, title, categories, units)

                    except NoSuchElementException:
                        # This wrapper had no table, which is fine.
                        continue

            except Exception as e:
                print(f"Error scraping foundation '{foundation_name}': {e}", file=sys.stderr)
                # Continue to the next foundation
                
            finally:
                # Click the 'clear' button to reset for the next loop
                try:
                    clear_button = host_shadow_root.find_element(By.CSS_SELECTOR, 'input[id="btn_gecourses_clear"]')
                    clear_button.click()
                    print("Clicked 'Clear' button.")
                    time.sleep(1) # Wait for clear
                except Exception as e:
                    print(f"Warning: Could not clear form. {e}", file=sys.stderr)


    except TimeoutException as e:
        print(f"\n--- ERROR: TIMEOUT ---", file=sys.stderr)
        print(f"The script timed out waiting for an element.", file=sys.stderr)
        print(f"Details: {e}", file=sys.stderr)
    except Exception as e:
        print(f"\n--- ERROR during scraping ---", file=sys.stderr)
        print(f"An unexpected error occurred: {e}", file=sys.stderr)
            
    finally:
            driver.quit()
            print("Browser closed.")

            return courses_dict

if __name__ == "__main__":
    
    courses = main_scraper()
    
    if not courses:
        print("\nNo courses were parsed. This might be a script error or the source website is down.", file=sys.stderr)
        sys.exit(1)
        
    print(f"\nSuccessfully parsed and merged {len(courses)} unique courses.")
    
    final_sql_script = generate_sql_script(courses)
    
    output_filename = "ge_courses_master.sql"
    try:
        with open(output_filename, "w", encoding="utf-8") as f:
            f.write(final_sql_script)
        print(f"\nSQL script saved to: {output_filename}")
    except IOError as e:
        print(f"\nError writing to file: {e}", file=sys.stderr)