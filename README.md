# qa-playwright-ts

A test automation suite for the [DemoQA Book Store](https://demoqa.com) application, covering UI (end-to-end) and API tests using Playwright and TypeScript, with load and performance tests using K6.

## Tech Stack

- **[Playwright](https://playwright.dev/)** — UI and API testing framework
- **TypeScript** — strict mode enabled throughout
- **[K6](https://k6.io/)** — load and performance testing
- **Allure** — rich HTML test reporting
- **dotenv** — environment variable management
- **GitHub Actions** — CI/CD pipeline

## Project Structure

```
├── k6/                  # K6 performance test scripts
│   ├── config.js        # Shared options and thresholds
│   ├── load-test-auth.js
│   ├── load-test-bookstore.js
│   ├── stress-test-auth.js
│   └── spike-test-auth.js
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

### Playwright

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

### K6

**Prerequisites:** [Install K6](https://k6.io/docs/get-started/installation/)

**Environment variables** — create a `k6/.env.k6` file (gitignored):

```
export K6_USERNAME=your_username
export K6_PASSWORD=your_password
export K6_USER_ID=your_user_uuid
```

## Running Tests

### Playwright

| Command | Description |
|---|---|
| `npm test` | Run all tests (UI + API) |
| `npm run test:api` | API tests only |
| `npm run test:ui:chromium` | UI tests on Chromium |
| `npm run test:ui:firefox` | UI tests on Firefox |

### K6 Performance Tests

K6 tests are run locally only and are not part of the CI/CD pipeline, to avoid overloading the shared demo infrastructure.

```bash
source k6/.env.k6  # load env vars (required once per terminal session)
```

| Command | Description |
|---|---|
| `k6 run k6/load-test-auth.js` | Load test — auth endpoints (10 VUs, 30s) |
| `k6 run k6/load-test-bookstore.js` | Load test — bookstore flow (3 VUs, 30s) |
| `k6 run k6/stress-test-auth.js` | Stress test — auth endpoints (up to 20 VUs, 2m) |
| `k6 run k6/spike-test-auth.js` | Spike test — auth endpoints (spike to 20 VUs) |

| File | Type | VUs | Duration | Endpoints |
|---|---|---|---|---|
| `load-test-auth.js` | Load | 10 | 30s | `/GenerateToken` |
| `load-test-bookstore.js` | Load | 3 | 30s | `/Books`, `/User` |
| `stress-test-auth.js` | Stress | up to 20 | 2m | `/GenerateToken` |
| `spike-test-auth.js` | Spike | spike to 20 | 40s | `/GenerateToken` |

> **Note:** Stress and spike tests are limited to auth endpoints to avoid overloading shared demo infrastructure.

## Reporting

Tests produce an HTML report automatically. To generate and view an Allure report:

```bash
npm run allure:generate
npm run allure:open
```

## CI/CD

Playwright tests run automatically on push and pull requests to `main`/`master` via GitHub Actions. The HTML report is uploaded as an artifact with a 30-day retention period. Environment variables are supplied via repository secrets.

K6 performance tests are excluded from CI/CD and are intended to be run manually against a dedicated environment.

## Test Coverage

**UI tests** (`tests/ui/`)
- Login — valid/invalid credentials, empty field validation
- Profile — username display, books table, logout
- Book Store — navigation, search

**API tests** (`tests/api/`)
- Account — registration, authorization, token generation, get/delete user
- Book Store — list books, get by ISBN, add/replace/delete books, auth enforcement

**Performance tests** (`k6/`)
- Load test — auth and bookstore flows under normal traffic
- Stress test — auth endpoints under increasing load
- Spike test — auth endpoints under sudden traffic surge