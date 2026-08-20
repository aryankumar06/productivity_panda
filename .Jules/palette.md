## 2024-05-15 - Explicit Context in Data Grid Checkboxes
**Learning:** Checkboxes within a data grid without explicit context in their aria-label can be confusing for screen reader users as they lack spatial context.
**Action:** When using checkboxes within a data grid, always provide explicit row and column context in the aria-label (e.g., `aria-label="Toggle [Row] on [Column]"`) so screen readers can announce the context.

## 2026-06-08 - Explicit Context for Icon-Only Action Buttons in Lists
**Learning:** Icon-only action buttons (like Delete) in nested lists or trees without the item's context in the aria-label are ambiguous to screen reader users.
**Action:** When adding icon-only action buttons to items in lists, always include the specific item's title in the `aria-label` (e.g., `aria-label="Delete task: [Task Title]"`) to provide explicit context.
## 2024-05-18 - Explicit Accessible View Toggles and Form Disclosures
**Learning:** Toggle button groups and expandable forms need proper ARIA associations to be fully usable by screen readers.
**Action:** When implementing view toggles (e.g., list/plan modes), wrap them in a container with `role="group"` and `aria-label`, and use `aria-pressed` on the buttons. For expand/collapse buttons (like "Add Task"), use `aria-expanded` and link them to the target element's ID using `aria-controls`. Ensure clear visual focus indicators using `focus-visible`.
