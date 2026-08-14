## 2024-05-15 - Explicit Context in Data Grid Checkboxes
**Learning:** Checkboxes within a data grid without explicit context in their aria-label can be confusing for screen reader users as they lack spatial context.
**Action:** When using checkboxes within a data grid, always provide explicit row and column context in the aria-label (e.g., `aria-label="Toggle [Row] on [Column]"`) so screen readers can announce the context.

## 2026-06-08 - Explicit Context for Icon-Only Action Buttons in Lists
**Learning:** Icon-only action buttons (like Delete) in nested lists or trees without the item's context in the aria-label are ambiguous to screen reader users.
**Action:** When adding icon-only action buttons to items in lists, always include the specific item's title in the `aria-label` (e.g., `aria-label="Delete task: [Task Title]"`) to provide explicit context.
## 2024-05-18 - Accessible Mutually Exclusive Selectors
**Learning:** React component toggle groups built with `div` and custom buttons require `role="group"`, an `aria-label`, and `aria-pressed` states on the inner buttons to convey structure and state to screen readers.
**Action:** When implementing custom segmented controls or view toggles, consistently apply `role="group"`, label the group container, use `aria-pressed` on the option buttons, add `type="button"`, and ensure visible focus states (`focus-visible`).
