from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from scrapy.selector import Selector
import time
import random
import undetected_chromedriver as uc
import os
import ssl


class XcancelScraper:
    CSS_SEARCH_INPUT = 'div.search-bar input[placeholder="Search..."]'
    CSS_SEARCH_BTN = 'div.search-bar form button'
    CSS_ARTICLE = 'div.timeline-item'
    CSS_TWEET_TEXT = 'div.timeline-item div.tweet-content.media-body'
    CSS_TWEET_FALLBACK = 'span'

    def human_typing(self, element, text, min_delay=0.1, max_delay=0.3):

        for char in text:
            element.send_keys(char)
            delay = random.uniform(min_delay, max_delay)
            time.sleep(delay)

    def __init__(self):
        options = uc.ChromeOptions()

        options.add_argument("--headless")
        options.add_argument("--disable-gpu")
        options.add_argument("--no-sandbox")
        options.add_argument("--window-size=1920,1080")

        user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " \
                     "AppleWebKit/537.36 (KHTML, like Gecko) " \
                     "Chrome/140.0.7339.82 Safari/537.36"
        options.add_argument(f"--user-agent={user_agent}")

        profile_path = os.path.join(os.getcwd(), f"selenium_profile_{random.randint(1000,9999)}")
        options.add_argument(f"--user-data-dir={profile_path}")

        ssl._create_default_https_context = ssl._create_unverified_context
        self.driver = uc.Chrome(options=options)

    def search_and_extract(self, keyword):
        print(f"Searching for keyword: {keyword}")
        self.driver.get('https://xcancel.com/')
        time.sleep(random.uniform(3,6))
        try:
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, self.CSS_SEARCH_INPUT))
            )
            search_input = self.driver.find_element(By.CSS_SELECTOR, self.CSS_SEARCH_INPUT)
            search_input.clear()
            self.human_typing(search_input, keyword, 0.15, 0.4)
            search_btn = self.driver.find_element(By.CSS_SELECTOR, self.CSS_SEARCH_BTN)
            time.sleep(random.uniform(0.5, 1.5))
            search_btn.click()

            #Xcancel has a random wait screen sometimes so...
            time.sleep(10)

            try:
                WebDriverWait(self.driver, 30).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, self.CSS_TWEET_TEXT))
                )
            except Exception:
                WebDriverWait(self.driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, self.CSS_TWEET_FALLBACK))
                )

            sel = Selector(text=self.driver.page_source)
            tweet_elements = sel.css(self.CSS_TWEET_TEXT)
            tweet_texts = tweet_elements.xpath('text()').getall()

            print(f"Selector used: {self.CSS_TWEET_TEXT}, found {len(tweet_texts)} elements.")
            if not tweet_texts:
                tweet_elements = sel.css(self.CSS_TWEET_FALLBACK)
                tweet_texts = tweet_elements.xpath('text()').getall()
                print(f"Fallback selector used: {self.CSS_TWEET_FALLBACK}, found {len(tweet_texts)} elements.")

            top_5 = tweet_texts[:5]
            while len(top_5) < 5:
                top_5.append("")

            return [tweet.strip() for tweet in top_5]

        except Exception as e:
            print(f"Search failed for {keyword}: {e}")
            return [""] * 5

    def close(self):
        print("Closing the WebDriver.")
        self.driver.quit()
