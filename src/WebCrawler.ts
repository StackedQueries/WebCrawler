import puppeteer, {
  Browser,
  Page,
  WaitForNetworkIdleOptions,
  HTTPResponse,
  LaunchOptions,
  GoToOptions,
  PuppeteerLifeCycleEvent,
} from "puppeteer";
import assert from "assert";
import { load, CheerioAPI } from "cheerio";
import fse from "fs-extra";

type Config = {
  headless: Boolean | String;
  pipe: Boolean;
  args: Array<String>;
};

const defaultConfig: Config = {
  headless: "new",
  pipe: true,
  args: [
    "--disable-extensions",
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-gpu",
    "--disable-dev-shm-usage",
  ],
};

export class WebCrawler {
  config: Config;
  browser?: Browser;
  page?: Page; // scraper assumes we only want one tab.

  blockedRequestCount: number = 0; // count for how useful the resource blocker is

  workerName = "WebCrawler";

  // scraped data store. Holds onto already saved data incase of failure
  // also used in exportData
  scrapedData?: any;

  constructor(config: Config = defaultConfig) {
    this.config = config;
  }

  // checks to make sure browser and page are running, will cleanly error
  requiresBrowser() {
    assert(this.browser instanceof Browser, "Browser has not started up!");
    assert(this.page instanceof Page, "Page has not started up!");
  }

  // opens browser & page
  async openBrowser() {
    this.browser = await puppeteer.launch(this.config as LaunchOptions);
    this.page = await this.browser.newPage();
  }

  // navigates to page
  async goToPageUrl(
    url: string,
    options: GoToOptions = {}
  ): Promise<HTTPResponse> {
    this.requiresBrowser();
    const response = await this.page?.goto(url, options);

    // checks if response is 200s
    // could be more robust and recover in terms of bot detection
    if (!response?.ok()) {
      throw new Error("GoTo Failed!");
    }

    return response;
  }

  // function planned to take in intial load data
  // could check nessacary data such as IP, browser stats, etc
  // for this, just launch and nav to default nav url
  async initialize(
    url: string,
    { waitUntil } = { waitUntil: "load" }
  ): Promise<HTTPResponse> {
    await this.openBrowser();

    // Caused some issues with newsweek
    //this.enableResourceBlockers();

    return await this.goToPageUrl(url, {
      waitUntil: waitUntil as PuppeteerLifeCycleEvent,
    });
  }

  enableResourceBlockers() {
    this.requiresBrowser();
    this.page?.setRequestInterception(true);
    this.page?.on("request", (request) => {
      if (
        ["stylesheet", "media", "font", "texttrack"].includes(
          request.resourceType()
        )
      ) {
        ++this.blockedRequestCount;
        request.abort();
      } else {
        request.continue();
      }
    });
  }

  // use Cheerio to parse the page
  // Better parsing util than puppeteer imo
  async parsePage(): Promise<CheerioAPI> {
    this.requiresBrowser();
    const html: string | undefined = await this.page?.content();

    assert(
      typeof html === "string",
      `Page contents invalid, typeof ${typeof html}`
    );

    return load(html);
  }

  // waits for networkidle 0, useful for page nav clicks
  async waitForLoad(
    options: WaitForNetworkIdleOptions = { concurrency: 0, idleTime: 1000 }
  ) {
    this.requiresBrowser();
    await this.page?.waitForNetworkIdle(options);
  }

  // basic logger with job name, timestamp, and message
  log(message: any) {
    // if message object includes nested object: spread the message
    // prevents {message: {message: {}}}
    if (message["message"]?.length) {
      console.log({
        ...message,
        workerName: this.workerName,
        timestamp: Date.now(),
      });
    } else {
      console.log({
        workerName: this.workerName,
        timestamp: Date.now(),
        message,
      });
    }
  }

  // save data in ./exported
  async exportData() {
    return await fse.outputFile(
      `exported/${this.workerName}/${Date.now()}.json`,
      JSON.stringify(this.scrapedData, null, 4)
    );
  }

  // robust close handler
  async closeBrowser() {
    try {
      await this.page?.close();
    } catch (err) {
      console.error({
        message: "Page Failed to close!",
        err,
      });
    }

    try {
      await this.browser?.close();
    } catch (err) {
      console.error({
        message: "Browser Failed to close!",
        err,
      });
    }

    this.log({
      message: "Browser closed",
      blockedRequestCount: this.blockedRequestCount,
    });
    this.blockedRequestCount = 0;
  }
}
