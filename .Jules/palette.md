## 2024-05-15 - Explicit Context in Data Grid Checkboxes
**Learning:** Checkboxes within a data grid without explicit context in their aria-label can be confusing for screen reader users as they lack spatial context.
**Action:** When using checkboxes within a data grid, always provide explicit row and column context in the aria-label (e.g., `aria-label="Toggle [Row] on [Column]"`) so screen readers can announce the context.

## 2026-06-08 - Explicit Context for Icon-Only Action Buttons in Lists
**Learning:** Icon-only action buttons (like Delete) in nested lists or trees without the item's context in the aria-label are ambiguous to screen reader users.
**Action:** When adding icon-only action buttons to items in lists, always include the specific item's title in the `aria-label` (e.g., `aria-label="Delete task: [Task Title]"`) to provide explicit context.
## $(date +%Y-%m-%d) - View Mode Toggle Accessibility Improvement
**Learning:** For custom view toggle button groups (e.g., list vs plan view), they function as mutually exclusive selectors and need proper ARIA attributes to be fully accessible to screen readers, instead of just simple styled buttons.
**Action:** Always add `role="group"` and `aria-label` to the container, and use `aria-pressed={true/false}` on the individual buttons to indicate the selected state. Also ensure `type="button"` is used and focus states (`focus-visible`) are clearly defined for keyboard navigation.
