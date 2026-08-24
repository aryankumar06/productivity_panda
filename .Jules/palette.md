## 2024-05-15 - Explicit Context in Data Grid Checkboxes
**Learning:** Checkboxes within a data grid without explicit context in their aria-label can be confusing for screen reader users as they lack spatial context.
**Action:** When using checkboxes within a data grid, always provide explicit row and column context in the aria-label (e.g., `aria-label="Toggle [Row] on [Column]"`) so screen readers can announce the context.

## 2026-06-08 - Explicit Context for Icon-Only Action Buttons in Lists
**Learning:** Icon-only action buttons (like Delete) in nested lists or trees without the item's context in the aria-label are ambiguous to screen reader users.
**Action:** When adding icon-only action buttons to items in lists, always include the specific item's title in the `aria-label` (e.g., `aria-label="Delete task: [Task Title]"`) to provide explicit context.
## 2024-05-30 - View Mode Toggle Button Group Accessibility
**Learning:** When implementing custom button groups for toggle selectors (like List vs Plan view), screen readers need structural grouping context and state indication, not just visual styling. While role="radio" can be used within a radiogroup, a simpler and robust alternative for dual-toggle buttons without complex arrow key navigation handlers is standard buttons with aria-pressed within a role="group" container.
**Action:** Always add role="group" with an aria-label to the container of mutually exclusive view toggles, and use aria-pressed={boolean} on the individual standard buttons instead of complex radio roles unless fully implementing keyboard arrow navigation.
