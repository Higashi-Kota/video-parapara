---
paths: packages/**/*.test.ts, packages/**/*.test.tsx, apps/**/*.test.ts, apps/**/*.test.tsx
---

# Unit Test Rules

## Required Skills

When writing tests, invoke these skills:

1. **`testing`** - Vitest + Storybook strategy, test placement
2. **`type-patterns`** - Result types for testable logic

## Test Placement (Testing Trophy)

| Target | Location |
|--------|----------|
| Pure functions, utilities | Vitest (`*.test.ts`) |
| State management logic | Vitest (`*.test.ts`) |
| Component visual states | Storybook showcase stories |
| Component interactions | Storybook play functions |
| A11y compliance | Vitest + vitest-axe |
| Cross-page user flows | Playwright E2E (critical paths only) |

## Guidelines

- Test logic in Vitest, not UI rendering
- Use Storybook for UI state catalog and interaction tests
- Avoid testing implementation details
- Use vitest-axe + composeStories for component-level a11y testing
- E2E tests for happy paths only; detailed tests go to Vitest/Storybook
