## 2024-05-15 - Explicit Context in Data Grid Checkboxes
**Learning:** Checkboxes within a data grid without explicit context in their aria-label can be confusing for screen reader users as they lack spatial context.
**Action:** When using checkboxes within a data grid, always provide explicit row and column context in the aria-label (e.g., `aria-label="Toggle [Row] on [Column]"`) so screen readers can announce the context.

## 2026-06-08 - Explicit Context for Icon-Only Action Buttons in Lists
**Learning:** Icon-only action buttons (like Delete) in nested lists or trees without the item's context in the aria-label are ambiguous to screen reader users.
**Action:** When adding icon-only action buttons to items in lists, always include the specific item's title in the `aria-label` (e.g., `aria-label="Delete task: [Task Title]"`) to provide explicit context.
## 2024-05-14 - Accessible Radio Button Replacements
**Learning:** For custom button groups that function as mutually exclusive selectors (like Priority), screen readers don't natively understand they are related or which is selected unless explicitly told.
**Action:** Use `role="group"` with `aria-labelledby` on the container, and `type="button"` with `aria-pressed={isSelected}` on the individual buttons to create an accessible radio-button-like experience.
