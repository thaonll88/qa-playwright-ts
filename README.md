# qa-playwright-ts

A test automation suite for the [DemoQA Book Store](https://demoqa.com) application, covering both UI (end-to-end) and API tests using Playwright and TypeScript.

## Tech Stack

- **[Playwright](https://playwright.dev/)** — UI and API testing framework
- **TypeScript** — strict mode enabled throughout
- **Allure** — rich HTML test reporting
- **dotenv** — environment variable management
- **GitHub Actions** — CI/CD pipeline

## Project Structure

```
├── pages/               # Page Object Model classes
├── tests/
│   ├── ui/              # End-to-end browser tests
│   └── api/             # API tests
├── helpers/
│   ├── api.helper.ts    # API request wrappers
│   └── test-data.helper.ts
├── types/
│   └── api.types.ts     # Request/response type definitions
├── playwright.config.ts
└── swagger.json         # API reference documentation
```

## Setup

**Prerequisites:** Node.js 24+

```bash
npm ci
npx playwright install --with-deps
```

**Environment variables** — create a `.env` file in the project root:

```
TEST_USERNAME=your_username
TEST_PASSWORD=your_password
TEST_USER_ID=your_user_uuid
```

## Running Tests

| Command | Description |
|---|---|
| `npm test` | Run all tests (UI + API) |
| `npm run test:api` | API tests only |
| `npm run test:ui:chromium` | UI tests on Chromium |
| `npm run test:ui:firefox` | UI tests on Firefox |

## Reporting

Tests produce an HTML report automatically. To generate and view an Allure report:

```bash
npm run allure:generate
npm run allure:open
```

## CI/CD

Tests run automatically on push and pull requests to `main`/`master` via GitHub Actions. The HTML report is uploaded as an artifact with a 30-day retention period. Environment variables are supplied via repository secrets.

## Test Coverage

**UI tests** (`tests/ui/`)
- Login — valid/invalid credentials, empty field validation
- Profile — username display, books table, logout
- Book Store — navigation, search

**API tests** (`tests/api/`)
- Account — registration, authorization, token generation, get/delete user
- Book Store — list books, get by ISBN, add/replace/delete books, auth enforcement
