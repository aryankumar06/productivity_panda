## 2024-05-15 - Explicit Context in Data Grid Checkboxes
**Learning:** Checkboxes within a data grid without explicit context in their aria-label can be confusing for screen reader users as they lack spatial context.
**Action:** When using checkboxes within a data grid, always provide explicit row and column context in the aria-label (e.g., `aria-label="Toggle [Row] on [Column]"`) so screen readers can announce the context.

## 2026-06-08 - Explicit Context for Icon-Only Action Buttons in Lists
**Learning:** Icon-only action buttons (like Delete) in nested lists or trees without the item's context in the aria-label are ambiguous to screen reader users.
**Action:** When adding icon-only action buttons to items in lists, always include the specific item's title in the `aria-label` (e.g., `aria-label="Delete task: [Task Title]"`) to provide explicit context.
## 2024-05-19 - Icon-only Buttons in Modals
**Learning:** Found an icon-only `<button>` containing a `<X />` icon (used for closing a modal) in `WorkspaceView.tsx` that lacked an `aria-label`. This pattern of missing ARIA labels on close buttons is a common accessibility oversight that prevents screen readers from understanding the button's purpose.
**Action:** Always verify that every `<button>` lacking textual content, especially those used for common actions like closing modals (e.g., those containing an `<X />` or `CloseIcon`), explicitly includes a descriptive `aria-label` (e.g., `aria-label="Close modal"`).
