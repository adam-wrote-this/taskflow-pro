# E2E test notes

## Optional authenticated flow

The file authenticated-dashboard.spec.ts will run only when both environment variables are set:

- E2E_USER_EMAIL
- E2E_USER_PASSWORD

If either variable is missing, the test is skipped automatically.

## Optional write flows

The team creation flow writes data and runs only when this variable is set:

- E2E_ENABLE_WRITE_TESTS=1

## Example (PowerShell)

$env:E2E_USER_EMAIL="your-test-user@example.com"
$env:E2E_USER_PASSWORD="your-password"
$env:E2E_ENABLE_WRITE_TESTS="1"
pnpm run test:e2e
