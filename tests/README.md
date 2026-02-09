# Playwright Tests

This directory contains automated tests for the Student Management application using Playwright.

## Test Files

- `signup.spec.js` - Tests the teacher signup flow including:
  - Form validation
  - Wrong teacher access code error handling
  - Correct access code validation
  - Password mismatch validation

## Running Tests

### Run all tests (headless)
```bash
npm run test
```

### Run tests with UI (watch the robot click buttons)
```bash
npm run test:ui
```

### Run tests in headed mode (visible browser)
```bash
npm run test:headed
```

### Debug tests
```bash
npm run test:debug
```

## Test Configuration

The Playwright configuration is in `playwright.config.js` and includes:
- Tests run against `http://localhost:3000`
- Supports Chrome, Firefox, and Safari
- Automatic dev server startup
- HTML test reporter
- Retry on CI

## Environment Setup

Make sure you have:
1. Node.js installed
2. The dev dependencies installed (`npm install`)
3. Playwright browsers installed (`npx playwright install`)

## Test Data

The tests use the teacher access code from your `.env.example` file. Make sure your actual environment has the correct `TEACHER_ACCESS_CODE` set for the tests to work properly.
