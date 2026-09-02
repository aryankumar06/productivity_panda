## 2024-05-15 - Explicit Context in Data Grid Checkboxes
**Learning:** Checkboxes within a data grid without explicit context in their aria-label can be confusing for screen reader users as they lack spatial context.
**Action:** When using checkboxes within a data grid, always provide explicit row and column context in the aria-label (e.g., `aria-label="Toggle [Row] on [Column]"`) so screen readers can announce the context.

## 2026-06-08 - Explicit Context for Icon-Only Action Buttons in Lists
**Learning:** Icon-only action buttons (like Delete) in nested lists or trees without the item's context in the aria-label are ambiguous to screen reader users.
**Action:** When adding icon-only action buttons to items in lists, always include the specific item's title in the `aria-label` (e.g., `aria-label="Delete task: [Task Title]"`) to provide explicit context.
## 2024-11-20 - Disclosure Widget States
**Learning:** Collapsible form sections triggered by a button can confuse screen reader users if they do not announce their expanded state and controlled relationship.
**Action:** When building collapsible sections or disclosure widgets (e.g., an expanding form toggled by a button), always use the `aria-expanded` attribute on the trigger button to indicate state, and the `aria-controls` attribute pointing to the controlled element's `id`.

## 2024-11-20 - Custom Button Groups
**Learning:** Custom UI toggles (like "List" vs "Plan" view toggles) that function as mutually exclusive selectors lack semantic meaning without appropriate ARIA roles.
**Action:** For custom button groups functioning as selectors, use `role="group"` and `aria-label` or `aria-labelledby` on the group container, indicate the selected state using `aria-pressed` on the individual buttons, ensure they have `type="button"`, and include explicit `focus-visible` styles for keyboard navigability.
