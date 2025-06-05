import { WebCrawler } from "./WebCrawler";
const startUrl =
  "https://us.puma.com/us/en/sale/all-sale?pref_gender=Men%2CUnisex&pref_ageGroup=Adults";

class WebsiteBScraper extends WebCrawler {
  async run() {
    console.log("running");
    await this.initialize(startUrl);
    console.log("page loaded");
  }
}

(async () => {
  console.log("running");
  if (require.main === module) {
    const scraper = new WebsiteBScraper();
    await scraper.run();
  }
})();
