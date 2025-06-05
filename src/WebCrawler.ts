import puppeteer, {
  Browser,
  Page,
  WaitForNetworkIdleOptions,
  HTTPResponse,
  LaunchOptions,
} from "puppeteer";
import { NavError } from "./errors";

type Config = {
  headless: Boolean;
  pipe: Boolean;
  executablePath: String;
  args: Array<String>;
};

const defaultConfig: Config = {
  headless: false,
  pipe: true,
  executablePath: puppeteer.executablePath(),
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
  browser: Browser | null = null;
  page: Page | null = null; // scraper assumes we only want one tab.

  constructor(config: Config = defaultConfig) {
    this.config = config;
  }

  async openBrowser() {
    console.log("test");
    this.browser = await puppeteer.launch(this.config as LaunchOptions);
    console.log(this.browser);
    this.page = await this.browser.newPage();

    console.log("test2");
  }

  async goToPageUrl(url: string): Promise<HTTPResponse> {
    const response = await this.page.goto(url);

    if (!response?.ok()) {
      throw new NavError({ message: "GoTo Failed!", url, response });
    }

    return response;
  }

  async initialize(url: string): Promise<HTTPResponse> {
    // function planned to take in intial load data
    // could check nessacary data such as IP, browser stats, etc
    // for this, just launch and nav to default nav url

    await this.openBrowser();
    return await this.goToPageUrl(url);
  }

  async waitForLoad(
    options: WaitForNetworkIdleOptions = { concurrency: 0, idleTime: 1000 }
  ) {
    await this.page.waitForNetworkIdle(options);
  }

  async closeBrowser() {
    try {
      await this.page.close();
    } catch (err) {
      console.error({
        message: "Page Failed to close!",
        err,
      });
    }

    try {
      await this.browser.close();
    } catch (err) {
      console.error({
        message: "Browser Failed to close!",
        err,
      });
    }
  }
}
