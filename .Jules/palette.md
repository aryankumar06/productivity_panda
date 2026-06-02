## 2026-06-02 - Data Grid Checkbox Context
**Learning:** Screen readers cannot easily infer the context of inputs inside a data grid without explicit associations, especially for dynamic rows and columns (e.g. habits vs days).
**Action:** When using checkboxes or inputs within a data grid, always provide explicit row and column context in the `aria-label` (e.g., `aria-label="Toggle [Row] on [Column]"`) so screen readers can accurately announce the context.
