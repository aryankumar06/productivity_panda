## 2024-05-15 - Explicit Context in Data Grid Checkboxes
**Learning:** Checkboxes within a data grid without explicit context in their aria-label can be confusing for screen reader users as they lack spatial context.
**Action:** When using checkboxes within a data grid, always provide explicit row and column context in the aria-label (e.g., `aria-label="Toggle [Row] on [Column]"`) so screen readers can announce the context.

## 2026-06-08 - Explicit Context for Icon-Only Action Buttons in Lists
**Learning:** Icon-only action buttons (like Delete) in nested lists or trees without the item's context in the aria-label are ambiguous to screen reader users.
**Action:** When adding icon-only action buttons to items in lists, always include the specific item's title in the `aria-label` (e.g., `aria-label="Delete task: [Task Title]"`) to provide explicit context.

## 2026-09-26 - Add Project Form Accessibility Improvements
**Learning:** Disclosure widgets (like 'Add Project') must explicitly link the trigger to the content using `aria-controls` matching the target's `id` and `aria-expanded` state. Additionally, custom radio-group style button groups require `role="group"`, `aria-labelledby` referencing the group's visual label, and `aria-pressed` on the active button to accurately convey meaning to screen readers. Finally, all interactive buttons must have clear `focus-visible` styling (with `focus-visible:outline-none` to prevent conflicts) and `type="button"` on non-submit buttons within or acting like forms to prevent unintentional submissions and ensure keyboard navigability.
**Action:** When building collapsible forms or custom button selection groups, always include these specific ARIA attributes (`aria-controls`, `aria-expanded`, `role="group"`, `aria-labelledby`, `aria-pressed`) and explicitly add `focus-visible` styles with `outline-none` and explicit `type="button"` declarations.
## 2026-10-14 - Adding ARIA label to Icon-Only Buttons
**Learning:** Found an icon-only close button ('✕') without an accessible label. Screen readers might misinterpret this symbol (e.g., as 'multiplication X') or ignore it completely, making it unclear to visually impaired users what the button does.
**Action:** Always add descriptive `aria-label` attributes to buttons that rely solely on icons or symbols for their visual meaning to improve accessibility and screen reader support.
