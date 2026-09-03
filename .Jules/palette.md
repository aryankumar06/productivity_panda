## 2024-05-15 - Explicit Context in Data Grid Checkboxes
**Learning:** Checkboxes within a data grid without explicit context in their aria-label can be confusing for screen reader users as they lack spatial context.
**Action:** When using checkboxes within a data grid, always provide explicit row and column context in the aria-label (e.g., `aria-label="Toggle [Row] on [Column]"`) so screen readers can announce the context.

## 2026-06-08 - Explicit Context for Icon-Only Action Buttons in Lists
**Learning:** Icon-only action buttons (like Delete) in nested lists or trees without the item's context in the aria-label are ambiguous to screen reader users.
**Action:** When adding icon-only action buttons to items in lists, always include the specific item's title in the `aria-label` (e.g., `aria-label="Delete task: [Task Title]"`) to provide explicit context.

## 2024-10-25 - Interactive Toggle States
**Learning:** Disclosure widgets (like Add Task/Comments) and custom button groups (View Mode) require explicit `aria-expanded` or `aria-pressed` state bindings to be perceivable by screen readers. Relying only on visual changes hides state from assistive tech.
**Action:** Always bind `aria-expanded` to boolean visibility states for collapsible panels and `aria-pressed` for custom toggle groups, along with matching `focus-visible` styles.
