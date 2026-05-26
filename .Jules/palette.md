## 2026-05-26 - Explicit Data Grid Context for Screen Readers
**Learning:** When using checkboxes or interactive elements within a data grid without text labels, screen readers may fail to announce the specific cell context, leading to confusion about which row/column is being toggled.
**Action:** Always provide explicit row and column context in the `aria-label` (e.g., `aria-label="Toggle [Row] on [Column]"`) for interactive elements within tables or data grids.
