import { WebCrawler } from "./WebCrawler";

export class WebsiteAScraper extends WebCrawler {
  async run() {}
}

(async () => {
  if (require.main === module) {
    const scraper = new WebsiteAScraper();
    await scraper.run();
  }
})();
