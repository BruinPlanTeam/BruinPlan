"""
UCLA Catalog Scraper for Major Requirements

Scrapes the UCLA catalog to extract major requirements using Selenium and Beautiful Soup
"""

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import time
import re
import json


class UCLACatalogScraper:
    def __init__(self, headless=True):
        """Initialize the scraper with Chrome WebDriver"""
        chrome_options = Options()
        if headless:
            chrome_options.add_argument('--headless')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--window-size=1920,1080')
        chrome_options.add_argument('user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
        
        # Use ChromeDriverManager or set path manually
        try:
            from webdriver_manager.chrome import ChromeDriverManager
            driver_path = ChromeDriverManager().install()
            # Fix for ChromeDriver path issues on Mac
            if 'THIRD_PARTY_NOTICES' in driver_path or not driver_path.endswith('chromedriver'):
                import os
                driver_dir = os.path.dirname(driver_path)
                actual_driver = os.path.join(driver_dir, 'chromedriver')
                if os.path.exists(actual_driver):
                    driver_path = actual_driver
            service = Service(driver_path)
            self.driver = webdriver.Chrome(service=service, options=chrome_options)
        except (ImportError, Exception) as e:
            # Fallback to system chromedriver
            print(f"ChromeDriverManager failed: {e}")
            print("Trying system chromedriver...")
            self.driver = webdriver.Chrome(options=chrome_options)
        
        self.wait = WebDriverWait(self.driver, 10)
    
    def _convert_to_catalog_slug(self, major_name):
        """Convert major name to UCLA catalog format (camelCase with BA/BS suffix)"""
        # Map common major names to their catalog slugs
        major_mapping = {
            "african american studies": "AfricanAmericanStudiesBA",
            "african american": "AfricanAmericanStudiesBA",
            "af am": "AfricanAmericanStudiesBA",
            "computer science": "ComputerScienceBS",
        }
        
        major_lower = major_name.lower().strip()
        
        # Check direct mapping first
        for key, value in major_mapping.items():
            if key in major_lower:
                return value
        
        # Try to construct from name
        # Remove common suffixes and convert to camelCase
        words = major_name.split()
        # Remove "Studies", "Major", etc.
        words = [w for w in words if w.lower() not in ['studies', 'major', 'degree', 'program']]
        
        # Convert to camelCase
        camel_case = ''.join(word.capitalize() for word in words)
        
        # Add BA suffix (default, could be made configurable)
        return f"{camel_case}BA"
    
    def search_major(self, major_name):
        """Search for a major in the UCLA catalog"""
        # UCLA catalog uses: catalog.registrar.ucla.edu/major/2025/[MajorName]
        catalog_slug = self._convert_to_catalog_slug(major_name)
        year = "2025"  # Current catalog year
        
        # Try the direct major URL
        major_url = f"https://catalog.registrar.ucla.edu/major/{year}/{catalog_slug}"
        print(f"Navigating to: {major_url}")
        
        try:
            self.driver.get(major_url)
            time.sleep(5)
            
            # Check if page loaded successfully
            page_source = self.driver.page_source.lower()
            if "404" not in self.driver.title.lower() and "not found" not in page_source:
                print(f"Successfully loaded major page")
                return
            else:
                print("Page may not have loaded correctly, but continuing...")
        except Exception as e:
            print(f"Error loading major page: {str(e)}")
            # Try fallback: navigate to browse page
            browse_url = "https://catalog.registrar.ucla.edu/browse/College%20and%20Schools/CollegeofLettersandScience"
            print(f"Trying browse page: {browse_url}")
            self.driver.get(browse_url)
            time.sleep(3)
            
            try:
                # Try to find the major link on the browse page
                major_links = self.driver.find_elements(By.PARTIAL_LINK_TEXT, major_name)
                if major_links:
                    print(f"Found major link on browse page, clicking...")
                    major_links[0].click()
                    time.sleep(3)
            except Exception as e2:
                print(f"Could not find major link: {str(e2)}")
                raise Exception(f"Could not access major page for {major_name}")
    
    def extract_requirements(self):
        """Extract major requirements from the current page"""
        # Wait for page to load
        time.sleep(3)
        
        # Try to expand all collapsible sections
        try:
            # Look for "Expand all" button/link
            expand_all_selectors = [
                "//a[contains(text(), 'Expand all')]",
                "//button[contains(text(), 'Expand all')]",
                "//*[contains(text(), 'Expand all')]",
            ]
            
            expanded = False
            for selector in expand_all_selectors:
                try:
                    element = self.driver.find_element(By.XPATH, selector)
                    if element and element.is_displayed():
                        print("Found 'Expand all' button, clicking...")
                        self.driver.execute_script("arguments[0].click();", element)
                        time.sleep(2)
                        expanded = True
                        break
                except:
                    continue
            
            # If "Expand all" not found, try to expand individual sections
            if not expanded:
                print("'Expand all' not found, expanding individual sections...")
                
                # Try multiple strategies to expand sections
                # Strategy 1: Look for elements with aria-expanded="false"
                try:
                    collapsed = self.driver.find_elements(By.XPATH, "//*[@aria-expanded='false']")
                    for elem in collapsed:
                        try:
                            self.driver.execute_script("arguments[0].scrollIntoView(true);", elem)
                            self.driver.execute_script("arguments[0].click();", elem)
                            time.sleep(0.3)
                        except:
                            pass
                    if collapsed:
                        time.sleep(2)
                except:
                    pass
                
                time.sleep(2)  # Final wait for all content to load
        except Exception as e:
            print(f"Note: Could not expand sections automatically: {str(e)}")
            print("Continuing with current page state...")
        
        # Wait a bit more for any dynamic content to load
        time.sleep(2)
        
        # Get page source and parse with BeautifulSoup
        page_source = self.driver.page_source
        soup = BeautifulSoup(page_source, 'html.parser')
        
        requirements = {
            'major_name': '',
            'school': '',
            'requirements': [],
            'requirementGroups': []
        }
        
        # Extract major name
        title_elem = soup.find('h1') or soup.find('h2')
        if title_elem:
            title_text = title_elem.get_text(strip=True)
            requirements['major_name'] = title_text
            print(f"Found major: {requirements['major_name']}")
        
        # Extract school/college
        school_elem = soup.find(string=re.compile(r'College of Letters and Science|School', re.I))
        if school_elem:
            requirements['school'] = school_elem.parent.get_text(strip=True) if school_elem.parent else ''
            if not requirements['school']:
                requirements['school'] = "College of Letters and Science"  # Default for L&S majors
        
        # Pattern matches both short codes (AF AM 1) and full names
        course_pattern = re.compile(r'((?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+)?[A-Z]{2,4}\s+[A-Z]?\d+[A-Z]?)\s*[-–—,.]?\s*(.+?)(?:\s*\(|$)')
        
        # Parse requirement sections using Selenium
        parsed_items = self._parse_requirement_sections_selenium(course_pattern)
        
        # Separate RequirementGroups from regular requirements
        for item in parsed_items:
            if item.get('type') == 'RequirementGroup':
                requirements['requirementGroups'].append(item['requirementGroup'])
            else:
                requirements['requirements'].append(item)
        
        return requirements
    
    def _parse_requirement_sections_selenium(self, course_pattern):
        """Parse requirement sections using Selenium to get expanded content"""
        requirements_list = []
        
        try:
            # Get the entire page text after expansion
            page_text = self.driver.find_element(By.TAG_NAME, "body").text
            
            # Debug: print a portion of the page text
            print("\n=== DEBUG: Page Text Sample (The Major section) ===")
            if "The Major" in page_text:
                idx = page_text.find("The Major")
                print(page_text[idx:idx+1500])
            print("=== END DEBUG ===\n")
            
            # Split by major requirement sections
            if "Major Requirements" in page_text:
                # Find where Major Requirements section starts
                major_req_index = page_text.find("Major Requirements")
                if major_req_index != -1:
                    major_req_text = page_text[major_req_index:]
                    
                    # Define section patterns with their boundaries
                    section_patterns = [
                        (r'Preparation for the Major', 'Preparation for the Major'),
                        (r'The Major', 'The Major'),
                        (r'Areas of Concentration', 'Areas of Concentration'),
                        (r'Honors Program', 'Honors Program'),
                    ]
                    
                    # Find section boundaries
                    sections = {}
                    for pattern, name in section_patterns:
                        match = re.search(pattern, major_req_text, re.I)
                        if match:
                            start = match.start()
                            # Find the end (next section or end of text)
                            end = len(major_req_text)
                            for other_pattern, other_name in section_patterns:
                                if other_name != name:
                                    other_match = re.search(other_pattern, major_req_text[start+50:], re.I)
                                    if other_match:
                                        end = min(end, start + 50 + other_match.start())
                            sections[name] = major_req_text[start:end]
                    
                    # Get full page text for RequirementGroup detection
                    full_page_text = self.driver.find_element(By.TAG_NAME, "body").text if hasattr(self, 'driver') else ""
                    
                    # Process each section
                    for section_name, section_text in sections.items():
                        # For RequirementGroup detection, also check full page text around this section
                        extended_text = section_text
                        
                        # Check if this is a RequirementGroup pattern
                        req_group = self._parse_requirement_group(extended_text, section_name)
                        
                        if req_group:
                            # This is a RequirementGroup
                            courses = self._extract_courses_from_text(section_text, course_pattern)
                            req_group['classes'] = courses  # Store classes for reference
                            
                            requirements_list.append({
                                'type': 'RequirementGroup',
                                'requirementGroup': req_group
                            })
                            print(f"  - Extracted RequirementGroup '{section_name}': total={req_group['total']}, high={req_group['highNumberInReq']}x{req_group['numberOfHighReqs']}, low={req_group['lowNumberInReq']}x{req_group['numberOfLowReqs']}, {len(courses)} courses")
                        else:
                            # Regular requirement
                            courses_to_choose = self._extract_courses_to_choose(section_text, section_name)
                            courses = self._extract_courses_from_text(section_text, course_pattern)
                            
                            if courses or courses_to_choose > 0:
                                req = {
                                    'name': section_name,
                                    'type': self._classify_requirement_type(section_name),
                                    'coursesToChoose': courses_to_choose if courses_to_choose > 0 else (len(courses) if courses else 1),
                                    'classes': courses
                                }
                                requirements_list.append(req)
                                print(f"  - Extracted '{section_name}' with {len(courses)} courses, choose {req['coursesToChoose']}")
                            
        except Exception as e:
            print(f"Error in Selenium parsing: {str(e)}")
            import traceback
            traceback.print_exc()
        
        return requirements_list
    
    def _parse_requirement_group(self, text, section_name):
        """Parse RequirementGroup patterns from text"""
        text_lower = text.lower()
        
        print(f"\n=== Checking RequirementGroup for '{section_name}' ===")
        print(f"Text preview: {text_lower[:200]}")
        
        # Look for "total" keyword which often indicates a group
        if 'total' not in text_lower and 'one' not in text_lower and 'each' not in text_lower:
            print("No 'total', 'one', or 'each' keyword found - not a requirement group")
            return None
        
        # Pattern: "X courses total"
        total_match = re.search(r'(\d+|eight|eleven|twelve)\s+courses?\s+total', text_lower)
        print(f"Total match: {total_match.group(0) if total_match else 'None'}")
        if not total_match:
            return None
        
        # Convert word to number
        word_to_num = {
            'eight': 8, 'eleven': 11, 'twelve': 12,
            'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
            'six': 6, 'seven': 7, 'nine': 9, 'ten': 10
        }
        total_str = total_match.group(1)
        total = int(total_str) if total_str.isdigit() else word_to_num.get(total_str, 0)
        
        # Pattern: "Y in one [area/thing]"
        high_match = re.search(r'(\d+|four|five|six)\s+(?:courses?|classes?)\s+in\s+one', text_lower)
        if not high_match:
            high_match = re.search(r'(\d+|four|five|six)\s+in\s+one', text_lower)
        
        print(f"High match: {high_match.group(0) if high_match else 'None'}")
        
        high_number = 0
        number_of_high = 1  # Default to 1 if "one" is mentioned
        
        if high_match:
            high_str = high_match.group(1)
            high_number = int(high_str) if high_str.isdigit() else word_to_num.get(high_str, 0)
            print(f"High number: {high_number}, number of high reqs: {number_of_high}")
        
        # Pattern: "Z additional courses from each of the remaining N areas"
        low_match = re.search(r'(\d+|two|three|four)\s+additional\s+(?:courses?|classes?)\s+from\s+each\s+of\s+the\s+remaining\s+(\d+|two|three)\s+', text_lower)
        if not low_match:
            low_match = re.search(r'(\d+|two|three|four)\s+from\s+each\s+of\s+the\s+remaining\s+(\d+|two|three)', text_lower)
        
        print(f"Low match: {low_match.group(0) if low_match else 'None'}")
        
        low_number = 0
        number_of_low = 0
        
        if low_match:
            low_str = low_match.group(1)
            low_number = int(low_str) if low_str.isdigit() else word_to_num.get(low_str, 0)
            
            num_low_str = low_match.group(2)
            number_of_low = int(num_low_str) if num_low_str.isdigit() else word_to_num.get(num_low_str, 0)
            print(f"Low number: {low_number}, number of low reqs: {number_of_low}")
        
        # If we found a total and at least one of high/low, it's a RequirementGroup
        if total > 0 and (high_number > 0 or low_number > 0):
            return {
                'name': section_name,
                'total': total,
                'highNumberInReq': high_number,
                'numberOfHighReqs': number_of_high,
                'lowNumberInReq': low_number,
                'numberOfLowReqs': number_of_low
            }
        
        return None
    
    def _extract_courses_to_choose(self, text, section_name):
        """Extract the number of courses to choose from requirement text"""
        text_lower = text.lower()
        
        # Look for number patterns
        patterns = [
            (r'(\d+)\s+courses?\s+total', 1),
            (r'select\s+(\d+)\s+courses?\s+total', 1),
            (r'complete\s+(\d+)\s+courses?', 1),
            (r'select\s+(\d+)\s+courses?', 1),
            (r'(\d+)\s+upper-division\s+courses?', 1),
        ]
        
        for pattern, group_num in patterns:
            match = re.search(pattern, text_lower)
            if match:
                return int(match.group(1))
        
        # Default: if section says "elective" or "select", assume 1
        if 'elective' in text_lower or 'select' in text_lower:
            return 1
        
        return 0
    
    def _classify_requirement_type(self, text):
        """Classify the type of requirement based on text"""
        text_lower = text.lower()
        if 'lower' in text_lower or 'preparation' in text_lower:
            return 'Lower Division'
        elif 'upper' in text_lower or 'upper-division' in text_lower:
            return 'Upper Division'
        elif 'elective' in text_lower:
            return 'Elective'
        elif 'honors' in text_lower:
            return 'Honors'
        elif 'capstone' in text_lower:
            return 'Capstone'
        else:
            return 'Required'
    
    def _extract_courses_from_text(self, text, course_pattern):
        """Extract course codes and descriptions from text"""
        courses = []
        seen_codes = set()
        
        # Split by lines and process each
        for line in text.split('\n'):
            line = line.strip()
            if not line:
                continue
            
            match = course_pattern.search(line)
            
            if match:
                code = match.group(1).strip()
                
                # Filter out false positives
                if re.match(r'^\d{3}', code) and len(code) <= 6:
                    continue
                if 'TTY' in code and len(code) < 10:
                    continue
                
                # Skip if we've seen this code already
                if code in seen_codes:
                    continue
                seen_codes.add(code)
                
                # Get description
                description = ''
                if match.lastindex >= 2 and match.group(2):
                    description = match.group(2).strip()
                else:
                    code_end = line.find(code) + len(code)
                    remaining = line[code_end:].strip()
                    remaining = re.sub(r'^[-–—,.]\s*', '', remaining)
                    description = remaining
                
                # Clean up description
                description = re.sub(r'\(.*?units?.*?\)', '', description, flags=re.I).strip()
                description = re.sub(r'\s+', ' ', description)
                
                # Extract units if present
                units_match = re.search(r'\((\d+(?:\.\d+)?)\s*(?:units?|unit)', line, re.I)
                if not units_match:
                    units_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:units?|unit)', line, re.I)
                units = float(units_match.group(1)) if units_match else 4.0
                
                courses.append({
                    'code': code,
                    'description': description[:200] if description else '',
                    'units': units
                })
        
        return courses
    
    def scrape_major(self, major_name="African American Studies"):
        """Main method to scrape a major's requirements"""
        try:
            print(f"Starting scrape for: {major_name}")
            self.search_major(major_name)
            requirements = self.extract_requirements()
            return requirements
        except Exception as e:
            print(f"Error during scraping: {str(e)}")
            raise
        finally:
            self.close()
    
    def close(self):
        """Close the browser"""
        if self.driver:
            self.driver.quit()


def main():
    """Main function to run the scraper"""
    scraper = UCLACatalogScraper(headless=False)  # Set to True for headless mode
    
    try:
        # Scrape African American Studies
        requirements = scraper.scrape_major("African American Studies")
        
        # Print results
        print("\n" + "="*50)
        print("SCRAPING RESULTS")
        print("="*50)
        print(json.dumps(requirements, indent=2))
        
        # Save to JSON file
        output_file = "output/african_american_studies_requirements.json"
        import os
        os.makedirs("output", exist_ok=True)
        with open(output_file, 'w') as f:
            json.dump(requirements, f, indent=2)
        print(f"\nResults saved to {output_file}")
        
    except Exception as e:
        print(f"Scraping failed: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()

