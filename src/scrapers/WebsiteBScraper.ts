import { WebCrawler } from "../WebCrawler";
import assert from "assert";
const startUrl = "https://www.newsweek.com/personal-finance";

// Author of the latest blog post
// Title of the latest blog post
// Number of comments on the post

export class WebsiteBScraper extends WebCrawler {
  workerName = "NewsWeekScraper";

  async run() {
    // start browser
    await this.initialize(startUrl, { waitUntil: "domcontentloaded" });

    // get link
    const firstPage = await this.page?.$$("h3 > a");

    // validate data
    assert(this.page);
    assert(
      firstPage && firstPage.length,
      "Page load Failed! No article detected"
    );

    // go to page
    await this.goToPageUrl(await firstPage[0].evaluate((e) => e.href), {
      waitUntil: "networkidle2",
    });

    // scroll activated load state
    await Promise.all([
      this.page.waitForSelector(".vf-badge"),
      this.page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
      }),
    ]);

    // cache all data with cheerio
    const $ = await this.parsePage();

    // check if the element exists
    assert($("vf-badge > span"));

    // save data
    this.scrapedData = {
      title: $("h1").text().trim(),
      author: $(".author > a").text().trim(),
      commentCount: $(".vf-badge > span").text().trim(),
    };

    this.log("Extracted article data");
    await this.closeBrowser();

    return true;
  }
}

(async () => {
  if (require.main === module) {
    const scraper = new WebsiteBScraper();
    await scraper.run();
  }
})();
