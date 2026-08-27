## 2024-05-15 - Explicit Context in Data Grid Checkboxes
**Learning:** Checkboxes within a data grid without explicit context in their aria-label can be confusing for screen reader users as they lack spatial context.
**Action:** When using checkboxes within a data grid, always provide explicit row and column context in the aria-label (e.g., `aria-label="Toggle [Row] on [Column]"`) so screen readers can announce the context.

## 2026-06-08 - Explicit Context for Icon-Only Action Buttons in Lists
**Learning:** Icon-only action buttons (like Delete) in nested lists or trees without the item's context in the aria-label are ambiguous to screen reader users.
**Action:** When adding icon-only action buttons to items in lists, always include the specific item's title in the `aria-label` (e.g., `aria-label="Delete task: [Task Title]"`) to provide explicit context.
## 2024-08-27 - Priority Selector Accessibility\n**Learning:** Custom button groups used for mutually exclusive selection (like priority) need manual accessibility scaffolding. They lack native `fieldset`/`legend` semantics and don't automatically communicate selected state to screen readers or handle focus states consistently.\n**Action:** Always wrap custom button selectors in a `role="group"` with an `aria-label`. Ensure individual buttons have `type="button"`, use `aria-pressed` for selected state, and implement `focus-visible` utility classes for clear keyboard navigation indicators.
