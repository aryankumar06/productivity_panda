## 2024-05-15 - Explicit Context in Data Grid Checkboxes
**Learning:** Checkboxes within a data grid without explicit context in their aria-label can be confusing for screen reader users as they lack spatial context.
**Action:** When using checkboxes within a data grid, always provide explicit row and column context in the aria-label (e.g., `aria-label="Toggle [Row] on [Column]"`) so screen readers can announce the context.

## 2024-05-16 - Contextual Action Buttons in Hierarchical Lists
**Learning:** Icon-only action buttons (like Delete or Expand) in nested lists without item-specific context in their aria-label confuse screen reader users. They hear "Delete" multiple times without knowing what they are deleting.
**Action:** When adding actions to list or tree items, always include the item's title in the aria-label (e.g., `aria-label={`Delete task: ${task.title}`}`) to provide explicit context.
