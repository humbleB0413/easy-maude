# Easy MAUDE

**Easy MAUDE** is a free, browser-based search tool for the FDA MAUDE (Manufacturer and User Facility Device Experience) database — the U.S. FDA's medical device adverse event reporting system.

🌐 **[easymaude.com](https://easymaude.com)**

---

## What It Does

Searching the MAUDE database through the official FDA interface is cumbersome. Easy MAUDE provides a clean, fast search experience using a simple `tag:value` syntax — no Lucene query knowledge required.

```
brand:dexcom event:Malfunction
code:FRN date:20240101-20241231
manufacturer:medtronic | manufacturer:abbott
text:battery failure
```

Results load directly from the [OpenFDA public API](https://open.fda.gov/apis/device/event/) and are stored locally in your browser — no account, no server, no data collection.

---

## Key Features

- **Simple tag syntax** — search by brand, product code, manufacturer, model, event type, date, and more
- **Large dataset handling** — automatically splits date ranges to retrieve datasets of any size (100k+ records)
- **Excel export** — download results as `.xlsx` for further analysis
- **Search history** — all results cached locally in IndexedDB, revisit without re-running
- **Dark mode** — follows system preference, toggleable in settings
- **OpenFDA API key support** — optional, raises daily limit from 1,000 to 120,000 requests

---

## Search Tags

| Tag | Field | Example |
|-----|-------|---------|
| `brand` | Device brand name | `brand:dexcom` |
| `generic` | Generic device name | `generic:catheter` |
| `manufacturer` | Manufacturer name | `manufacturer:medtronic` |
| `model` | Model number | `model:G7` |
| `code` | FDA 3-letter product code | `code:FRN` |
| `udi` | UDI Device Identifier | `udi:00380740006547` |
| `event` | Event type (Malfunction/Injury/Death) | `event:Malfunction` |
| `date` | Date FDA received report (YYYYMMDD) | `date:20240101-20241231` |
| `event_date` | Date event occurred | `event_date:20231015-` |
| `text` | Full-text search in narratives | `text:battery failure` |
| `problem` | Product problem type | `problem:Leakage` |
| `reporter` | Reporter occupation code | `reporter:P` |
| `report` | MDR report key | `report:3014449-2024` |

---

## Tech Stack

- **React 19** + **Vite 8** — pure client-side SPA, no backend
- **IndexedDB** — local result caching and search history
- **OpenFDA API** — all data fetched directly from `api.fda.gov`
- **SheetJS** — Excel export
- **crypto-js** — AES-encrypted cookie storage for API key

---

## Development

```bash
npm install
npm run dev       # dev server with HMR
npm run build     # production build → dist/
npm run lint      # ESLint
npm run preview   # preview production build
```

No test framework configured.

---

## Data Source

All data is retrieved from the [OpenFDA Device Adverse Event API](https://open.fda.gov/apis/device/event/) operated by the U.S. Food & Drug Administration. Easy MAUDE is not affiliated with or endorsed by the FDA.

---

## Contact

[humbleb0413@gmail.com](mailto:humbleb0413@gmail.com)
