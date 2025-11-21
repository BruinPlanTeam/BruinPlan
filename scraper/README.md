# UCLA Catalog Scraper

This directory contains a web scraper that extracts major requirements from the UCLA course catalog.

## Setup

### 1. Install Python Dependencies

```bash
cd scraper
pip install -r requirements.txt
```

### 2. Install Chrome/Chromium

The scraper uses Selenium with Chrome. Make sure you have Chrome or Chromium installed on your system.

## Usage

### Step 1: Run the Scraper

```bash
python ucla_catalog_scraper.py
```

By default, this scrapes African American Studies and saves the output to `output/african_american_studies_requirements.json`.

To scrape a different major, modify the `main()` function in `ucla_catalog_scraper.py`:

```python
# Change this line in main():
requirements = scraper.scrape_major("Computer Science")  # or any other major name
```

### Step 2: Import Data into Database

After scraping, import the data into your database using the Node.js import script:

```bash
cd ../server
node scripts/importMajorData.js ../scraper/output/african_american_studies_requirements.json
```

## Output Format

The scraper produces JSON files with the following structure:

```json
{
  "major_name": "African American Studies, B.A.",
  "school": "College of Letters and Science",
  "requirements": [
    {
      "name": "Preparation for the Major",
      "type": "Lower Division",
      "coursesToChoose": 2,
      "classes": [
        {
          "code": "AF AM 1",
          "description": "Introduction to African American Studies",
          "units": 4.0
        }
      ]
    }
  ],
  "requirementGroups": []
}
```

## Supported Majors

The scraper can handle most UCLA majors. You may need to add mappings in the `_convert_to_catalog_slug()` method for specific majors.

Currently mapped:
- African American Studies
- Computer Science

## Customization

### Adding Major Mappings

Edit the `major_mapping` dictionary in `_convert_to_catalog_slug()`:

```python
major_mapping = {
    "african american studies": "AfricanAmericanStudiesBA",
    "computer science": "ComputerScienceBS",
    "your major name": "YourMajorNameBA",  # Add here
}
```

### Headless Mode

To run the scraper without opening a browser window:

```python
scraper = UCLACatalogScraper(headless=True)
```

## Troubleshooting

### ChromeDriver Issues

If you get errors about ChromeDriver:

1. Make sure Chrome is installed
2. The `webdriver-manager` package should auto-download the correct driver
3. If that fails, manually download ChromeDriver from https://chromedriver.chromium.org/

### Page Not Loading

If the scraper can't find a major:

1. Check the major name spelling
2. Add a mapping in `_convert_to_catalog_slug()`
3. Visit https://catalog.registrar.ucla.edu/ to find the correct URL format

### Missing Classes

If some classes aren't being extracted:

1. Check the course code pattern in `extract_requirements()`
2. The pattern may need adjustment for specific course formats
3. Run with `headless=False` to see what the scraper is seeing

## Notes

- The scraper respects UCLA's robots.txt
- Be mindful of rate limiting when scraping multiple majors
- Data should be verified against official UCLA sources
- Prerequisites are not automatically extracted by this scraper (requires additional implementation)

