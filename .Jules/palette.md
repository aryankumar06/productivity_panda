## 2024-05-15 - Explicit Context in Data Grid Checkboxes
**Learning:** Checkboxes within a data grid without explicit context in their aria-label can be confusing for screen reader users as they lack spatial context.
**Action:** When using checkboxes within a data grid, always provide explicit row and column context in the aria-label (e.g., `aria-label="Toggle [Row] on [Column]"`) so screen readers can announce the context.

## 2026-06-08 - Explicit Context for Icon-Only Action Buttons in Lists
**Learning:** Icon-only action buttons (like Delete) in nested lists or trees without the item's context in the aria-label are ambiguous to screen reader users.
**Action:** When adding icon-only action buttons to items in lists, always include the specific item's title in the `aria-label` (e.g., `aria-label="Delete task: [Task Title]"`) to provide explicit context.
## 2024-05-18 - Collapsible Sections and Disclosure Widgets Accessibility
**Learning:** Collapsible sections or disclosure widgets without the proper ARIA attributes make it hard for screen reader users to understand the state and relationship of the elements.
**Action:** When building collapsible sections or disclosure widgets (e.g., an expanding form toggled by a button), always use the `aria-expanded` attribute on the trigger button to indicate state, and the `aria-controls` attribute pointing to the controlled element's `id`.
