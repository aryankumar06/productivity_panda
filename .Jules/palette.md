## 2024-05-15 - Explicit Context in Data Grid Checkboxes
**Learning:** Checkboxes within a data grid without explicit context in their aria-label can be confusing for screen reader users as they lack spatial context.
**Action:** When using checkboxes within a data grid, always provide explicit row and column context in the aria-label (e.g., `aria-label="Toggle [Row] on [Column]"`) so screen readers can announce the context.

## 2026-06-08 - Explicit Context for Icon-Only Action Buttons in Lists
**Learning:** Icon-only action buttons (like Delete) in nested lists or trees without the item's context in the aria-label are ambiguous to screen reader users.
**Action:** When adding icon-only action buttons to items in lists, always include the specific item's title in the `aria-label` (e.g., `aria-label="Delete task: [Task Title]"`) to provide explicit context.

## 2024-07-30 - Custom Button Group Accessibility
**Learning:** Custom button groups that function as mutually exclusive selectors are not accessible by default. Screen readers won't know they belong together or which one is selected.
**Action:** Always use `role="group"` and `aria-labelledby` on the container of a custom button group, and add `aria-pressed` to indicate the selected state of the individual buttons. Additionally, ensure `type="button"` is present to avoid accidental form submissions.
