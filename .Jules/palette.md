## 2024-05-15 - Explicit Context in Data Grid Checkboxes
**Learning:** Checkboxes within a data grid without explicit context in their aria-label can be confusing for screen reader users as they lack spatial context.
**Action:** When using checkboxes within a data grid, always provide explicit row and column context in the aria-label (e.g., `aria-label="Toggle [Row] on [Column]"`) so screen readers can announce the context.

## 2026-06-08 - Explicit Context for Icon-Only Action Buttons in Lists
**Learning:** Icon-only action buttons (like Delete) in nested lists or trees without the item's context in the aria-label are ambiguous to screen reader users.
**Action:** When adding icon-only action buttons to items in lists, always include the specific item's title in the `aria-label` (e.g., `aria-label="Delete task: [Task Title]"`) to provide explicit context.

## 2024-07-09 - Accessible tree navigation buttons
**Learning:** When adding icon-only action buttons (like Expand/Collapse) to items in nested lists or trees, it is necessary to include the specific item's title in the `aria-label` (e.g., `aria-label="Expand project: [Title]"`) to provide explicit context for screen readers.
**Action:** Always include the specific item's title in the `aria-label` of icon-only action buttons in nested lists or trees.
