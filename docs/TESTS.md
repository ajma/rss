# Testing Documentation

## Overview

This project uses [Vitest](https://vitest.dev/) as the test runner for both backend and frontend tests.

## Running Tests

```bash
# Run all tests (both server and web)
npm test

# Run server tests only
npm test --workspace=server

# Run web tests only
npm test --workspace=web

# Watch mode (server)
npm run test:watch --workspace=server

# Watch mode (web)
npm run test:watch --workspace=web
```

## Test Suites

### Backend (`server/src/__tests__/`)

| File | Description |
|------|-------------|
| `auth.test.ts` | Tests auth validation schemas (email format, password length) and JWT token generation/verification |
| `feeds.test.ts` | Tests feed URL validation and favicon URL generation from site URLs |
| `articles.test.ts` | Tests HTML-to-snippet conversion (tag stripping, truncation, whitespace collapsing) and time-ago date formatting |
| `auth.helpers.ts` | Shared test utilities: exported Zod schemas and JWT helper functions |

### Frontend (`web/src/__tests__/`)

| File | Description |
|------|-------------|
| `FeedSidebar.test.ts` | Tests unread count calculation, large-count formatting (999+), folder expansion toggle, and root feed filtering |
| `ArticleList.test.ts` | Tests expand/collapse all logic, single article toggle, and query parameter building for different view modes (feed, folder, saved, search) |

## Test Architecture

- **Unit tests** focus on pure business logic functions (validation, formatting, calculations)
- **Prisma** is mocked in backend tests to avoid database dependencies
- **Vitest** is configured in both workspaces via their respective `package.json` scripts
