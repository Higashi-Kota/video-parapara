---
paths: packages/**/*.stories.tsx, apps/**/*.stories.tsx
---

# Storybook Rules

## Required Skills

When writing Storybook stories, invoke these skills:

1. **`storybook`** - CSF3 patterns, showcase stories, play functions
2. **`testing`** - Test placement decisions

## Story Patterns

- Use **showcase stories** (one story showing all variants in a grid)
- Avoid one-story-per-variant anti-pattern
- Use `argTypes` for interactive exploration, not documentation
- Add **play functions** for interaction and a11y verification
- Query by role (`getByRole`) not by test-id

## A11y Verification

Include play functions that verify:
- `aria-label` / `aria-labelledby`
- `aria-expanded`, `aria-pressed`, `aria-selected`
- Focus management and keyboard navigation

## Portable Stories + vitest-axe

Reuse Storybook stories with vitest-axe for a11y validation:

```tsx
import { composeStories } from "@storybook/react"
import { axe } from "vitest-axe"
import * as stories from "./Component.stories"

const { Default } = composeStories(stories)

test("axe-core check", async () => {
  const { container } = render(<Default />)
  expect(await axe(container)).toHaveNoViolations()
})
```
