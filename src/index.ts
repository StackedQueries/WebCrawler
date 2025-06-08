import * as scrapers from "./scrapers";

async function retryScraperOnFail(
  scraper: any,
  attempts: number = 3
): Promise<Boolean> {
  if (attempts >= 0) {
    try {
      return await scraper.run();
    } catch (err) {
      await scraper.closeBrowser();
      scraper.log({
        message: "Job Failed; Retrying...",
        err,
        attempts,
      });
      return await retryScraperOnFail(scraper, --attempts);
    }
  }
  throw new Error(`${scraper.workerName} failed retries`);
}

(async () => {
  Promise.all(
    // Pulls all scrapers from ./scrapers and executes them all at once
    Object.values(scrapers).map(async (Scraper, c) => {
      // init all scrapers
      let scraper = new Scraper();

      scraper.log({
        message: "Starting Job",
      });
      // failure retry; not robust
      await retryScraperOnFail(scraper);

      //export to ./exported
      await scraper.exportData();

      scraper.log({
        message: "Data Exported; Job Done",
      });
    })
  );
})();
