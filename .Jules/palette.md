## 2024-05-15 - Explicit Context in Data Grid Checkboxes
**Learning:** Checkboxes within a data grid without explicit context in their aria-label can be confusing for screen reader users as they lack spatial context.
**Action:** When using checkboxes within a data grid, always provide explicit row and column context in the aria-label (e.g., `aria-label="Toggle [Row] on [Column]"`) so screen readers can announce the context.

## 2026-06-08 - Explicit Context for Icon-Only Action Buttons in Lists
**Learning:** Icon-only action buttons (like Delete) in nested lists or trees without the item's context in the aria-label are ambiguous to screen reader users.
**Action:** When adding icon-only action buttons to items in lists, always include the specific item's title in the `aria-label` (e.g., `aria-label="Delete task: [Task Title]"`) to provide explicit context.

## 2024-11-20 - Accessible Collapsible Sections and Button Groups
**Learning:** Collapsible sections toggled by buttons without `aria-expanded` and `aria-controls`, and mutually exclusive button groups without `role="group"` and `aria-pressed`, cause confusion for screen reader users by hiding the relationship between elements and their current states.
**Action:** When building collapsible sections, always use `aria-expanded` on the trigger button and `aria-controls` pointing to the controlled element's `id`. For mutually exclusive button groups, use `role="group"` on the container and `aria-pressed` on the individual buttons to indicate state.
