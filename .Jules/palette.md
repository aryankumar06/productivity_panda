## 2024-05-15 - Explicit Context in Data Grid Checkboxes
**Learning:** Checkboxes within a data grid without explicit context in their aria-label can be confusing for screen reader users as they lack spatial context.
**Action:** When using checkboxes within a data grid, always provide explicit row and column context in the aria-label (e.g., `aria-label="Toggle [Row] on [Column]"`) so screen readers can announce the context.

## 2026-06-08 - Explicit Context for Icon-Only Action Buttons in Lists
**Learning:** Icon-only action buttons (like Delete) in nested lists or trees without the item's context in the aria-label are ambiguous to screen reader users.
**Action:** When adding icon-only action buttons to items in lists, always include the specific item's title in the `aria-label` (e.g., `aria-label="Delete task: [Task Title]"`) to provide explicit context.
## 2026-08-17 - Custom Button Groups Need Proper ARIA Context\n**Learning:** When building custom segmented controls or priority selectors with multiple <button> elements, standard visual cues (like background colors) are invisible to screen readers. We must wrap the buttons in a container with role="group" and aria-labelledby pointing to the section label, and use aria-pressed on individual buttons to communicate selection state.\n**Action:** Always verify custom button group implementations include role="group", aria-labelledby, and aria-pressed attributes.
