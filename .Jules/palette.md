## 2024-05-15 - Explicit Context in Data Grid Checkboxes
**Learning:** Checkboxes within a data grid without explicit context in their aria-label can be confusing for screen reader users as they lack spatial context.
**Action:** When using checkboxes within a data grid, always provide explicit row and column context in the aria-label (e.g., `aria-label="Toggle [Row] on [Column]"`) so screen readers can announce the context.

## 2026-06-08 - Explicit Context for Icon-Only Action Buttons in Lists
**Learning:** Icon-only action buttons (like Delete) in nested lists or trees without the item's context in the aria-label are ambiguous to screen reader users.
**Action:** When adding icon-only action buttons to items in lists, always include the specific item's title in the `aria-label` (e.g., `aria-label="Delete task: [Task Title]"`) to provide explicit context.
## 2024-08-10 - ARIA Expanded and Controls for Dynamic Forms
**Learning:** Collapsible forms toggled via buttons (e.g., "Add Task", "New Habit") need explicit semantic linkage so screen readers can announce state changes.
**Action:** Always add `aria-expanded={state}` and `aria-controls="form-id"` to toggle buttons, and apply the corresponding `id="form-id"` to the form container.
