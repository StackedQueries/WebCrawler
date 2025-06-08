import { WebCrawler } from "../WebCrawler";
const startUrl =
  "https://us.puma.com/us/en/sale/all-sale?pref_gender=Men%2CUnisex&pref_ageGroup=Adults";

//Title of the current page
//List of product names on the page
//Price of each product

type Product = {
  name: String;
  price: String;
};

export class WebsiteAScraper extends WebCrawler {
  workerName = "PumaScraper";
  productData: Array<Product> = [];
  title: String | undefined;

  async run(): Promise<Boolean> {
    await this.initialize(startUrl);

    const $ = await this.parsePage();

    // get product data
    $("#product-list-items > li").each((_, e) => {
      this.productData.push({
        name: $(e).find("h3").text().trim(),
        price: $(e).find('span[data-test-id="sale-price"]').text().trim(),
      });
    });

    // get Page Title
    this.title = $("title").text().trim();

    await this.closeBrowser();

    this.scrapedData = {
      title: this.title,
      products: this.productData,
    };

    this.log(`Extracted ${this.productData.length} products`);

    return true;
  }
}

(async () => {
  if (require.main === module) {
    const scraper = new WebsiteAScraper();
    await scraper.run();
  }
})();
