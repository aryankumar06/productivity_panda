## 2024-05-15 - Explicit Context in Data Grid Checkboxes
**Learning:** Checkboxes within a data grid without explicit context in their aria-label can be confusing for screen reader users as they lack spatial context.
**Action:** When using checkboxes within a data grid, always provide explicit row and column context in the aria-label (e.g., `aria-label="Toggle [Row] on [Column]"`) so screen readers can announce the context.

## 2026-06-08 - Explicit Context for Icon-Only Action Buttons in Lists
**Learning:** Icon-only action buttons (like Delete) in nested lists or trees without the item's context in the aria-label are ambiguous to screen reader users.
**Action:** When adding icon-only action buttons to items in lists, always include the specific item's title in the `aria-label` (e.g., `aria-label="Delete task: [Task Title]"`) to provide explicit context.
## 2024-05-18 - Task View Mode Toggles Lack Accessibility Context
**Learning:** Custom button groups that function as mutually exclusive selectors (like a "List" vs "Plan" view mode toggle) need specific ARIA roles (`role="group"`) and states (`aria-pressed`) to be understood correctly by screen readers. Furthermore, interactive buttons should use `type="button"` to avoid unintended native form submissions when used nearby or inside forms, and require explicit focus states (`focus-visible`) for keyboard navigability.
**Action:** When implementing custom toggle button groups, use `role="group"` on the container with an `aria-label`, set `type="button"` and `aria-pressed={isActive}` on individual buttons, and utilize `focus-visible:ring-2` (or equivalent) for keyboard focus indicators.
