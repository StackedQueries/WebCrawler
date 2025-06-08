# WebCrawler

Webscraper built to scrape details off of Newsweek and Puma and store to JSON.
Built with Typescript and puppeteer

## Usage

```bash
pnpm i
pnpm run dev
```

JSON data exported to:

```bash
./exported/{Scraper Type}/{Current Timestamp}.JSON
```

### Examples

Puma:

```JSON
{
    "title": "Shop All Sale | PUMA",
    "products": [
        {
            "name": "AmplifierCool Light Gray-Cool Dark Gray-PUMA Black",
            "price": "$50.99"
        },
        {
            "name": "Cool Cat 2.0PUMA Black-PUMA White",
            "price": "$20.99"
        }
    ]
}
```

NewsWeek:

```JSON
{
    "title": "How rising US national debt impacts the average American",
    "author": "Suzanne Blake  Suzanne Blake",
    "commentCount": "9"
}
```

## Improvements todo

- Clustering for scaling
  - Containerization
- Message Queue for getting jobs into workers
  - instead of Promise.all the available scrapers
  - powered by cron/scheduler/api
- DB
  - store data/jobs in DB
- Webhooks
  - Tooling to deliever to to third party resources
- Proxy, Adblock, CAPTCHA, browser tech
- Terraform resources
- github actions
- error recovery
