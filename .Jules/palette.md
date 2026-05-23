## 2024-05-18 - Grid Checkbox Context Labels
**Learning:** When using checkboxes within a data grid (like a habit tracker calendar), standard screen readers will only announce "checkbox, unchecked" without reading the row/column headers. This leaves the user with no context of what action they are taking.
**Action:** Always provide explicit row and column context in the `aria-label` for grid inputs (e.g. `aria-label="Toggle Morning Run on Monday, May 20"`).
