## 2024-05-25 - Explicit Context for Checkboxes in Data Grids
**Learning:** Screen readers often lose context when navigating inputs within complex tabular structures or data grids (like habit trackers), leading to ambiguous announcements like "checkbox, unchecked".
**Action:** When using checkboxes or inputs within a data grid, always provide explicit row and column context in the `aria-label` (e.g., `aria-label="Toggle [Row] on [Column]"`) so screen readers can announce the context without relying on table headers.
