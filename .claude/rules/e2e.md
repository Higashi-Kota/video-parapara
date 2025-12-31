---
paths: apps/**/e2e/**/*.ts, apps/**/e2e/**/*.spec.ts
---

# E2E Test Rules

## Required Skills

When writing E2E tests, invoke these skills:

1. **`e2e`** - Playwright patterns, Page Object Model
2. **`testing`** - Test pyramid, avoid duplication with unit tests

## E2E Test Selection (Testing Trophy)

**E2E for critical paths (happy paths) only:**
- Authentication/authorization flows
- Multi-page navigation
- Data persistence verification (OPFS, etc.)

**Move to Vitest/Storybook:**
- Individual component variations
- Form validation
- Detailed keyboard navigation
- ARIA attribute verification

## Patterns

- Use fixtures for app initialization (navigation, waitForApp)
- Query by role (`getByRole`) for a11y-friendly selectors
- **Avoid per-test timeout specs** - use global settings in playwright.config.ts

## Timeout Configuration

```typescript
// ❌ BAD
await expect(item).toBeVisible({ timeout: 5000 })

// ✅ GOOD
await expect(item).toBeVisible()
```

Manage timeouts centrally via `expect.timeout` and `actionTimeout` in playwright.config.ts.
