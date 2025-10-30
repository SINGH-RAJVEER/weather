import csv

class TwitterScraperPipeline:

    def open_spider(self, spider):
        self.file = open('tweets.csv', 'w', newline='', encoding='utf-8')
        self.writer = csv.writer(self.file)
        self.writer.writerow(['headline'])

    def close_spider(self, spider):
        self.file.close()

    def process_item(self, item, spider):
        self.writer.writerow([item['headline']])
        return item
