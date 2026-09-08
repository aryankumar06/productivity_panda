## 2024-05-15 - Explicit Context in Data Grid Checkboxes
**Learning:** Checkboxes within a data grid without explicit context in their aria-label can be confusing for screen reader users as they lack spatial context.
**Action:** When using checkboxes within a data grid, always provide explicit row and column context in the aria-label (e.g., `aria-label="Toggle [Row] on [Column]"`) so screen readers can announce the context.

## 2026-06-08 - Explicit Context for Icon-Only Action Buttons in Lists
**Learning:** Icon-only action buttons (like Delete) in nested lists or trees without the item's context in the aria-label are ambiguous to screen reader users.
**Action:** When adding icon-only action buttons to items in lists, always include the specific item's title in the `aria-label` (e.g., `aria-label="Delete task: [Task Title]"`) to provide explicit context.
## 2026-09-08 - Focus Visible Accessibility for Nested Toggles
**Learning:** When using hierarchical lists with expand/collapse buttons or inline add actions, simple hover styles aren't enough. Screen readers need contextual `aria-label` (since icon-only or generic "Task" text lacks context), `aria-expanded` for disclosure widgets, and keyboard users need explicit focus indicators (e.g., `focus-visible:ring-2`).
**Action:** Always add contextual `aria-label` (e.g. "Add task to project: [name]") and `focus-visible:ring-2` outline classes to interactive UI elements in deeply nested lists.
